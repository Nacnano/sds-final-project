# Deploy all resources in order
Write-Host "Deploying Kubernetes resources..." -ForegroundColor Green

# 1. Create namespace
Write-Host "`n1. Creating namespace..." -ForegroundColor Yellow
kubectl apply -f k8s/namespace.yaml

# 2. Create ConfigMap and Secrets
Write-Host "`n2. Creating ConfigMap and Secrets..." -ForegroundColor Yellow
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# 3. Deploy databases
Write-Host "`n3. Deploying databases..." -ForegroundColor Yellow
kubectl apply -f k8s/shrine-db.yaml

# 4. Deploy RabbitMQ
Write-Host "`n4. Deploying RabbitMQ..." -ForegroundColor Yellow
kubectl apply -f k8s/rabbitmq.yaml

# Wait for databases to be ready
Write-Host "`n5. Waiting for databases to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 6. Deploy microservices
Write-Host "`n6. Deploying microservices..." -ForegroundColor Yellow
kubectl apply -f k8s/shrine-service.yaml
kubectl apply -f k8s/location-service.yaml

# Wait for services to be ready
Write-Host "`n7. Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# 8. Deploy API Gateway
Write-Host "`n8. Deploying API Gateway..." -ForegroundColor Yellow
kubectl apply -f k8s/api-gateway.yaml

# 9. Deploy Metrics Server (for HPA)
Write-Host "`n9. Deploying Metrics Server..." -ForegroundColor Yellow
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
k8s/patch-metrics-server.ps1

# 10. Deploy pgAdmin (optional)
Write-Host "`n10. Deploying pgAdmin..." -ForegroundColor Yellow
kubectl apply -f k8s/pgadmin.yaml

# 11. Show deployment status
Write-Host "`n11. Checking deployment status..." -ForegroundColor Yellow
kubectl get all -n microservices

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "`nTo access the services:" -ForegroundColor Cyan
Write-Host "- API Gateway: http://localhost:30000" -ForegroundColor White
Write-Host "- pgAdmin: http://localhost:30080" -ForegroundColor White
Write-Host "`nTo view logs:" -ForegroundColor Cyan
Write-Host "kubectl logs -n microservices -l app=<service-name>" -ForegroundColor White
Write-Host "`nTo view pods:" -ForegroundColor Cyan
Write-Host "kubectl get pods -n microservices" -ForegroundColor White
