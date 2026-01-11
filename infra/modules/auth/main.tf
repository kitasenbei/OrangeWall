# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.prefix}-users"

  # Username is email
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # IMPORTANT: Disable self-signup - only admin can create users
  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = false
  }

  # Account recovery via email
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Schema
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  # Email configuration (use Cognito default for simplicity)
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # MFA off for simplicity (single user)
  mfa_configuration = "OFF"

  tags = {
    Name = "${var.prefix}-users"
  }
}

# User Pool Client (for frontend)
resource "aws_cognito_user_pool_client" "frontend" {
  name         = "${var.prefix}-frontend"
  user_pool_id = aws_cognito_user_pool.main.id

  # No client secret (public client for SPA)
  generate_secret = false

  # Token expiration
  access_token_validity  = 1    # 1 hour
  id_token_validity      = 1    # 1 hour
  refresh_token_validity = 30   # 30 days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Auth flows
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # OAuth settings
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  callback_urls                        = var.callback_urls
  logout_urls                          = var.logout_urls
  supported_identity_providers         = ["COGNITO"]

  # Prevent user existence errors (security)
  prevent_user_existence_errors = "ENABLED"
}

# User Pool Domain (for hosted UI, optional)
resource "aws_cognito_user_pool_domain" "main" {
  domain       = var.prefix
  user_pool_id = aws_cognito_user_pool.main.id
}
