#!/bin/bash

echo "Building Docker images for Kubernetes deployment..."

echo ""
echo "Building images with docker-compose..."
docker-compose build

if [ $? -eq 0 ]; then
    echo ""
    echo "Build completed successfully!"

    echo ""
    echo "Built images:"
    docker images | grep sds-final-project

    REGISTRY="192.168.0.106:5000"

    echo ""
    echo "Tagging images for local registry..."

    docker tag sds-final-project_api-gateway:latest     $REGISTRY/api-gateway:latest
    docker tag sds-final-project_shrine-service:latest  $REGISTRY/shrine-service:latest
    docker tag sds-final-project_location-service:latest $REGISTRY/location-service:latest
    docker tag sds-final-project_frontend:latest         $REGISTRY/frontend:latest

    echo ""
    echo "Pushing images to registry..."

    docker push $REGISTRY/api-gateway:latest
    docker push $REGISTRY/shrine-service:latest
    docker push $REGISTRY/location-service:latest
    docker push $REGISTRY/frontend:latest

    echo ""
    echo "Registry contents:"
    curl $REGISTRY/v2/_catalog
else
    echo "Build failed! Check errors above."
    exit 1
fi
