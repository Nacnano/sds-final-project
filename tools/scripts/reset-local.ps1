# Reset for Local Development (Option A)
# This script stops Docker services but keeps databases running

Write-Host "Resetting for Local Development..." -ForegroundColor Cyan

# Stop all microservice containers (but keep databases)
Write-Host "Stopping Docker microservice containers..." -ForegroundColor Yellow
docker-compose stop api-gateway shrine-service technique-service shrine-discovery-service wishing-service user-service rating-service location-service

# Ensure databases are running
Write-Host "Starting database containers..." -ForegroundColor Green
docker-compose up -d shrine-db user-db wishing-db rating-db rabbitmq

Write-Host ""
Write-Host "Local development environment ready!" -ForegroundColor Green
Write-Host "You can now run: pnpm start:all" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services will connect to:" -ForegroundColor White
Write-Host "  - PostgreSQL (shrine-db): localhost:5432" -ForegroundColor Gray
Write-Host "  - PostgreSQL (user-db): localhost:5434" -ForegroundColor Gray
Write-Host "  - PostgreSQL (wishing-db): localhost:5433" -ForegroundColor Gray
Write-Host "  - PostgreSQL (rating-db): localhost:5435" -ForegroundColor Gray
Write-Host "  - RabbitMQ: localhost:5672" -ForegroundColor Gray
