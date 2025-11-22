#!/bin/bash

# Deploy to Raspberry Pi Kubernetes Cluster
# This script updates image references for local registry

REGISTRY="${REGISTRY:-192.168.0.103:5000}"

echo "=========================================="
echo "Deploying to Raspberry Pi Cluster"
echo "Registry: ${REGISTRY}"
echo "=========================================="
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl not found. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Cannot connect to Kubernetes cluster."
    echo "Make sure K3s is running and KUBECONFIG is set correctly."
    exit 1
fi

# Step 1: Create namespace
echo "Step 1/6: Creating namespace..."
kubectl apply -f namespace.yaml

# Step 2: Create secrets and configmap
echo "Step 2/6: Creating secrets and configmap..."
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml

# Step 3: Deploy databases
echo "Step 3/6: Deploying databases..."
kubectl apply -f shrine-db.yaml
kubectl apply -f rabbitmq.yaml

# Wait for databases
echo "Waiting for databases to be ready..."
echo "  - shrine-db..."
kubectl wait --for=condition=ready pod -l app=shrine-db -n microservices --timeout=300s || {
    echo "Warning: shrine-db not ready yet, continuing anyway..."
}

echo "  - rabbitmq..."
kubectl wait --for=condition=ready pod -l app=rabbitmq -n microservices --timeout=300s || {
    echo "Warning: rabbitmq not ready yet, continuing anyway..."
}

# Step 4: Deploy location service (no dependencies)
echo "Step 4/6: Deploying location service..."
cat location-service.yaml | \
  sed "s|image: location-service:latest|image: ${REGISTRY}/location-service:latest|g" | \
  sed "s|imagePullPolicy: Never|imagePullPolicy: Always|g" | \
  kubectl apply -f -

# Wait for location service
echo "Waiting for location service to be ready..."
kubectl wait --for=condition=ready pod -l app=location-service -n microservices --timeout=300s || {
    echo "Warning: location-service not ready yet, continuing anyway..."
}

# Step 5: Deploy shrine service (depends on location service and db)
echo "Step 5/6: Deploying shrine service..."
cat shrine-service.yaml | \
  sed "s|image: shrine-service:latest|image: ${REGISTRY}/shrine-service:latest|g" | \
  sed "s|imagePullPolicy: Never|imagePullPolicy: Always|g" | \
  kubectl apply -f -

# Wait for shrine service
echo "Waiting for shrine service to be ready..."
kubectl wait --for=condition=ready pod -l app=shrine-service -n microservices --timeout=300s || {
    echo "Warning: shrine-service not ready yet, continuing anyway..."
}

# Step 6: Deploy API gateway and frontend
echo "Step 6/6: Deploying API gateway and frontend..."
cat api-gateway.yaml | \
  sed "s|image: api-gateway:latest|image: ${REGISTRY}/api-gateway:latest|g" | \
  sed "s|image: frontend:latest|image: ${REGISTRY}/frontend:latest|g" | \
  sed "s|imagePullPolicy: Never|imagePullPolicy: Always|g" | \
  kubectl apply -f -

echo ""
echo "=========================================="
echo "Deployment initiated!"
echo "=========================================="
echo ""
echo "Checking pod status..."
kubectl get pods -n microservices

echo ""
echo "Services:"
kubectl get svc -n microservices

echo ""
echo "=========================================="
echo "Access Points:"
echo "=========================================="
echo "  Frontend:    http://$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'):30002"
echo "  API Gateway: http://$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'):30000"
echo ""
echo "Monitor deployment:"
echo "  kubectl get pods -n microservices -w"
echo ""
echo "View logs:"
echo "  kubectl logs -n microservices -l app=api-gateway"
echo "  kubectl logs -n microservices -l app=shrine-service"
echo "  kubectl logs -n microservices -l app=location-service"
echo ""
echo "Test API:"
echo "  curl http://$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'):30000/shrines"
echo ""
