output "table_names" {
  description = "Map of table names"
  value       = { for name, table in aws_dynamodb_table.tables : name => table.name }
}

output "table_arns" {
  description = "Map of table ARNs"
  value       = { for name, table in aws_dynamodb_table.tables : name => table.arn }
}
