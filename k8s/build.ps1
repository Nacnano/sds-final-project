# Build script for Docker images
Write-Host "Building Docker images for Kubernetes deployment..." -ForegroundColor Green

# Build using docker-compose
Write-Host "`nBuilding images with docker-compose..." -ForegroundColor Yellow
docker-compose build

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild completed successfully!" -ForegroundColor Green
    
    Write-Host "`nBuilding frontend image..." -ForegroundColor Yellow
    docker build -t microservice-frontend:latest frontend

    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nFrontend build failed! Please check the errors above." -ForegroundColor Red
        exit 1
    }

    # List the built images
    Write-Host "`nBuilt images:" -ForegroundColor Cyan
    docker images | Select-String "microservice"
    
    # Tag images for Kubernetes
    Write-Host "`nTagging images for Kubernetes..." -ForegroundColor Yellow
    docker tag microservice-api-gateway:latest api-gateway:latest
    docker tag microservice-shrine-service:latest shrine-service:latest
    docker tag microservice-user-service:latest user-service:latest
    docker tag microservice-technique-service:latest technique-service:latest
    docker tag microservice-location-service:latest location-service:latest
    docker tag microservice-rating-service:latest rating-service:latest
    docker tag microservice-shrine-discovery-service:latest shrine-discovery-service:latest
    docker tag microservice-wishing-service:latest wishing-service:latest
    docker tag microservice-rating-service:latest rating-service:latest
    docker tag microservice-location-service:latest location-service:latest
    docker tag microservice-frontend:latest frontend:latest
    
    Write-Host "`nImages tagged successfully!" -ForegroundColor Green
    Write-Host "`nKubernetes images:" -ForegroundColor Cyan
    docker images | Select-String -Pattern "api-gateway|shrine-service|user-service|technique-service|location-service|rating-service|shrine-discovery-service|wishing-service|frontend" | Select-String -Pattern "latest"
} else {
    Write-Host "`nBuild failed! Please check the errors above." -ForegroundColor Red
    exit 1
}
