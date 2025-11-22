#!/bin/bash
# Terraform Setup Script for WSL/Linux/Mac
# Automates the Terraform deployment for Raspberry Pi Kubernetes Cluster

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ACTION=${1:-plan}
AUTO_APPROVE=${2:-false}

print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

test_prerequisites() {
    print_color "$CYAN" "\n=== Checking Prerequisites ==="
    
    # Check Terraform
    if command -v terraform &> /dev/null; then
        TF_VERSION=$(terraform version | head -n1)
        print_color "$GREEN" "✓ Terraform: $TF_VERSION"
    else
        print_color "$RED" "✗ Terraform not found. Install from https://www.terraform.io/downloads"
        exit 1
    fi
    
    # Check SSH
    if [ ! -f "$HOME/.ssh/id_rsa" ]; then
        print_color "$YELLOW" "⚠ SSH key not found at $HOME/.ssh/id_rsa"
        print_color "$YELLOW" "  Generate one with: ssh-keygen -t rsa -b 4096"
        read -p "Continue anyway? (y/n): " continue
        if [ "$continue" != "y" ]; then
            exit 1
        fi
    else
        print_color "$GREEN" "✓ SSH key found"
    fi
    
    # Check terraform.tfvars
    if [ ! -f "terraform.tfvars" ]; then
        print_color "$YELLOW" "⚠ terraform.tfvars not found"
        print_color "$YELLOW" "  Creating from example..."
        cp terraform.tfvars.example terraform.tfvars 2>/dev/null || true
    else
        print_color "$GREEN" "✓ terraform.tfvars found"
    fi
}

test_network_connectivity() {
    print_color "$CYAN" "\n=== Testing Network Connectivity ==="
    
    # Parse config
    MASTER_IP=$(grep 'master_ip' terraform.tfvars | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1)
    WORKER_IPS=$(grep 'worker_ips' terraform.tfvars | grep -oP '\d+\.\d+\.\d+\.\d+')
    
    # Test master
    echo -n "Testing master ($MASTER_IP)... "
    if ping -c 1 -W 2 $MASTER_IP &> /dev/null; then
        print_color "$GREEN" "✓"
    else
        print_color "$RED" "✗ Cannot reach master"
        return 1
    fi
    
    # Test workers
    for IP in $WORKER_IPS; do
        echo -n "Testing worker ($IP)... "
        if ping -c 1 -W 2 $IP &> /dev/null; then
            print_color "$GREEN" "✓"
        else
            print_color "$YELLOW" "⚠"
        fi
    done
}

terraform_init() {
    print_color "$CYAN" "\n=== Initializing Terraform ==="
    terraform init
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✓ Terraform initialized successfully"
    else
        print_color "$RED" "✗ Terraform initialization failed"
        exit 1
    fi
}

terraform_plan() {
    print_color "$CYAN" "\n=== Planning Infrastructure ==="
    terraform plan -out=tfplan
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✓ Plan created successfully"
        print_color "$YELLOW" "\nTo apply this plan, run: ./setup.sh apply"
    else
        print_color "$RED" "✗ Planning failed"
        exit 1
    fi
}

terraform_apply() {
    print_color "$CYAN" "\n=== Applying Infrastructure ==="
    print_color "$YELLOW" "This will configure your Kubernetes cluster."
    print_color "$YELLOW" "Estimated time: 10-15 minutes"
    
    if [ "$AUTO_APPROVE" = "true" ]; then
        terraform apply -auto-approve
    else
        echo ""
        read -p "Proceed? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            terraform apply
        else
            print_color "$YELLOW" "Cancelled by user"
            exit 0
        fi
    fi
    
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "\n✓ Infrastructure deployed successfully!"
        show_next_steps
    else
        print_color "$RED" "✗ Deployment failed"
        exit 1
    fi
}

terraform_destroy() {
    print_color "$CYAN" "\n=== Destroying Infrastructure ==="
    print_color "$RED" "⚠ WARNING: This will remove K3s from all nodes!"
    
    if [ "$AUTO_APPROVE" = "true" ]; then
        terraform destroy -auto-approve
    else
        echo ""
        read -p "Type 'yes' to confirm destruction: " confirm
        if [ "$confirm" = "yes" ]; then
            terraform destroy
        else
            print_color "$YELLOW" "Cancelled by user"
            exit 0
        fi
    fi
    
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✓ Infrastructure destroyed"
    fi
}

verify_cluster() {
    print_color "$CYAN" "\n=== Verifying Cluster ==="
    
    MASTER_IP=$(grep 'master_ip' terraform.tfvars | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1)
    SSH_USER=$(grep 'ssh_user' terraform.tfvars | cut -d'=' -f2 | tr -d ' "')
    
    print_color "$YELLOW" "Connecting to master node..."
    ssh -o StrictHostKeyChecking=no "$SSH_USER@$MASTER_IP" "kubectl get nodes"
    
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "\n✓ Cluster is operational!"
        print_color "$CYAN" "\nTo access the cluster:"
        print_color "$NC" "  ssh $SSH_USER@$MASTER_IP"
    else
        print_color "$RED" "✗ Cannot verify cluster"
    fi
}

show_next_steps() {
    print_color "$CYAN" "\n============================================"
    print_color "$CYAN" "Next Steps:"
    print_color "$CYAN" "============================================"
    print_color "$NC" "1. Verify cluster:"
    print_color "$YELLOW" "   ./setup.sh verify"
    echo ""
    print_color "$NC" "2. Build ARM images:"
    print_color "$YELLOW" "   cd ../k8s"
    print_color "$YELLOW" "   ./build-arm.sh"
    echo ""
    print_color "$NC" "3. Deploy application:"
    print_color "$YELLOW" "   ./deploy-pi.sh"
    echo ""
    print_color "$NC" "4. Check deployment:"
    print_color "$YELLOW" "   kubectl get pods -n microservices"
    print_color "$CYAN" "============================================"
}

# Main execution
clear
print_color "$CYAN" "╔═══════════════════════════════════════════════════╗"
print_color "$CYAN" "║  Raspberry Pi Kubernetes Cluster Setup           ║"
print_color "$CYAN" "║  สาย.mu - Shrine Discovery Platform              ║"
print_color "$CYAN" "╚═══════════════════════════════════════════════════╝"

case $ACTION in
    init)
        test_prerequisites
        terraform_init
        ;;
    plan)
        test_prerequisites
        if [ ! -d ".terraform" ]; then
            terraform_init
        fi
        test_network_connectivity
        terraform_plan
        ;;
    apply)
        test_prerequisites
        if [ ! -d ".terraform" ]; then
            terraform_init
        fi
        test_network_connectivity
        terraform_apply
        ;;
    destroy)
        terraform_destroy
        ;;
    verify)
        verify_cluster
        ;;
    *)
        echo "Usage: $0 {init|plan|apply|destroy|verify} [auto-approve]"
        echo ""
        echo "Commands:"
        echo "  init     - Initialize Terraform"
        echo "  plan     - Show what will be created"
        echo "  apply    - Deploy the cluster"
        echo "  destroy  - Tear down the cluster"
        echo "  verify   - Check cluster status"
        echo ""
        echo "Examples:"
        echo "  $0 plan"
        echo "  $0 apply"
        echo "  $0 apply auto-approve"
        exit 1
        ;;
esac

print_color "$GREEN" "\nDone!"
