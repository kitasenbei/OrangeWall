#!/bin/bash
set -e

ENV=${1:-dev}
ACTION=${2:-plan}

echo "=== Orangewall Infrastructure ==="
echo "Environment: $ENV"
echo "Action: $ACTION"
echo ""

cd "$(dirname "$0")"

# Initialize Terraform
terraform init

# Run action
case $ACTION in
  plan)
    terraform plan -var-file="environments/${ENV}.tfvars"
    ;;
  apply)
    terraform apply -var-file="environments/${ENV}.tfvars"
    ;;
  destroy)
    terraform destroy -var-file="environments/${ENV}.tfvars"
    ;;
  *)
    echo "Usage: ./deploy.sh [dev|prod] [plan|apply|destroy]"
    exit 1
    ;;
esac
