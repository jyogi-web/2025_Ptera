package battle

import (
	"context"
	"fmt"
	"log/slog"
	"math"
	"time"

	ptera "github.com/jyogi-web/2025_Ptera/backend/pkg/grpc/ptera/v1"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type Service struct {
	ptera.UnimplementedBattleServiceServer
	repo               *Repository
	cardRepo           *CardRepository
	logger             *slog.Logger
	enableMockFallback bool
}

func NewService(logger *slog.Logger, repo *Repository, cardRepo *CardRepository, enableMockFallback bool) *Service {
	return &Service{
		repo:               repo,
		cardRepo:           cardRepo,
		logger:             logger,
		enableMockFallback: enableMockFallback,
	}
}

// StartBattle initializes a new battle
func (s *Service) StartBattle(ctx context.Context, req *ptera.StartBattleRequest) (*ptera.StartBattleResponse, error) {
	// Re-use the internal logic
	state, err := s.createBattle(ctx, req.MyCircleId, req.OpponentCircleId)
	if err != nil {
		return nil, err
	}
	return &ptera.StartBattleResponse{BattleState: state}, nil
}

func (s *Service) createBattle(ctx context.Context, myCircleID, opponentCircleID string) (*ptera.BattleState, error) {
	// Fetch real cards from Firestore
	myCards, err := s.cardRepo.GetCircleCards(ctx, myCircleID)
	if err != nil {
		s.logger.Error("failed to get my circle cards", "circle_id", myCircleID, "error", err)
		if !s.enableMockFallback {
			return nil, status.Errorf(codes.Internal, "failed to get cards for circle %s", myCircleID)
		}
		s.logger.Warn("falling back to mock cards for my circle", "circle_id", myCircleID)
		myCards = generateMockCards(myCircleID, 5)
	}

	opponentCards, err := s.cardRepo.GetCircleCards(ctx, opponentCircleID)
	if err != nil {
		s.logger.Error("failed to get opponent circle cards", "circle_id", opponentCircleID, "error", err)
		if !s.enableMockFallback {
			return nil, status.Errorf(codes.Internal, "failed to get cards for circle %s", opponentCircleID)
		}
		s.logger.Warn("falling back to mock cards for opponent circle", "circle_id", opponentCircleID)
		opponentCards = generateMockCards(opponentCircleID, 5)
	}

	// Fetch Circle Names
	myCircleName, err := s.cardRepo.GetCircleName(ctx, myCircleID)
	if err != nil {
		s.logger.Warn("failed to get my circle name", "circle_id", myCircleID, "error", err)
		myCircleName = "Circle " + myCircleID
	}
	opponentCircleName, err := s.cardRepo.GetCircleName(ctx, opponentCircleID)
	if err != nil {
		s.logger.Warn("failed to get opponent circle name", "circle_id", opponentCircleID, "error", err)
		opponentCircleName = "Circle " + opponentCircleID
	}

	// Build decks from the fetched/mock cards
	myDeck := BuildDeck(myCards)
	opponentDeck := BuildDeck(opponentCards)

	battleID := fmt.Sprintf("battle-%d", time.Now().UnixNano())

	state := &ptera.BattleState{
		BattleId: battleID,
		PlayerMe: &ptera.Player{
			PlayerId:   myCircleID, // Use CircleID as PlayerID for matching
			CircleId:   myCircleID,
			CircleName: myCircleName,
			Hp:         3,
			Deck:       myDeck,
		},
		PlayerOpponent: &ptera.Player{
			PlayerId:   opponentCircleID, // Use CircleID as PlayerID
			CircleId:   opponentCircleID,
			CircleName: opponentCircleName,
			Hp:         3,
			Deck:       opponentDeck,
		},
		CurrentTurn:     1,
		CurrentPlayerId: myCircleID, // Player starts
		WinnerId:        "",
		Logs:            []string{"Battle Start!"},
	}

	if err := s.repo.SaveBattle(ctx, state); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to save battle: %v", err)
	}

	return state, nil
}

func (s *Service) SendBattleRequest(ctx context.Context, req *ptera.SendBattleRequestRequest) (*ptera.BattleRequest, error) {
	if req.FromCircleId == "" || req.ToCircleId == "" {
		return nil, status.Error(codes.InvalidArgument, "circle IDs required")
	}

	// Fetch Circle Names
	fromCircleName, err := s.cardRepo.GetCircleName(ctx, req.FromCircleId)
	if err != nil {
		// Fallback or error? Fallback to ID for robustness
		fmt.Printf("Warning: failed to get from circle name: %v\n", err)
		fromCircleName = "Circle " + req.FromCircleId
	}
	toCircleName, err := s.cardRepo.GetCircleName(ctx, req.ToCircleId)
	if err != nil {
		fmt.Printf("Warning: failed to get to circle name: %v\n", err)
		toCircleName = "Circle " + req.ToCircleId
	}

	requestID := fmt.Sprintf("req-%d", time.Now().UnixNano())

	battleReq := &ptera.BattleRequest{
		RequestId:      requestID,
		FromCircleId:   req.FromCircleId,
		ToCircleId:     req.ToCircleId,
		FromCircleName: fromCircleName,
		ToCircleName:   toCircleName,
		Status:         "pending",
		CreatedAt:      timestamppb.Now(),
		BattleId:       nil,
	}

	if err := s.repo.SaveBattleRequest(ctx, battleReq); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to save request: %v", err)
	}

	return battleReq, nil
}

func (s *Service) AcceptBattleRequest(ctx context.Context, req *ptera.AcceptBattleRequestRequest) (*ptera.BattleState, error) {
	battleReq, err := s.repo.GetBattleRequest(ctx, req.RequestId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "request not found: %v", err)
	}

	if battleReq.Status != "pending" {
		return nil, status.Errorf(codes.FailedPrecondition, "request is not pending")
	}

	// Create Battle
	battleState, err := s.createBattle(ctx, battleReq.FromCircleId, battleReq.ToCircleId)
	if err != nil {
		return nil, err
	}

	// Update Request
	battleReq.Status = "accepted"
	battleID := battleState.BattleId
	battleReq.BattleId = &battleID

	if err := s.repo.SaveBattleRequest(ctx, battleReq); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update request: %v", err)
	}

	return battleState, nil
}

func (s *Service) RejectBattleRequest(ctx context.Context, req *ptera.RejectBattleRequestRequest) (*ptera.BattleRequest, error) {
	battleReq, err := s.repo.GetBattleRequest(ctx, req.RequestId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "request not found: %v", err)
	}

	if battleReq.Status != "pending" {
		return nil, status.Errorf(codes.FailedPrecondition, "request is not pending")
	}

	battleReq.Status = "rejected"
	if err := s.repo.SaveBattleRequest(ctx, battleReq); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update request: %v", err)
	}

	return battleReq, nil
}

func (s *Service) Attack(ctx context.Context, req *ptera.AttackRequest) (*ptera.AttackResponse, error) {
	fmt.Printf("Attack called: BattleId=%s, PlayerId=%s\n", req.BattleId, req.PlayerId) // DEBUG
	state, err := s.repo.GetBattle(ctx, req.BattleId)
	if err != nil {
		fmt.Printf("Attack error: battle not found: %v\n", err) // DEBUG
		return nil, status.Errorf(codes.NotFound, "battle not found: %v", err)
	}

	if state.WinnerId != "" {
		return &ptera.AttackResponse{BattleState: state}, nil
	}

	// Validate Turn
	if req.PlayerId != state.CurrentPlayerId {
		fmt.Printf("Attack error: not turn. Current=%s, Req=%s\n", state.CurrentPlayerId, req.PlayerId) // DEBUG
		return nil, status.Errorf(codes.FailedPrecondition, "not your turn (current: %s, you: %s)", state.CurrentPlayerId, req.PlayerId)
	}

	// Identify Attacker and Defender
	var attackerCard *ptera.Card
	var defenderCard *ptera.Card
	var defenderPlayer *ptera.Player
	var attackerPlayer *ptera.Player

	if req.PlayerId == state.PlayerMe.PlayerId {
		attackerPlayer = state.PlayerMe
		defenderPlayer = state.PlayerOpponent
	} else if req.PlayerId == state.PlayerOpponent.PlayerId {
		attackerPlayer = state.PlayerOpponent
		defenderPlayer = state.PlayerMe
	} else {
		fmt.Printf("Attack error: player invalid. Me=%s, Opp=%s, Req=%s\n", state.PlayerMe.PlayerId, state.PlayerOpponent.PlayerId, req.PlayerId) // DEBUG
		return nil, status.Errorf(codes.InvalidArgument, "player not in battle: %s", req.PlayerId)
	}

	if len(attackerPlayer.Deck) == 0 || len(defenderPlayer.Deck) == 0 {
		return &ptera.AttackResponse{BattleState: state}, nil
	}

	attackerCard = attackerPlayer.Deck[0]
	defenderCard = defenderPlayer.Deck[0]

	damage := CalculateDamage(attackerCard)
	defenderCard.CurrentHp -= damage

	// Update Defender HP
	newHp := int32(math.Max(0, float64(defenderCard.CurrentHp)))

	// In PvP, "You" is relative. Logs should use Names.
	attackerName := attackerPlayer.CircleName
	defenderName := defenderPlayer.CircleName

	state.Logs = append([]string{fmt.Sprintf("%s attacked! Deal %d damage to %s.", attackerName, damage, defenderName)}, state.Logs...)

	defenderCard.CurrentHp = newHp // explicitly set back just in case

	if defenderCard.CurrentHp <= 0 {
		state.Logs = append([]string{fmt.Sprintf("%s's card KO!", defenderName)}, state.Logs...)
		defenderPlayer.Hp -= 1

		// Shift Deck
		if len(defenderPlayer.Deck) > 1 {
			defenderPlayer.Deck = defenderPlayer.Deck[1:]
		} else {
			// No more cards
			defenderPlayer.Hp = 0
		}

		if defenderPlayer.Hp <= 0 {
			state.WinnerId = attackerPlayer.PlayerId
			state.Logs = append([]string{fmt.Sprintf("%s Wins!", attackerName)}, state.Logs...)
			if err := s.repo.SaveBattle(ctx, state); err != nil {
				fmt.Printf("Attack error: failed to save battle (win): %v\n", err) // DEBUG
				return nil, status.Errorf(codes.Internal, "failed to save battle: %v", err)
			}
			return &ptera.AttackResponse{BattleState: state}, nil
		}
	}

	// Switch Turn
	state.CurrentPlayerId = defenderPlayer.PlayerId
	state.Logs = append([]string{fmt.Sprintf("Turn Change: %s's Turn", defenderPlayer.CircleName)}, state.Logs...)

	if err := s.repo.SaveBattle(ctx, state); err != nil {
		fmt.Printf("Attack error: failed to save battle (end): %v\n", err) // DEBUG
		return nil, status.Errorf(codes.Internal, "failed to save battle: %v", err)
	}

	return &ptera.AttackResponse{BattleState: state}, nil
}

func (s *Service) Retreat(ctx context.Context, req *ptera.RetreatRequest) (*ptera.RetreatResponse, error) {
	state, err := s.repo.GetBattle(ctx, req.BattleId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "battle not found: %v", err)
	}

	if state.WinnerId != "" {
		return &ptera.RetreatResponse{BattleState: state}, nil
	}

	// Validate Turn
	if req.PlayerId != state.CurrentPlayerId {
		return nil, status.Errorf(codes.FailedPrecondition, "not your turn (current: %s, you: %s)", state.CurrentPlayerId, req.PlayerId)
	}

	var player *ptera.Player
	var opponent *ptera.Player

	if req.PlayerId == state.PlayerMe.PlayerId {
		player = state.PlayerMe
		opponent = state.PlayerOpponent
	} else if req.PlayerId == state.PlayerOpponent.PlayerId {
		player = state.PlayerOpponent
		opponent = state.PlayerMe
	} else {
		return nil, status.Errorf(codes.InvalidArgument, "player not in battle")
	}

	// Swap
	deck := player.Deck
	idx := int(req.BenchIndex) + 1 // +1 because [0] is active
	if idx < 1 || idx >= len(deck) {
		return nil, status.Errorf(codes.InvalidArgument, "invalid bench index")
	}

	deck[0], deck[idx] = deck[idx], deck[0]
	state.Logs = append([]string{fmt.Sprintf("%s Retreated!", player.CircleName)}, state.Logs...)

	// Switch Turn
	state.CurrentPlayerId = opponent.PlayerId
	state.Logs = append([]string{fmt.Sprintf("Turn Change: %s's Turn", opponent.CircleName)}, state.Logs...)

	if err := s.repo.SaveBattle(ctx, state); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to save battle: %v", err)
	}

	return &ptera.RetreatResponse{BattleState: state}, nil
}

func generateMockCards(prefix string, count int) []*ptera.Card {
	cards := make([]*ptera.Card, count)
	for i := 0; i < count; i++ {
		cards[i] = GenerateBattleStats(fmt.Sprintf("%s-card-%d", prefix, i), 1)
		cards[i].Name = fmt.Sprintf("Card %d", i)
		cards[i].CurrentHp = cards[i].MaxHp // Initialize CurrentHP
	}
	return cards
}
