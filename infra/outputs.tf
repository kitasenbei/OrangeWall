output "frontend_url" {
  description = "CloudFront distribution URL"
  value       = module.frontend.cloudfront_url
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = module.frontend.cloudfront_distribution_id
}

output "api_url" {
  description = "API Gateway endpoint URL"
  value       = module.api.api_endpoint
}

output "s3_bucket" {
  description = "S3 bucket for frontend"
  value       = module.frontend.s3_bucket_name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.api.lambda_function_name
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value       = module.database.table_names
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.auth.user_pool_id
}

output "cognito_client_id" {
  description = "Cognito Client ID (for frontend)"
  value       = module.auth.user_pool_client_id
}

output "cognito_domain" {
  description = "Cognito domain"
  value       = module.auth.user_pool_domain
}
