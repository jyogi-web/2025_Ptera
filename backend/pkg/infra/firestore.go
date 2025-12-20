package infra

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

func NewFirestoreClient(ctx context.Context) (*firestore.Client, error) {
	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")

	var options []option.ClientOption

	// Check for service account key in env (Consistent with Frontend)
	if serviceAccountKey := os.Getenv("FIREBASE_SERVICE_ACCOUNT_KEY"); serviceAccountKey != "" {
		options = append(options, option.WithCredentialsJSON([]byte(serviceAccountKey)))

		// Auto-detect project ID from the key if possible
		var key struct {
			ProjectID string `json:"project_id"`
		}
		if err := json.Unmarshal([]byte(serviceAccountKey), &key); err == nil && key.ProjectID != "" {
			// Prefer the project ID from the credentials to avoid permission mismatch
			projectID = key.ProjectID
		}
	} else if credFile := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"); credFile != "" {
		// Standard ADC callback or explicit file
		options = append(options, option.WithCredentialsFile(credFile))
	}

	if projectID == "" {
		// Fallback for local development if not set
		projectID = "jyogi-cards-dev"
	}

	client, err := firestore.NewClient(ctx, projectID, options...)
	if err != nil {
		return nil, fmt.Errorf("failed to create firestore client (projectID=%s): %w", projectID, err)
	}

	return client, nil
}
