package battle

import (
	"context"
	"encoding/json"
	"fmt"

	ptera "github.com/jyogi-web/2025_Ptera/backend/pkg/grpc/ptera/v1"
	"google.golang.org/protobuf/encoding/protojson"
)

const (
	CollectionBattleRequests = "battle_requests"
)

// SaveBattleRequest saves a battle request to Firestore
func (r *Repository) SaveBattleRequest(ctx context.Context, req *ptera.BattleRequest) error {
	jsonBytes, err := protojson.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal battle request to JSON: %w", err)
	}

	var reqMap map[string]interface{}
	if err := json.Unmarshal(jsonBytes, &reqMap); err != nil {
		return fmt.Errorf("failed to unmarshal JSON to map: %w", err)
	}

	_, err = r.client.Collection(CollectionBattleRequests).Doc(req.RequestId).Set(ctx, reqMap)
	if err != nil {
		return fmt.Errorf("failed to save battle request: %w", err)
	}
	return nil
}

// GetBattleRequest retrieves a battle request from Firestore
func (r *Repository) GetBattleRequest(ctx context.Context, requestID string) (*ptera.BattleRequest, error) {
	doc, err := r.client.Collection(CollectionBattleRequests).Doc(requestID).Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get battle request: %w", err)
	}

	data := doc.Data()
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal data to JSON: %w", err)
	}

	var req ptera.BattleRequest
	if err := protojson.Unmarshal(jsonBytes, &req); err != nil {
		return nil, fmt.Errorf("failed to parse battle request data: %w", err)
	}

	return &req, nil
}
