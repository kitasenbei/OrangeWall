variable "prefix" {
  description = "Resource name prefix"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "lambda_memory" {
  description = "Lambda memory in MB"
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "dynamodb_table_arns" {
  description = "Map of DynamoDB table ARNs for IAM permissions"
  type        = map(string)
}

variable "environment_variables" {
  description = "Environment variables for Lambda"
  type        = map(string)
  default     = {}
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID for JWT authorizer"
  type        = string
  default     = ""
}

variable "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  type        = string
  default     = ""
}

variable "cognito_user_pool_endpoint" {
  description = "Cognito User Pool endpoint"
  type        = string
  default     = ""
}

variable "enable_auth" {
  description = "Enable Cognito JWT authentication"
  type        = bool
  default     = true
}
