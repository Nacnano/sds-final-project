#!/bin/bash
# Build ARM-compatible Docker images for Raspberry Pi deployment
# Run this on your development machine with Docker buildx support

set -e  # Exit on error

echo "======================================"
echo "Building ARM Images for Raspberry Pi"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="192.168.0.103:5000"  # Change this to your master node IP
PLATFORM="linux/arm/v7"        # Raspberry Pi 3 B+ architecture
TAG="latest"

echo -e "${YELLOW}Using registry: ${REGISTRY}${NC}"
echo -e "${YELLOW}Building for platform: ${PLATFORM}${NC}"
echo ""

# Check if buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker buildx is not available${NC}"
    echo "Install with: docker buildx install"
    exit 1
fi

# Create buildx builder if it doesn't exist
if ! docker buildx inspect arm-builder > /dev/null 2>&1; then
    echo -e "${YELLOW}Creating buildx builder for ARM...${NC}"
    docker buildx create --name arm-builder --use
    docker buildx inspect --bootstrap
fi

# Use existing builder
docker buildx use arm-builder

# Function to build and push image
build_and_push() {
    local SERVICE=$1
    local DOCKERFILE=$2
    local CONTEXT=$3
    
    echo -e "${GREEN}Building ${SERVICE}...${NC}"
    
    docker buildx build \
        --platform ${PLATFORM} \
        --file ${DOCKERFILE} \
        --tag ${REGISTRY}/${SERVICE}:${TAG} \
        --push \
        ${CONTEXT}
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ ${SERVICE} built and pushed successfully${NC}"
    else
        echo -e "${RED}✗ Failed to build ${SERVICE}${NC}"
        exit 1
    fi
    echo ""
}

# Build all services
echo -e "${YELLOW}Step 1/4: Building Shrine Service...${NC}"
build_and_push "shrine-service" "apps/shrine-service/Dockerfile" "."

echo -e "${YELLOW}Step 2/4: Building Location Service...${NC}"
build_and_push "location-service" "apps/location-service/Dockerfile" "."

echo -e "${YELLOW}Step 3/4: Building API Gateway...${NC}"
build_and_push "api-gateway" "apps/api-gateway/Dockerfile" "."

echo -e "${YELLOW}Step 4/4: Building Frontend...${NC}"
build_and_push "frontend" "frontend/Dockerfile" "frontend"

# Verify images in registry
echo -e "${GREEN}======================================"
echo "Verifying images in registry..."
echo -e "======================================${NC}"

curl -s http://${REGISTRY}/v2/_catalog | python3 -m json.tool

echo ""
echo -e "${GREEN}======================================"
echo "✓ All images built successfully!"
echo -e "======================================${NC}"
echo ""
echo "Images available at:"
echo "  - ${REGISTRY}/shrine-service:${TAG}"
echo "  - ${REGISTRY}/location-service:${TAG}"
echo "  - ${REGISTRY}/api-gateway:${TAG}"
echo "  - ${REGISTRY}/frontend:${TAG}"
echo ""
echo "Next steps:"
echo "  1. Verify images on Raspberry Pi: docker pull ${REGISTRY}/shrine-service:${TAG}"
echo "  2. Deploy to Kubernetes: kubectl apply -f k8s/"
echo ""
