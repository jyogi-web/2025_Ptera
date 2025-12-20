#!/bin/bash
set -e

PROJECT_ID="ptera-481818"
REGION="asia-northeast1"
SERVICE_NAME="ptera-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Read GEMINI_API_KEY from .env.local (Safe extraction)
if [ ! -f .env.local ]; then
    echo "Error: .env.local not found. Please create it with GEMINI_API_KEY and FIREBASE_SERVICE_ACCOUNT_KEY."
    exit 1
fi

GEMINI_API_KEY=$(grep '^GEMINI_API_KEY=' .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
FIREBASE_SERVICE_ACCOUNT_KEY=$(grep '^FIREBASE_SERVICE_ACCOUNT_KEY=' .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$GEMINI_API_KEY" ]; then
    echo "Error: GEMINI_API_KEY is not set in .env.local"
    exit 1
fi

if [ -z "$FIREBASE_SERVICE_ACCOUNT_KEY" ]; then
    echo "Error: FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env.local"
    exit 1
fi

echo "Deploying to Project: ${PROJECT_ID}, Region: ${REGION}"

# 1. Enable necessary services (idempotent)
echo "Enabling necessary APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com --project ${PROJECT_ID}

# 2. Build image using Cloud Build
echo "Building container image..."
gcloud builds submit --tag ${IMAGE_NAME} --project ${PROJECT_ID} .

# 3. Deploy to Cloud Run
# Note: Passing the JSON key directly as an env var requires careful escaping.
# Ideally, use Secret Manager. For simplicity here, we assume single-line string.
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --project ${PROJECT_ID} \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars GEMINI_API_KEY="${GEMINI_API_KEY}" \
    --set-env-vars FIREBASE_SERVICE_ACCOUNT_KEY="${FIREBASE_SERVICE_ACCOUNT_KEY}" \
    --set-env-vars GOOGLE_CLOUD_PROJECT="${PROJECT_ID}"

echo "Deployment complete!"
