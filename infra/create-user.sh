#!/bin/bash

# Create Cognito user for Orangewall

read -p "Enter your email: " EMAIL
read -s -p "Enter your password (min 8 chars, lowercase + number): " PASSWORD
echo ""

USER_POOL_ID=$(terraform output -raw cognito_user_pool_id)

echo "Creating user..."
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL" \
  --user-attributes Name=email,Value="$EMAIL" Name=email_verified,Value=true \
  --message-action SUPPRESS

echo "Setting password..."
aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL" \
  --password "$PASSWORD" \
  --permanent

echo ""
echo "Done! You can now log in at:"
terraform output frontend_url
