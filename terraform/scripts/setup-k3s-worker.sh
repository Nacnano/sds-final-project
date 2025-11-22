#!/bin/bash
# K3s Worker Setup Script
# Joins a Raspberry Pi to existing K3s cluster

set -e

K3S_VERSION=${K3S_VERSION:-"v1.28.5+k3s1"}
MASTER_IP=${MASTER_IP:-"192.168.1.10"}
K3S_TOKEN=${K3S_TOKEN:-""}

if [ -z "$K3S_TOKEN" ]; then
    echo "Error: K3S_TOKEN environment variable is required"
    echo "Usage: K3S_TOKEN=<token> MASTER_IP=<ip> ./setup-k3s-worker.sh"
    exit 1
fi

echo "=== Joining K3s Cluster as Worker ==="
echo "K3s Version: $K3S_VERSION"
echo "Master IP: $MASTER_IP"

# Install K3s agent with Docker runtime
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=$K3S_VERSION \
    K3S_URL=https://$MASTER_IP:6443 \
    K3S_TOKEN=$K3S_TOKEN \
    sh -s - agent --docker

# Enable K3s agent service
sudo systemctl enable k3s-agent

# Wait for agent to start
echo "Waiting for K3s agent to start..."
sleep 20

# Check K3s agent status
sudo systemctl status k3s-agent --no-pager

echo "✓ Worker node joined cluster successfully"
echo ""
echo "Verify on master node with: kubectl get nodes"
