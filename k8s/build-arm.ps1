# Build ARM-compatible Docker images for Raspberry Pi deployment
# Run this on your Windows development machine

Write-Host "======================================" -ForegroundColor Green
Write-Host "Building ARM Images for Raspberry Pi" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Configuration
$DOCKER_HUB_USER = "nacnano"      # Docker Hub username
$PLATFORM = "linux/arm/v7"        # Raspberry Pi 3 B+ architecture
$TAG = "latest"

Write-Host "Using Docker Hub user: $DOCKER_HUB_USER" -ForegroundColor Yellow
Write-Host "Building for platform: $PLATFORM" -ForegroundColor Yellow
Write-Host ""

# Check if logged in to Docker Hub
Write-Host "Checking Docker Hub login..." -ForegroundColor Yellow
docker login
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Not logged in to Docker Hub" -ForegroundColor Red
    exit 1
}

# Check if buildx is available
try {
    docker buildx version | Out-Null
} catch {
    Write-Host "Error: Docker buildx is not available" -ForegroundColor Red
    Write-Host "Install Docker Desktop with buildx support" -ForegroundColor Red
    exit 1
}

# Create buildx builder if it doesn't exist
$builderExists = docker buildx ls | Select-String "arm-builder"
if (-not $builderExists) {
    Write-Host "Creating buildx builder for ARM..." -ForegroundColor Yellow
    docker buildx create --name arm-builder --use
    docker buildx inspect --bootstrap
} else {
    docker buildx use arm-builder
}

# Function to build and push image
function Build-And-Push {
    param(
        [string]$Service,
        [string]$Dockerfile,
        [string]$Context
    )
    
    Write-Host "Building $Service..." -ForegroundColor Green
    
    # Build with cache and push to Docker Hub
    docker buildx build `
        --platform $PLATFORM `
        --file $Dockerfile `
        --tag "${DOCKER_HUB_USER}/sds-final-project-${Service}:${TAG}" `
        --cache-from "type=registry,ref=${DOCKER_HUB_USER}/sds-final-project-${Service}:buildcache" `
        --cache-to "type=registry,ref=${DOCKER_HUB_USER}/sds-final-project-${Service}:buildcache,mode=max" `
        --push `
        $Context
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $Service built and pushed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to build $Service" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Build all services
Write-Host "Step 1/4: Building Shrine Service..." -ForegroundColor Yellow
Build-And-Push -Service "shrine-service" -Dockerfile "apps/shrine-service/Dockerfile" -Context "."

Write-Host "Step 2/4: Building Location Service..." -ForegroundColor Yellow
Build-And-Push -Service "location-service" -Dockerfile "apps/location-service/Dockerfile" -Context "."

Write-Host "Step 3/4: Building API Gateway..." -ForegroundColor Yellow
Build-And-Push -Service "api-gateway" -Dockerfile "apps/api-gateway/Dockerfile" -Context "."

Write-Host "Step 4/4: Building Frontend..." -ForegroundColor Yellow
Build-And-Push -Service "frontend" -Dockerfile "frontend/Dockerfile" -Context "frontend"

# Verify images in registry
Write-Host "======================================" -ForegroundColor Green
Write-Host "✓ All ARM images built successfully!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Images available on Docker Hub:" -ForegroundColor Cyan
Write-Host "  - ${DOCKER_HUB_USER}/sds-final-project-shrine-service:${TAG}"
Write-Host "  - ${DOCKER_HUB_USER}/sds-final-project-location-service:${TAG}"
Write-Host "  - ${DOCKER_HUB_USER}/sds-final-project-api-gateway:${TAG}"
Write-Host "  - ${DOCKER_HUB_USER}/sds-final-project-frontend:${TAG}"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. These ARM images can be pulled on Raspberry Pi"
Write-Host "  2. Deploy to Kubernetes: cd terraform && terraform apply"
Write-Host "  3. Images will be automatically pulled from Docker Hub"
Write-Host ""

