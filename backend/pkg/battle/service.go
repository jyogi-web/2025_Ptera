package battle

import (
	"context"
	"fmt"
	"math"
	"time"

	ptera "github.com/jyogi-web/2025_Ptera/backend/pkg/grpc/ptera/v1"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Service struct {
	ptera.UnimplementedBattleServiceServer
	repo     *Repository
	cardRepo *CardRepository
}

func NewService(repo *Repository, cardRepo *CardRepository) *Service {
	return &Service{
		repo:     repo,
		cardRepo: cardRepo,
	}
}

// StartBattle initializes a new battle
func (s *Service) StartBattle(ctx context.Context, req *ptera.StartBattleRequest) (*ptera.BattleState, error) {
	// Fetch real cards from Firestore
	myCards, err := s.cardRepo.GetCircleCards(ctx, req.MyCircleId)
	if err != nil {
		// If no cards found, fall back to mock cards
		fmt.Printf("Warning: No cards found for circle %s, using mock cards: %v\n", req.MyCircleId, err)
		myCards = generateMockCards(req.MyCircleId, 5)
	}

	opponentCards, err := s.cardRepo.GetCircleCards(ctx, req.OpponentCircleId)
	if err != nil {
		// If no cards found, fall back to mock cards
		fmt.Printf("Warning: No cards found for circle %s, using mock cards: %v\n", req.OpponentCircleId, err)
		opponentCards = generateMockCards(req.OpponentCircleId, 5)
	}

	// Build decks from the fetched/mock cards
	myDeck := BuildDeck(myCards)
	opponentDeck := BuildDeck(opponentCards)

	battleID := fmt.Sprintf("battle-%d", time.Now().UnixNano())

	state := &ptera.BattleState{
		BattleId: battleID,
		PlayerMe: &ptera.Player{
			PlayerId:   "me-placeholder", // Should be from Context user
			CircleId:   req.MyCircleId,
			CircleName: "My Circle", // Should fetch name
			Hp:         3,
			Deck:       myDeck,
		},
		PlayerOpponent: &ptera.Player{
			PlayerId:   "opponent-placeholder",
			CircleId:   req.OpponentCircleId,
			CircleName: "Opponent Circle", // Should fetch name
			Hp:         3,
			Deck:       opponentDeck,
		},
		CurrentTurn:     1,
		CurrentPlayerId: "me-placeholder", // Player starts
		WinnerId:        "",
		Logs:            []string{"Battle Start!"},
	}

	if err := s.repo.SaveBattle(ctx, state); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to save battle: %v", err)
	}

	return state, nil
}

func (s *Service) Attack(ctx context.Context, req *ptera.AttackRequest) (*ptera.BattleState, error) {
	state, err := s.repo.GetBattle(ctx, req.BattleId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "battle not found: %v", err)
	}

	if state.WinnerId != "" {
		return state, nil
	}

	// Validate Turn (Skipped for simplicity, assuming caller is honest for now or just checking sequence)

	attacker := state.PlayerMe.Deck[0]
	defender := state.PlayerOpponent.Deck[0]

	damage := CalculateDamage(attacker)
	defender.CurrentHp -= damage // Proto fields are mutable pointers usually? No, primitives are values.
	// Wait, access nested fields.

	// Update Defender HP
	newHp := int32(math.Max(0, float64(defender.CurrentHp)))
	state.PlayerOpponent.Deck[0].CurrentHp = newHp

	state.Logs = append([]string{fmt.Sprintf("You attacked! Deal %d damage.", damage)}, state.Logs...)

	if state.PlayerOpponent.Deck[0].CurrentHp <= 0 {
		state.Logs = append([]string{"Target KO!"}, state.Logs...)
		state.PlayerOpponent.Hp -= 1

		// Shift Deck
		if len(state.PlayerOpponent.Deck) > 1 {
			state.PlayerOpponent.Deck = state.PlayerOpponent.Deck[1:]
		} else {
			// No more cards
			state.PlayerOpponent.Hp = 0
		}

		if state.PlayerOpponent.Hp <= 0 {
			state.WinnerId = state.PlayerMe.PlayerId
			state.Logs = append([]string{"You Win!"}, state.Logs...)
			_ = s.repo.SaveBattle(ctx, state)
			return state, nil
		}
	}

	// EXECUTE ENEMY TURN
	state = ExecuteEnemyTurn(state)

	if err := s.repo.SaveBattle(ctx, state); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to save battle: %v", err)
	}

	return state, nil
}

func (s *Service) Retreat(ctx context.Context, req *ptera.RetreatRequest) (*ptera.BattleState, error) {
	state, err := s.repo.GetBattle(ctx, req.BattleId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "battle not found: %v", err)
	}

	if state.WinnerId != "" {
		return state, nil
	}

	// Swap
	deck := state.PlayerMe.Deck
	idx := int(req.BenchIndex) + 1 // +1 because [0] is active
	if idx < 1 || idx >= len(deck) {
		return nil, status.Errorf(codes.InvalidArgument, "invalid bench index")
	}

	deck[0], deck[idx] = deck[idx], deck[0]
	state.Logs = append([]string{"Retreated!"}, state.Logs...)

	// Enemy turn
	state = ExecuteEnemyTurn(state)

	if err := s.repo.SaveBattle(ctx, state); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to save battle: %v", err)
	}

	return state, nil
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
