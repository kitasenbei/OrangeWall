#!/bin/bash
set -e

ENV=${1:-dev}
REGION=${2:-us-east-1}
FUNCTION_NAME="orangewall-${ENV}-api"

echo "=== Deploying Backend to Lambda ==="
echo "Environment: $ENV"
echo "Function: $FUNCTION_NAME"
echo ""

cd "$(dirname "$0")/../backend"

# Create deployment package
echo "Creating deployment package..."
rm -rf .package lambda.zip
pip install -r requirements.txt -t .package --quiet
cp -r app .package/
cd .package
zip -r ../lambda.zip . -q
cd ..
rm -rf .package

# Deploy to Lambda
echo "Deploying to Lambda..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file fileb://lambda.zip \
  --region "$REGION"

rm lambda.zip

echo "Done!"
