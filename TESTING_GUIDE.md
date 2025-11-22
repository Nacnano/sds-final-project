# Testing Guide - Shrine Discovery Platform

## Prerequisites

1. All Docker containers running
2. Database initialized with seed data
3. API Gateway running on port 3000

## 1. Start All Services

```powershell
# Start all services
pnpm run start:all

# Or individually:
pnpm run start:dev:shrine
pnpm run start:dev:location
pnpm run start:dev:gateway
pnpm run start:dev:frontend
```

## 2. Test Shrine Service

### 2.1 Get All Shrines

```http
GET http://localhost:3000/shrines
```

**Expected Response:**

```json
[
  {
    "id": "6731a1b2c4d5e6f7a8b9c0d1",
    "name": "Erawan Shrine",
    "description": "Famous Hindu shrine...",
    "location": "494 Ratchadamri Rd, Pathum Wan, Bangkok 10330",
    "category": "career",
    "lat": 13.7447,
    "lng": 100.5396,
    "imageUrl": "https://..."
  }
]
```

### 2.2 Get Shrine by ID

```http
GET http://localhost:3000/shrines/{shrineId}
```

### 2.3 Create Shrine

```http
POST http://localhost:3000/shrines
Content-Type: application/json

{
  "name": "Test Shrine",
  "description": "A test shrine for development",
  "location": "Test Location, Bangkok",
  "category": "spiritual",
  "lat": 13.7563,
  "lng": 100.5018
}
```

### 2.4 Update Shrine

```http
PUT http://localhost:3000/shrines/{shrineId}
Content-Type: application/json

{
  "name": "Updated Shrine Name",
  "description": "Updated description"
}
```

### 2.5 Delete Shrine

```http
DELETE http://localhost:3000/shrines/{shrineId}
```

## 3. Test Location Service

### 3.1 Find Nearby Shrines

```http
POST http://localhost:3000/location/nearby
Content-Type: application/json

{
  "lat": 13.7563,
  "lng": 100.5018,
  "radius": 5000
}
```

**Expected Response:**

```json
{
  "shrines": [
    {
      "id": "6731a1b2c4d5e6f7a8b9c0d1",
      "name": "Erawan Shrine",
      "distance": 1250.5
    }
  ]
}
```

### 3.2 Calculate Distance

```http
POST http://localhost:3000/location/distance
Content-Type: application/json

{
  "lat1": 13.7563,
  "lng1": 100.5018,
  "lat2": 13.7447,
  "lng2": 100.5396
}
```

## 4. Database Seeding

### 4.1 Seed Shrine Data

```powershell
pnpm db:seed:shrines
```

This will populate the shrine database with 10 sample shrines in Bangkok.

## 5. Frontend Testing

### 5.1 Access Frontend

Open browser: http://localhost:5173

### 5.2 Test Features

1. **Dashboard** - View all shrines
2. **Shrine Details** - Click on a shrine card
3. **Map View** - See shrine locations with coordinates
4. **Search** - Filter shrines by name or category

## 6. Load Testing

### 6.1 Start Load Testing Infrastructure

```powershell
cd testing
docker-compose up -d
```

### 6.2 Access Grafana Dashboard

Open browser: http://localhost:4000

- Username: admin
- Password: admin

### 6.3 Run Custom Load Test

```powershell
# Set test parameters
$env:VUS = "100"
$env:DURATION = "2m"
$env:BASE_URL = "http://localhost:3000"

# Start test
docker-compose up --scale k6-node=3 -d
```

## 7. Common Issues

### Database Connection Error

**Problem:** Services can't connect to database

**Solution:**

```powershell
# Check if database is running
docker ps | findstr shrine-db

# Restart database
docker-compose restart shrine-db

# Check logs
docker-compose logs shrine-db
```

### Port Already in Use

**Problem:** Port 3000 or 5173 already in use

**Solution:**

```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill the process or restart Docker
docker-compose down
pnpm start:all
```

### Seed Data Not Loading

**Problem:** Database is empty after seeding

**Solution:**

```powershell
# Check database connection
docker exec -it shrine-db psql -U postgres -d shrine_service -c "SELECT COUNT(*) FROM shrines;"

# Re-run seed script
pnpm db:seed:shrines
```

## 8. API Testing with Postman

Import the Postman collection from `tools/postman/` for ready-to-use API requests.

## 9. Health Checks

### 9.1 Check API Gateway

```http
GET http://localhost:3000/health
```

### 9.2 Check Services

```powershell
# Shrine Service
curl http://localhost:5001

# Location Service
curl http://localhost:5007
```

## 10. Docker Status

### 10.1 View Running Containers

```powershell
docker-compose ps
```

### 10.2 View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f shrine-service
```

## Summary

- **API Gateway**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **Shrine DB**: localhost:5432
- **Grafana**: http://localhost:4000
- **pgAdmin**: http://localhost:5050

For more details, see README.md and DEVELOPMENT.md.
