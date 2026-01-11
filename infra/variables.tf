variable "app_name" {
  description = "Application name"
  type        = string
  default     = "orangewall"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Custom domain name (optional)"
  type        = string
  default     = ""
}

variable "dynamodb_tables" {
  description = "List of DynamoDB tables to create"
  type = list(object({
    name         = string
    hash_key     = string
    hash_key_type = string
    range_key    = optional(string)
    range_key_type = optional(string)
    gsi = optional(list(object({
      name            = string
      hash_key        = string
      hash_key_type   = string
      range_key       = optional(string)
      range_key_type  = optional(string)
      projection_type = string
    })))
  }))
  default = [
    {
      name          = "tasks"
      hash_key      = "id"
      hash_key_type = "S"
    },
    {
      name          = "statuses"
      hash_key      = "id"
      hash_key_type = "S"
    }
  ]
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

variable "auth_callback_urls" {
  description = "OAuth callback URLs"
  type        = list(string)
  default     = ["http://localhost:5173"]
}

variable "auth_logout_urls" {
  description = "OAuth logout URLs"
  type        = list(string)
  default     = ["http://localhost:5173"]
}
