# Deploy to Raspberry Pi Kubernetes Cluster
# This script updates image references for local registry

$REGISTRY = if ($env:REGISTRY) { $env:REGISTRY } else { "192.168.1.10:5000" }

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Deploying to Raspberry Pi Cluster" -ForegroundColor Green
Write-Host "Registry: $REGISTRY" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if kubectl is available
try {
    kubectl version --client | Out-Null
} catch {
    Write-Host "Error: kubectl not found. Please install kubectl first." -ForegroundColor Red
    exit 1
}

# Check if cluster is accessible
try {
    kubectl cluster-info | Out-Null
} catch {
    Write-Host "Error: Cannot connect to Kubernetes cluster." -ForegroundColor Red
    Write-Host "Make sure K3s is running and KUBECONFIG is set correctly." -ForegroundColor Red
    exit 1
}

# Step 1: Create namespace
Write-Host "Step 1/6: Creating namespace..." -ForegroundColor Yellow
kubectl apply -f namespace.yaml

# Step 2: Create secrets and configmap
Write-Host "Step 2/6: Creating secrets and configmap..." -ForegroundColor Yellow
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml

# Step 3: Deploy databases
Write-Host "Step 3/6: Deploying databases..." -ForegroundColor Yellow
kubectl apply -f shrine-db.yaml
kubectl apply -f rabbitmq.yaml

# Wait for databases
Write-Host "Waiting for databases to be ready..." -ForegroundColor Yellow
Write-Host "  - shrine-db..."
kubectl wait --for=condition=ready pod -l app=shrine-db -n microservices --timeout=300s
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: shrine-db not ready yet, continuing anyway..." -ForegroundColor Yellow
}

Write-Host "  - rabbitmq..."
kubectl wait --for=condition=ready pod -l app=rabbitmq -n microservices --timeout=300s
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: rabbitmq not ready yet, continuing anyway..." -ForegroundColor Yellow
}

# Step 4: Deploy location service
Write-Host "Step 4/6: Deploying location service..." -ForegroundColor Yellow
(Get-Content location-service.yaml -Raw) `
  -replace 'image: location-service:latest', "image: $REGISTRY/location-service:latest" `
  -replace 'imagePullPolicy: Never', 'imagePullPolicy: Always' | `
  kubectl apply -f -

# Wait for location service
Write-Host "Waiting for location service to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=location-service -n microservices --timeout=300s
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: location-service not ready yet, continuing anyway..." -ForegroundColor Yellow
}

# Step 5: Deploy shrine service
Write-Host "Step 5/6: Deploying shrine service..." -ForegroundColor Yellow
(Get-Content shrine-service.yaml -Raw) `
  -replace 'image: shrine-service:latest', "image: $REGISTRY/shrine-service:latest" `
  -replace 'imagePullPolicy: Never', 'imagePullPolicy: Always' | `
  kubectl apply -f -

# Wait for shrine service
Write-Host "Waiting for shrine service to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=shrine-service -n microservices --timeout=300s
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: shrine-service not ready yet, continuing anyway..." -ForegroundColor Yellow
}

# Step 6: Deploy API gateway and frontend
Write-Host "Step 6/6: Deploying API gateway and frontend..." -ForegroundColor Yellow
(Get-Content api-gateway.yaml -Raw) `
  -replace 'image: api-gateway:latest', "image: $REGISTRY/api-gateway:latest" `
  -replace 'image: frontend:latest', "image: $REGISTRY/frontend:latest" `
  -replace 'imagePullPolicy: Never', 'imagePullPolicy: Always' | `
  kubectl apply -f -

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Deployment initiated!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Checking pod status..." -ForegroundColor Cyan
kubectl get pods -n microservices

Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
kubectl get svc -n microservices

$masterIP = kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Access Points:" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Frontend:    http://${masterIP}:30002"
Write-Host "  API Gateway: http://${masterIP}:30000"
Write-Host ""
Write-Host "Monitor deployment:" -ForegroundColor Yellow
Write-Host "  kubectl get pods -n microservices -w"
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  kubectl logs -n microservices -l app=api-gateway"
Write-Host "  kubectl logs -n microservices -l app=shrine-service"
Write-Host "  kubectl logs -n microservices -l app=location-service"
Write-Host ""
Write-Host "Test API:" -ForegroundColor Yellow
Write-Host "  curl http://${masterIP}:30000/shrines"
Write-Host ""
