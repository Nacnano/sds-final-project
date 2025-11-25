# Delete all resources
Write-Host "Deleting all Kubernetes resources..." -ForegroundColor Red

# Delete in reverse order of deployment
Write-Host "`n1. Deleting pgAdmin..." -ForegroundColor Yellow
kubectl delete -f k8s-local/pgadmin.yaml

Write-Host "`n2. Deleting API Gateway..." -ForegroundColor Yellow
kubectl delete -f k8s-local/api-gateway.yaml

Write-Host "`n3. Deleting microservices..." -ForegroundColor Yellow
kubectl delete -f k8s-local/location-service.yaml
kubectl delete -f k8s-local/shrine-service.yaml

Write-Host "`n4. Deleting RabbitMQ..." -ForegroundColor Yellow
kubectl delete -f k8s-local/rabbitmq.yaml

Write-Host "`n5. Deleting databases..." -ForegroundColor Yellow
kubectl delete -f k8s-local/shrine-db.yaml

Write-Host "`n6. Deleting ConfigMap and Secrets..." -ForegroundColor Yellow
kubectl delete -f k8s-local/configmap.yaml
kubectl delete -f k8s-local/secrets.yaml 

# Optional: Delete namespace (this will delete everything in it)
Write-Host "`nDo you want to delete the namespace? (y/n)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'y' -or $response -eq 'Y') {
    kubectl delete namespace microservices
    Write-Host "Namespace deleted." -ForegroundColor Green
}

Write-Host "`nCleanup complete!" -ForegroundColor Green
