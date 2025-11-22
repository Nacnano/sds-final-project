#!/bin/bash
# Docker Registry Setup Script
# Sets up a local Docker registry on master node

set -e

REGISTRY_PORT=${REGISTRY_PORT:-5000}
MASTER_IP=${MASTER_IP:-"192.168.1.10"}

echo "=== Setting up Docker Registry ==="
echo "Registry Port: $REGISTRY_PORT"
echo "Master IP: $MASTER_IP"

# Stop and remove existing registry if present
docker stop registry 2>/dev/null || true
docker rm registry 2>/dev/null || true

# Run Docker registry
docker run -d \
    -p $REGISTRY_PORT:5000 \
    --restart=always \
    --name registry \
    registry:2

# Wait for registry to start
echo "Waiting for registry to start..."
sleep 5

# Verify registry is running
if docker ps | grep -q registry; then
    echo "✓ Docker registry is running"
else
    echo "✗ Failed to start Docker registry"
    exit 1
fi

# Configure Docker daemon for insecure registry
echo "Configuring Docker for insecure registry..."
sudo mkdir -p /etc/docker

cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "insecure-registries": ["$MASTER_IP:$REGISTRY_PORT"]
}
EOF

# Restart Docker to apply changes
sudo systemctl restart docker

# Restart registry after Docker restart
sleep 5
docker start registry || docker run -d -p $REGISTRY_PORT:5000 --restart=always --name registry registry:2

echo "✓ Docker registry setup complete"
echo ""
echo "Registry URL: $MASTER_IP:$REGISTRY_PORT"
echo ""
echo "To push images:"
echo "  docker tag <image> $MASTER_IP:$REGISTRY_PORT/<image>"
echo "  docker push $MASTER_IP:$REGISTRY_PORT/<image>"
echo ""
echo "Configure worker nodes with:"
echo "  Add \"insecure-registries\": [\"$MASTER_IP:$REGISTRY_PORT\"] to /etc/docker/daemon.json"
