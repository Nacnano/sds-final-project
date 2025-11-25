#!/bin/bash

# Quick Start Script for Terraform Deployment
# This script helps you get started quickly

set -e

echo "======================================"
echo "Terraform Deployment Quick Start"
echo "======================================"
echo ""

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed!"
    echo "Install it with:"
    echo "  sudo apt update && sudo apt install terraform"
    exit 1
fi

echo "✅ Terraform is installed"

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl is not configured or cluster is not accessible!"
    exit 1
fi

echo "✅ kubectl is configured"

# Check if we're in the right directory
if [ ! -f "main.tf" ]; then
    cd "$(dirname "$0")"
fi

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
    echo ""
    echo "📦 Initializing Terraform..."
    terraform init
fi

echo ""
echo "======================================"
echo "Ready to deploy!"
echo "======================================"
echo ""
echo "Choose an option:"
echo "  1) Deploy with default settings"
echo "  2) View what will be deployed (plan)"
echo "  3) Create terraform.tfvars for custom settings"
echo "  4) Destroy existing deployment"
echo "  5) Exit"
echo ""
read -p "Enter your choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying..."
        terraform apply -auto-approve
        echo ""
        echo "✅ Deployment complete!"
        terraform output
        ;;
    2)
        echo ""
        echo "📋 Planning deployment..."
        terraform plan
        ;;
    3)
        if [ ! -f "terraform.tfvars" ]; then
            cp terraform.tfvars.example terraform.tfvars
            echo ""
            echo "✅ Created terraform.tfvars"
            echo "📝 Please edit terraform.tfvars with your settings, then run this script again."
        else
            echo ""
            echo "⚠️  terraform.tfvars already exists"
            echo "📝 Edit it manually if needed"
        fi
        ;;
    4)
        echo ""
        read -p "⚠️  Are you sure you want to destroy all resources? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🗑️  Destroying resources..."
            terraform destroy -auto-approve
            echo "✅ Resources destroyed"
        else
            echo "❌ Destruction cancelled"
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
