resource "aws_dynamodb_table" "tables" {
  for_each = { for table in var.tables : table.name => table }

  name         = "${var.prefix}-${each.value.name}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = each.value.hash_key

  attribute {
    name = each.value.hash_key
    type = each.value.hash_key_type
  }

  dynamic "attribute" {
    for_each = each.value.range_key != null ? [1] : []
    content {
      name = each.value.range_key
      type = each.value.range_key_type
    }
  }

  dynamic "attribute" {
    for_each = each.value.gsi != null ? each.value.gsi : []
    content {
      name = attribute.value.hash_key
      type = attribute.value.hash_key_type
    }
  }

  dynamic "global_secondary_index" {
    for_each = each.value.gsi != null ? each.value.gsi : []
    content {
      name            = global_secondary_index.value.name
      hash_key        = global_secondary_index.value.hash_key
      range_key       = global_secondary_index.value.range_key
      projection_type = global_secondary_index.value.projection_type
    }
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.prefix}-${each.value.name}"
  }
}
