#!/bin/bash
set -e

PROJECT_ID="ptera-481818"
REGION="asia-northeast1"
SERVICE_NAME="ptera-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Starting cleanup for Project: ${PROJECT_ID}"

# 1. Delete Cloud Run Service
echo "Deleting Cloud Run service: ${SERVICE_NAME}..."
gcloud run services delete ${SERVICE_NAME} \
    --project ${PROJECT_ID} \
    --region ${REGION} \
    --quiet

# 2. Delete Container Images
# This deletes the specific image name. If you have many builds, you might want to delete specifically or use lifecycle policies.
# --force-delete-tags deletes all tags associated with the image digest, ensuring cleanup.
echo "Deleting container images: ${IMAGE_NAME}..."
gcloud container images delete ${IMAGE_NAME} \
    --project ${PROJECT_ID} \
    --force-delete-tags \
    --quiet

echo "Cleanup complete!"
