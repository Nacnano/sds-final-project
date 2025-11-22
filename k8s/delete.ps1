# Delete all resources
Write-Host "Deleting all Kubernetes resources..." -ForegroundColor Red

# Delete in reverse order of deployment
Write-Host "`n1. Deleting pgAdmin..." -ForegroundColor Yellow
kubectl delete -f k8s/pgadmin.yaml

Write-Host "`n2. Deleting API Gateway..." -ForegroundColor Yellow
kubectl delete -f k8s/api-gateway.yaml

Write-Host "`n3. Deleting microservices..." -ForegroundColor Yellow
kubectl delete -f k8s/wishing-service.yaml
kubectl delete -f k8s/shrine-discovery-service.yaml
kubectl delete -f k8s/rating-service.yaml
kubectl delete -f k8s/location-service.yaml
kubectl delete -f k8s/technique-service.yaml
kubectl delete -f k8s/user-service.yaml
kubectl delete -f k8s/shrine-service.yaml

Write-Host "`n4. Deleting RabbitMQ..." -ForegroundColor Yellow
kubectl delete -f k8s/rabbitmq.yaml

Write-Host "`n5. Deleting databases..." -ForegroundColor Yellow
kubectl delete -f k8s/rating-db.yaml
kubectl delete -f k8s/wishing-db.yaml
kubectl delete -f k8s/user-db.yaml
kubectl delete -f k8s/shrine-db.yaml

Write-Host "`n6. Deleting ConfigMap and Secrets..." -ForegroundColor Yellow
kubectl delete -f k8s/configmap.yaml
kubectl delete -f k8s/secrets.yaml 

# Optional: Delete namespace (this will delete everything in it)
Write-Host "`nDo you want to delete the namespace? (y/n)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'y' -or $response -eq 'Y') {
    kubectl delete namespace microservices
    Write-Host "Namespace deleted." -ForegroundColor Green
}

Write-Host "`nCleanup complete!" -ForegroundColor Green
