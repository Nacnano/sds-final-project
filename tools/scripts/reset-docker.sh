#!/bin/bash
# Reset for Docker Development (Option B)
# This script stops local services and starts everything in Docker

echo "🔄 Resetting for Docker Development..."

# Check if local services are running on ports
echo "🔍 Checking for local services on ports..."
ports_in_use=false

for port in 3000 5001 5002 5003 5004 5005 5006 5007 5173; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Warning: Port $port is in use"
        ports_in_use=true
    fi
done

if [ "$ports_in_use" = true ]; then
    echo "💡 Please stop local services (Ctrl+C in terminals running pnpm start:all)"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
    fi
fi

# Stop all containers first
echo "⏹️  Stopping all existing containers..."
docker-compose down

# Build and start all services in Docker
echo "🐳 Starting all services in Docker..."
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d --build

echo ""
echo "✅ Docker development environment ready!"
echo "📝 Services are running in Docker containers"
echo ""
echo "Access points:"
echo "  - API Gateway: http://localhost:3000"
echo "  - Shrine Service: localhost:5001"
echo "  - Technique Service: localhost:5002"
echo "  - Discovery Service: localhost:5003"
echo "  - Wishing Service: localhost:5004"
echo "  - User Service: localhost:5005"
echo "  - Rating Service: localhost:5006"
echo "  - Location Service: localhost:5007"
echo "  - pgAdmin: http://localhost:8080"
echo ""
echo "📊 View logs: docker-compose logs -f"
