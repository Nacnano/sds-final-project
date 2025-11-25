#!/bin/bash

set -e  # Exit immediately if a command fails

echo -e "\e[32mDeploying with Terraform...\e[0m"

# Change to terraform directory
cd "$(dirname "$0")"

# 1. Initialize Terraform
echo -e "\n\e[33m1. Initializing Terraform...\e[0m"
terraform init

# 2. Validate configuration
echo -e "\n\e[33m2. Validating Terraform configuration...\e[0m"
terraform validate

# 3. Plan deployment
echo -e "\n\e[33m3. Planning deployment...\e[0m"
terraform plan -out=tfplan

# 4. Apply deployment
echo -e "\n\e[33m4. Applying deployment...\e[0m"
terraform apply tfplan

# Remove plan file
rm -f tfplan

# 5. Wait for databases to be ready
echo -e "\n\e[33m5. Waiting for databases to be ready...\e[0m"
sleep 10

# 6. Show deployment status
echo -e "\n\e[33m6. Checking deployment status...\e[0m"
kubectl get all -n microservices

# 7. Seed databases (optional)
echo -e "\n\e[33m7. Seeding databases...\e[0m"
bash ../k8s/seed.sh || echo "Database seed script failed or not converted"

# 8. Show outputs
echo -e "\n\e[33m8. Deployment outputs...\e[0m"
terraform output

echo -e "\n\e[32mDeployment complete!\e[0m"
echo -e "\n\e[36mTo access the services:\e[0m"
echo "- Run: terraform output"
echo -e "\n\e[36mTo view logs:\e[0m"
echo "kubectl logs -n microservices -l app=<service-name>"
echo -e "\n\e[36mTo view pods:\e[0m"
echo "kubectl get pods -n microservices"
