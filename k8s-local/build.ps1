# Build script for Docker images
Write-Host "Building Docker images for Kubernetes deployment..." -ForegroundColor Green

# Build using docker-compose
Write-Host "`nBuilding images with docker-compose..." -ForegroundColor Yellow
docker-compose build

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild completed successfully!" -ForegroundColor Green

    # List the built images
    Write-Host "`nBuilt images:" -ForegroundColor Cyan
    docker images | Select-String "sds-final-project"
    
    # Tag images for Kubernetes
    Write-Host "`nTagging images for Kubernetes..." -ForegroundColor Yellow
    docker tag sds-final-project-api-gateway:latest api-gateway:latest
    docker tag sds-final-project-shrine-service:latest shrine-service:latest
    docker tag sds-final-project-location-service:latest location-service:latest
    docker tag sds-final-project-frontend:latest frontend:latest
    
    Write-Host "`nImages tagged successfully!" -ForegroundColor Green
    Write-Host "`nKubernetes images:" -ForegroundColor Cyan
    docker images | Select-String -Pattern "api-gateway|shrine-service|location-service|frontend" | Select-String -Pattern "latest"
} else {
    Write-Host "`nBuild failed! Please check the errors above." -ForegroundColor Red
    exit 1
}
