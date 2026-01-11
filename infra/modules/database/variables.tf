variable "prefix" {
  description = "Resource name prefix"
  type        = string
}

variable "tables" {
  description = "List of DynamoDB tables to create"
  type = list(object({
    name           = string
    hash_key       = string
    hash_key_type  = string
    range_key      = optional(string)
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
}
