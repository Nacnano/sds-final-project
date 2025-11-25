#!/bin/bash

set -e  # Exit immediately if a command fails

echo -e "\e[32mDestroying Terraform-managed resources...\e[0m"

# Change to terraform directory
cd "$(dirname "$0")"

# 1. Plan destroy
echo -e "\n\e[33m1. Planning destroy...\e[0m"
terraform plan -destroy -out=tfplan

# 2. Destroy resources
echo -e "\n\e[33m2. Destroying resources...\e[0m"
terraform apply tfplan

# Remove plan file
rm -f tfplan

echo -e "\n\e[32mAll resources destroyed!\e[0m"
