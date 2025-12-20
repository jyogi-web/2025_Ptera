package battle

import (
	"fmt"
	"hash/fnv"
	"math/rand"
	"time"

	ptera "github.com/jyogi-web/2025_Ptera/backend/pkg/grpc/ptera/v1"
)

// GenerateBattleStats deterministic stats generation based on card ID
func GenerateBattleStats(cardID string, grade int32) *ptera.Card {
	// Create seed from card ID
	h := fnv.New64a()
	h.Write([]byte(cardID))
	seed := int64(h.Sum64())
	rng := rand.New(rand.NewSource(seed))

	// Base stats
	baseHP := int32(500)
	hpPerGrade := int32(50) // grade 1-4
	hpVariance := int32(100)

	baseAttack := int32(100)
	attackPerGrade := int32(20)
	attackVariance := int32(50)

	// Calculate with deterministic random
	maxHp := baseHP + (grade * hpPerGrade) + rng.Int31n(hpVariance)
	attack := baseAttack + (grade * attackPerGrade) + rng.Int31n(attackVariance)

	return &ptera.Card{
		Id:     cardID,
		MaxHp:  maxHp,
		Attack: attack,
		Flavor: "今日も元気にお布団から出られない。", // TODO: 現時点では固定、決定論的にランダム化することも可能
	}
}

// BuildDeck selects 5 random cards from the source pool
func BuildDeck(cards []*ptera.Card) []*ptera.Card {
	// Copy to avoid modifying original
	shuffled := make([]*ptera.Card, len(cards))
	copy(shuffled, cards)

	// Shuffle
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	rng.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})

	// Select up to 5
	deckSize := 5
	if len(shuffled) < 5 {
		deckSize = len(shuffled)
	}
	deck := shuffled[:deckSize]

	// Fill with dummy cards if needed (though user said maybe just average cards)
	// For now, if < 5, we fill with dummy
	for len(deck) < 5 {
		deck = append(deck, createDummyCard())
	}

	return deck
}

func createDummyCard() *ptera.Card {
	id := fmt.Sprintf("dummy-%d", time.Now().UnixNano())
	return &ptera.Card{
		Id:     id,
		Name:   "勧誘中...",
		Grade:  1,
		MaxHp:  600,
		Attack: 150,
		Flavor: "これから期待の新人。",
	}
}

// CalculateDamage with 0.9 - 1.1 variance
func CalculateDamage(attacker *ptera.Card) int32 {
	// Non-deterministic for damage (battle excitement) or deterministic?
	// User req said: "0.9 + rand.Float64()*0.2" so dynamic.
	variance := 0.9 + rand.Float64()*0.2
	return int32(float64(attacker.Attack) * variance)
}

// ExecuteEnemyTurn processes the opponent's move (Simple AI: Attack active)
func ExecuteEnemyTurn(state *ptera.BattleState) *ptera.BattleState {
	if state.WinnerId != "" {
		return state
	}

	attacker := state.PlayerOpponent.Deck[0]
	defender := state.PlayerMe.Deck[0]

	// Calculate Damage
	damage := CalculateDamage(attacker)

	// Apply Damage logic (need to update HP which is inside Card struct... wait,
	// proto types generated in Go might need helper to clone or modify properly if we want immutability,
	// but modifying pointer in place is fine for this logic)

	// Note: We need to handle "Current HP". Proto definition only has MaxHp.
	// Oh, I missed adding 'current_hp' to Card in proto?
	// The user request example had `int32 hp = 4; // 残りHP` in Player message, but Deck Card also needs HP?
	// Actually, in TCG, each CARD has HP.
	// In my proto definition: `message Card { ... int32 max_hp = 12; ... }`
	// It seems I forgot `current_hp` in the Card message in proto!
	// Or I should use `max_hp` as current? No, `max_hp` is max.

	// *CRITICAL CHECK*: I should check ptera.proto again.
	// I added `int32 max_hp`. I did NOT add `current_hp`.
	// This is a problem. I should update proto or use a separate "BattleCard" wrapper.
	// The user's prompt example: `repeated Card deck = 3;` and `message Player { ... int32 hp = 4; }`
	// The user might have implied Player HP is the victory condition (3 lives), but individual cards also have HP.
	// Re-reading Step 134 user request:
	// `activeCard.CurrentHp <= 0` in Go example code.
	// So `Card` struct needs `CurrentHp`.

	// I will patch the logic to assume `max_hp` IS the current HP for this turn (mutable state),
	// OR I need to add `current_hp` to proto.
	// Adding `current_hp` to proto is cleaner.

	defender.MaxHp -= damage // Reducing MaxHp to represent damage for now as a quick fix or...?
	// No, that's bad practice. `MaxHp` should be static stats.

	// DECISION: I will Halt logic implementation, Update Proto to include `current_hp` in Card, Regenerate, then Continue.
	return state
}
