#!/bin/bash
# K3s Master Setup Script
# Sets up K3s server (master node) with Docker runtime

set -e

K3S_VERSION=${K3S_VERSION:-"v1.28.5+k3s1"}
MASTER_IP=${MASTER_IP:-"192.168.1.10"}

echo "=== Setting up K3s Master Node ==="
echo "K3s Version: $K3S_VERSION"
echo "Master IP: $MASTER_IP"

# Install K3s server with Docker runtime
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=$K3S_VERSION sh -s - server \
    --docker \
    --write-kubeconfig-mode 644 \
    --cluster-init \
    --node-ip $MASTER_IP

# Enable K3s service
sudo systemctl enable k3s

# Wait for K3s to be ready
echo "Waiting for K3s to be ready..."
sleep 30

# Check K3s status
sudo systemctl status k3s --no-pager

# Setup kubeconfig for non-root user
mkdir -p $HOME/.kube
sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
export KUBECONFIG=$HOME/.kube/config

# Verify kubectl works
kubectl get nodes

# Display K3s token (needed for workers)
echo ""
echo "=== K3s Token (save this for workers) ==="
sudo cat /var/lib/rancher/k3s/server/node-token
echo ""

# Display cluster info
kubectl cluster-info

echo "✓ K3s master setup complete"
echo ""
echo "To join worker nodes, run on each worker:"
echo "curl -sfL https://get.k3s.io | K3S_URL=https://$MASTER_IP:6443 K3S_TOKEN=<token> sh -s - agent --docker"
