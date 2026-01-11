variable "prefix" {
  description = "Resource name prefix"
  type        = string
}

variable "api_gateway_url" {
  description = "API Gateway URL for /api/* routing"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name (optional)"
  type        = string
  default     = ""
}
