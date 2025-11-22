#!/bin/bash
# Validation Script for Terraform Raspberry Pi Cluster Setup
# Tests all prerequisites and connectivity before running Terraform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  Raspberry Pi Cluster Validation Script          ║${NC}"
echo -e "${CYAN}║  สาย.mu - Shrine Discovery Platform              ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Load configuration
if [ ! -f "terraform.tfvars" ]; then
    echo -e "${RED}✗ terraform.tfvars not found${NC}"
    echo -e "${YELLOW}  Creating from example...${NC}"
    cp terraform.tfvars.example terraform.tfvars
    echo -e "${YELLOW}  Please edit terraform.tfvars with your settings${NC}"
    exit 1
fi

# Parse configuration (basic parsing)
MASTER_IP=$(grep 'master_ip' terraform.tfvars | cut -d'=' -f2 | tr -d ' "')
SSH_USER=$(grep 'ssh_user' terraform.tfvars | cut -d'=' -f2 | tr -d ' "')
SSH_KEY=$(grep 'ssh_private_key_path' terraform.tfvars | cut -d'=' -f2 | tr -d ' "' | sed "s|~|$HOME|")

# Extract worker IPs (simplified)
WORKER_IPS=$(grep 'worker_ips' terraform.tfvars | grep -oP '\d+\.\d+\.\d+\.\d+' | tr '\n' ' ')

echo -e "${CYAN}=== Configuration ===${NC}"
echo "Master IP: $MASTER_IP"
echo "SSH User: $SSH_USER"
echo "SSH Key: $SSH_KEY"
echo "Worker IPs: $WORKER_IPS"
echo ""

# Test 1: Check Terraform installation
echo -e "${CYAN}=== Test 1: Terraform Installation ===${NC}"
if command -v terraform &> /dev/null; then
    TF_VERSION=$(terraform version | head -n1)
    echo -e "${GREEN}✓ Terraform installed: $TF_VERSION${NC}"
else
    echo -e "${RED}✗ Terraform not installed${NC}"
    echo "  Install from: https://www.terraform.io/downloads"
    exit 1
fi
echo ""

# Test 2: Check SSH key
echo -e "${CYAN}=== Test 2: SSH Key ===${NC}"
if [ -f "$SSH_KEY" ]; then
    echo -e "${GREEN}✓ SSH key exists: $SSH_KEY${NC}"
    # Check permissions
    PERMS=$(stat -c %a "$SSH_KEY" 2>/dev/null || stat -f %A "$SSH_KEY" 2>/dev/null)
    if [ "$PERMS" = "600" ] || [ "$PERMS" = "400" ]; then
        echo -e "${GREEN}✓ SSH key permissions correct: $PERMS${NC}"
    else
        echo -e "${YELLOW}⚠ SSH key permissions: $PERMS (should be 600)${NC}"
        echo "  Fix with: chmod 600 $SSH_KEY"
    fi
else
    echo -e "${RED}✗ SSH key not found: $SSH_KEY${NC}"
    echo "  Generate with: ssh-keygen -t rsa -b 4096 -f $SSH_KEY"
    exit 1
fi
echo ""

# Test 3: Network connectivity
echo -e "${CYAN}=== Test 3: Network Connectivity ===${NC}"
# Test master
echo -n "Testing master ($MASTER_IP)... "
if ping -c 1 -W 2 $MASTER_IP &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Cannot reach master${NC}"
    exit 1
fi

# Test workers
for IP in $WORKER_IPS; do
    echo -n "Testing worker ($IP)... "
    if ping -c 1 -W 2 $IP &> /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ Cannot reach worker${NC}"
    fi
done
echo ""

# Test 4: SSH connectivity
echo -e "${CYAN}=== Test 4: SSH Connectivity ===${NC}"
# Test master
echo -n "SSH to master ($MASTER_IP)... "
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$MASTER_IP" "echo 'ok'" &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Cannot SSH to master${NC}"
    echo "  Test manually: ssh -i $SSH_KEY $SSH_USER@$MASTER_IP"
    exit 1
fi

# Test workers
for IP in $WORKER_IPS; do
    echo -n "SSH to worker ($IP)... "
    if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$IP" "echo 'ok'" &> /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ Cannot SSH to worker${NC}"
        echo "  Copy key: ssh-copy-id -i $SSH_KEY $SSH_USER@$IP"
    fi
done
echo ""

# Test 5: Node resources
echo -e "${CYAN}=== Test 5: Node Resources ===${NC}"
# Check master
echo "Master ($MASTER_IP):"
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$MASTER_IP" "
    echo -n '  OS: '; lsb_release -ds
    echo -n '  CPU: '; nproc
    echo -n '  RAM: '; free -h | grep Mem | awk '{print \$2}'
    echo -n '  Disk: '; df -h / | tail -1 | awk '{print \$4\" free\"}'
"

# Check workers
for IP in $WORKER_IPS; do
    echo "Worker ($IP):"
    ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$IP" "
        echo -n '  OS: '; lsb_release -ds 2>/dev/null || echo 'Unknown'
        echo -n '  CPU: '; nproc
        echo -n '  RAM: '; free -h | grep Mem | awk '{print \$2}'
        echo -n '  Disk: '; df -h / | tail -1 | awk '{print \$4\" free\"}'
    " 2>/dev/null || echo -e "  ${YELLOW}⚠ Cannot connect${NC}"
done
echo ""

# Test 6: Check for existing installations
echo -e "${CYAN}=== Test 6: Existing Installations ===${NC}"
echo "Checking master for existing installations:"
MASTER_DOCKER=$(ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$MASTER_IP" "command -v docker &> /dev/null && echo 'yes' || echo 'no'")
MASTER_K3S=$(ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$MASTER_IP" "command -v k3s &> /dev/null && echo 'yes' || echo 'no'")
echo "  Docker: $MASTER_DOCKER"
echo "  K3s: $MASTER_K3S"

if [ "$MASTER_DOCKER" = "yes" ] || [ "$MASTER_K3S" = "yes" ]; then
    echo -e "${YELLOW}⚠ Existing installations found on master${NC}"
    echo "  Terraform will use existing Docker if present"
    echo "  To clean up: ssh $SSH_USER@$MASTER_IP 'sudo systemctl stop k3s; sudo /usr/local/bin/k3s-uninstall.sh'"
fi
echo ""

# Test 7: Terraform configuration
echo -e "${CYAN}=== Test 7: Terraform Configuration ===${NC}"
if terraform validate &> /dev/null; then
    echo -e "${GREEN}✓ Terraform configuration is valid${NC}"
else
    echo -e "${RED}✗ Terraform configuration has errors${NC}"
    terraform validate
    exit 1
fi
echo ""

# Summary
echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  Validation Summary                               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ All checks passed!${NC}"
echo ""
echo "You're ready to run Terraform:"
echo "  terraform init"
echo "  terraform plan"
echo "  terraform apply"
echo ""
echo "Or use the automated script:"
echo "  ./setup.ps1 -Action apply    (Windows)"
echo "  cd terraform && terraform apply    (Linux/Mac)"
echo ""
