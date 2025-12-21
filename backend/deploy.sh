#!/bin/bash
set -e

PROJECT_ID="ptera-481818"
REGION="asia-northeast1"
SERVICE_NAME="ptera-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Ensure we are in the script's directory to find .env.local
cd "$(dirname "$0")"

# Read environment variables from .env.local (Robust sourcing strategy)
if [ ! -f .env.local ]; then
    echo "Error: .env.local not found. Please create it with GEMINI_API_KEY and FIREBASE_SERVICE_ACCOUNT_KEY."
    exit 1
fi

# Load variables by sourcing the file
if [ -f .env.local ]; then
    set -a
    source .env.local
    set +a
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "Error: GEMINI_API_KEY is not set in .env.local"
    exit 1
fi

if [ -z "$FIREBASE_SERVICE_ACCOUNT_KEY" ]; then
    echo "Error: FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env.local"
    exit 1
fi

# Escape logic removed - using env-vars-file approach for safety

echo "Deploying to Project: ${PROJECT_ID}, Region: ${REGION}"

# 1. Enable necessary services (idempotent)
echo "Enabling necessary APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com --project ${PROJECT_ID}

# 2. Build image using Cloud Build
echo "Building container image..."
gcloud builds submit --tag ${IMAGE_NAME} --project ${PROJECT_ID} .

# 3. Create temporary env vars file to avoid escaping issues with JSON
cat <<EOF > env_vars.yaml
GEMINI_API_KEY: "${GEMINI_API_KEY}"
FIREBASE_SERVICE_ACCOUNT_KEY: '${FIREBASE_SERVICE_ACCOUNT_KEY}'
GOOGLE_CLOUD_PROJECT: "${PROJECT_ID}"
EOF

# 4. Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --project ${PROJECT_ID} \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --use-http2 \
    --env-vars-file env_vars.yaml

# Cleanup
rm env_vars.yaml

echo "Deployment complete!"
