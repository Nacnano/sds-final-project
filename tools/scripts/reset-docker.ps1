# Reset for Docker Development (Option B)
# This script stops local services and starts everything in Docker

Write-Host "Resetting for Docker Development..." -ForegroundColor Cyan

# Check if local services are running on ports
Write-Host "Checking for local services on ports..." -ForegroundColor Yellow
$ports = @(3000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5173)
$portsInUse = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        $portsInUse += $port
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host "WARNING: The following ports are in use: $($portsInUse -join ', ')" -ForegroundColor Red
    Write-Host "Please stop local services (Ctrl+C in terminals running pnpm start:all)" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne "y") {
        Write-Host "Cancelled" -ForegroundColor Red
        exit 1
    }
}

# Stop all containers first
Write-Host "Stopping all existing containers..." -ForegroundColor Yellow
docker-compose down

# Build and start all services in Docker
Write-Host "Starting all services in Docker..." -ForegroundColor Green
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d --build

Write-Host ""
Write-Host "Docker development environment ready!" -ForegroundColor Green
Write-Host "Services are running in Docker containers" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access points:" -ForegroundColor White
Write-Host "  - API Gateway: http://localhost:3000" -ForegroundColor Gray
Write-Host "  - Shrine Service: localhost:5001" -ForegroundColor Gray
Write-Host "  - Technique Service: localhost:5002" -ForegroundColor Gray
Write-Host "  - Discovery Service: localhost:5003" -ForegroundColor Gray
Write-Host "  - Wishing Service: localhost:5004" -ForegroundColor Gray
Write-Host "  - User Service: localhost:5005" -ForegroundColor Gray
Write-Host "  - Rating Service: localhost:5006" -ForegroundColor Gray
Write-Host "  - Location Service: localhost:5007" -ForegroundColor Gray
Write-Host "  - pgAdmin: http://localhost:8080" -ForegroundColor Gray
Write-Host ""
Write-Host "View logs: docker-compose logs -f" -ForegroundColor Cyan
