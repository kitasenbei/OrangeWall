#!/bin/bash
set -e

ENV=${1:-dev}
REGION=${2:-us-east-1}
BUCKET="orangewall-${ENV}-frontend"

echo "=== Deploying Frontend to S3 ==="
echo "Environment: $ENV"
echo "Bucket: $BUCKET"
echo ""

cd "$(dirname "$0")/../frontend"

# Build frontend
echo "Building frontend..."
npm run build

# Sync to S3
echo "Syncing to S3..."
aws s3 sync dist/ "s3://${BUCKET}" \
  --delete \
  --region "$REGION"

# Invalidate CloudFront cache
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[?Id=='s3-frontend'] && contains(Origins.Items[*].DomainName, '${BUCKET}')].Id" \
  --output text \
  --region "$REGION" 2>/dev/null || echo "")

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --region "$REGION"
fi

echo "Done!"
