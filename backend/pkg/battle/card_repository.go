package battle

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	ptera "github.com/jyogi-web/2025_Ptera/backend/pkg/grpc/ptera/v1"
	"google.golang.org/api/iterator"
)

const (
	CollectionCards   = "cards"
	CollectionCircles = "circles"
)

// GetCircleName retrieves the name of a circle from Firestore
func (r *CardRepository) GetCircleName(ctx context.Context, circleID string) (string, error) {
	doc, err := r.client.Collection(CollectionCircles).Doc(circleID).Get(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to get circle: %w", err)
	}
	name, ok := doc.Data()["name"].(string)
	if !ok {
		return "", fmt.Errorf("circle name is not a string")
	}
	return name, nil
}

type CardRepository struct {
	client *firestore.Client
}

func NewCardRepository(client *firestore.Client) *CardRepository {
	return &CardRepository{client: client}
}

// GetCircleCards retrieves cards for a given circle from Firestore
func (r *CardRepository) GetCircleCards(ctx context.Context, circleID string) ([]*ptera.Card, error) {
	// Query cards where circleId == circleID
	iter := r.client.Collection(CollectionCards).
		Where("circleId", "==", circleID).
		Limit(20). // Limit to 20 cards
		Documents(ctx)

	var cards []*ptera.Card
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to iterate cards: %w", err)
		}

		data := doc.Data()

		// Map Firestore document to proto Card
		card := &ptera.Card{
			Id:          doc.Ref.ID,
			Name:        getStringField(data, "name"),
			Grade:       int32(getIntField(data, "grade")),
			Position:    getStringField(data, "position"),
			Hobby:       getStringField(data, "hobby"),
			Description: getStringField(data, "description"),
			ImageUrl:    getStringField(data, "imageUrl"),
			CreatorId:   getStringField(data, "creatorId"),
		}

		// Set optional fields (pointers)
		if circleId := getStringField(data, "circleId"); circleId != "" {
			card.CircleId = &circleId
		}
		if affiliatedGroup := getStringField(data, "affiliatedGroup"); affiliatedGroup != "" {
			card.AffiliatedGroup = &affiliatedGroup
		}

		// Generate battle stats based on card ID and grade
		battleStats := GenerateBattleStats(card.Id, card.Grade)
		card.MaxHp = battleStats.MaxHp
		card.Attack = battleStats.Attack
		card.Flavor = battleStats.Flavor
		card.CurrentHp = battleStats.MaxHp // Initialize current HP to max

		cards = append(cards, card)
	}

	// If no cards found, return error
	if len(cards) == 0 {
		return nil, fmt.Errorf("no cards found for circle %s", circleID)
	}

	return cards, nil
}

// Helper functions to safely extract fields from Firestore data
func getStringField(data map[string]interface{}, field string) string {
	if val, ok := data[field]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

func getIntField(data map[string]interface{}, field string) int {
	if val, ok := data[field]; ok {
		// Firestore may return int64
		if i64, ok := val.(int64); ok {
			return int(i64)
		}
		// Or float64
		if f64, ok := val.(float64); ok {
			return int(f64)
		}
	}
	return 0
}
