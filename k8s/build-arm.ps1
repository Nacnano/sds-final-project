# Build ARM-compatible Docker images for Raspberry Pi deployment
# Run this on your Windows development machine

Write-Host "======================================" -ForegroundColor Green
Write-Host "Building ARM Images for Raspberry Pi" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Configuration
$REGISTRY = "192.168.0.103:5000"  # Change this to your master node IP
$PLATFORM = "linux/arm/v7"        # Raspberry Pi 3 B+ architecture
$TAG = "latest"

Write-Host "Using registry: $REGISTRY" -ForegroundColor Yellow
Write-Host "Building for platform: $PLATFORM" -ForegroundColor Yellow
Write-Host ""

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
    
    docker buildx build `
        --platform $PLATFORM `
        --file $Dockerfile `
        --tag "$REGISTRY/${Service}:$TAG" `
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
Write-Host "Verifying images in registry..." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://${REGISTRY}/v2/_catalog"
    $response | ConvertTo-Json
} catch {
    Write-Host "Warning: Could not verify registry contents" -ForegroundColor Yellow
    Write-Host "Make sure registry is running: docker run -d -p 5000:5000 --restart=always --name registry registry:2" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "✓ All images built successfully!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Images available at:" -ForegroundColor Cyan
Write-Host "  - ${REGISTRY}/shrine-service:${TAG}"
Write-Host "  - ${REGISTRY}/location-service:${TAG}"
Write-Host "  - ${REGISTRY}/api-gateway:${TAG}"
Write-Host "  - ${REGISTRY}/frontend:${TAG}"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Verify images on Raspberry Pi: docker pull ${REGISTRY}/shrine-service:${TAG}"
Write-Host "  2. Deploy to Kubernetes: kubectl apply -f k8s/"
Write-Host ""
