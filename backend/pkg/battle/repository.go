package battle

import (
	"context"
	"encoding/json"
	"fmt"

	"cloud.google.com/go/firestore"
	ptera "github.com/jyogi-web/2025_Ptera/backend/pkg/grpc/ptera/v1"
	"google.golang.org/protobuf/encoding/protojson"
)

const (
	CollectionBattles = "battles"
)

type Repository struct {
	client *firestore.Client
}

func NewRepository(client *firestore.Client) *Repository {
	return &Repository{client: client}
}

// SaveBattle saves the battle state to Firestore
func (r *Repository) SaveBattle(ctx context.Context, battle *ptera.BattleState) error {
	// Convert protobuf to JSON with proper field naming (camelCase)
	jsonBytes, err := protojson.Marshal(battle)
	if err != nil {
		return fmt.Errorf("failed to marshal battle to JSON: %w", err)
	}

	// Convert JSON to map for Firestore
	var battleMap map[string]interface{}
	if err := json.Unmarshal(jsonBytes, &battleMap); err != nil {
		return fmt.Errorf("failed to unmarshal JSON to map: %w", err)
	}

	_, err = r.client.Collection(CollectionBattles).Doc(battle.BattleId).Set(ctx, battleMap)
	if err != nil {
		return fmt.Errorf("failed to save battle: %w", err)
	}
	return nil
}

// GetBattle retrieves a battle state from Firestore
func (r *Repository) GetBattle(ctx context.Context, battleID string) (*ptera.BattleState, error) {
	doc, err := r.client.Collection(CollectionBattles).Doc(battleID).Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get battle: %w", err)
	}

	// Convert Firestore document to JSON
	data := doc.Data()
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal data to JSON: %w", err)
	}

	// Convert JSON to protobuf
	var battle ptera.BattleState
	if err := protojson.Unmarshal(jsonBytes, &battle); err != nil {
		return nil, fmt.Errorf("failed to parse battle data: %w", err)
	}

	return &battle, nil
}
