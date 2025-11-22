#!/bin/bash
# Reset for Local Development (Option A)
# This script stops Docker services but keeps databases running

echo "🔄 Resetting for Local Development..."

# Stop all microservice containers (but keep databases)
echo "⏹️  Stopping Docker microservice containers..."
docker-compose stop api-gateway shrine-service technique-service shrine-discovery-service wishing-service user-service rating-service location-service

# Ensure databases are running
echo "🗄️  Starting database containers..."
docker-compose up -d shrine-db user-db wishing-db rating-db rabbitmq

echo ""
echo "✅ Local development environment ready!"
echo "📝 You can now run: pnpm start:all"
echo ""
echo "Services will connect to:"
echo "  - PostgreSQL (shrine-db): localhost:5432"
echo "  - PostgreSQL (user-db): localhost:5434"
echo "  - PostgreSQL (wishing-db): localhost:5433"
echo "  - PostgreSQL (rating-db): localhost:5435"
echo "  - RabbitMQ: localhost:5672"
