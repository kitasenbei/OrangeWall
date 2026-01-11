terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use S3 backend for state
  # backend "s3" {
  #   bucket         = "orangewall-terraform-state"
  #   key            = "state/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "orangewall-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Application = var.app_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Provider for CloudFront (must be us-east-1)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

locals {
  prefix = "${var.app_name}-${var.environment}"
}

# Database module
module "database" {
  source = "./modules/database"

  prefix = local.prefix
  tables = var.dynamodb_tables
}

# Auth module
module "auth" {
  source = "./modules/auth"

  prefix        = local.prefix
  callback_urls = var.auth_callback_urls
  logout_urls   = var.auth_logout_urls
}

# API module
module "api" {
  source = "./modules/api"

  prefix         = local.prefix
  aws_region     = var.aws_region
  lambda_memory  = var.lambda_memory
  lambda_timeout = var.lambda_timeout

  dynamodb_table_arns = module.database.table_arns

  environment_variables = {
    TASKS_TABLE            = module.database.table_names["tasks"]
    STATUSES_TABLE         = module.database.table_names["statuses"]
    NOTES_TABLE            = module.database.table_names["notes"]
    NOTE_FOLDERS_TABLE     = module.database.table_names["note_folders"]
    KANBAN_BOARDS_TABLE    = module.database.table_names["kanban_boards"]
    KANBAN_COLUMNS_TABLE   = module.database.table_names["kanban_columns"]
    KANBAN_CARDS_TABLE     = module.database.table_names["kanban_cards"]
    CALENDAR_EVENTS_TABLE  = module.database.table_names["calendar_events"]
    ROUTINES_TABLE         = module.database.table_names["routines"]
    SCHEDULE_BLOCKS_TABLE  = module.database.table_names["schedule_blocks"]
    CONTACTS_TABLE         = module.database.table_names["contacts"]
    USER_PREFERENCES_TABLE = module.database.table_names["user_preferences"]
    RECIPES_TABLE          = module.database.table_names["recipes"]
  }

  # Cognito auth
  enable_auth                 = true
  cognito_user_pool_id        = module.auth.user_pool_id
  cognito_user_pool_client_id = module.auth.user_pool_client_id
  cognito_user_pool_endpoint  = module.auth.user_pool_endpoint
}

# Frontend module
module "frontend" {
  source = "./modules/frontend"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  prefix          = local.prefix
  api_gateway_url = module.api.api_endpoint
  domain_name     = var.domain_name
}
