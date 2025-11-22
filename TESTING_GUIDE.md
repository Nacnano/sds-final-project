# Testing Guide - Rating & Discovery Services

## Prerequisites

1. All Docker containers running
2. All databases initialized
3. API Gateway running on port 3000

## 1. Start All Services

```powershell
# Start all services
pnpm run start:all

# Or individually:
pnpm run start:rating-service:dev
pnpm run start:shrine-discovery-service:dev
pnpm run start:api-gateway:dev
```

## 2. Test Rating Service

### 2.1 Create a Rating (JWT Required)

```bash
POST http://localhost:3000/ratings
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "shrineId": "shrine-uuid-here",
  "rating": 5,
  "review": "Amazing shrine! Very peaceful and beautiful."
}
```

### 2.2 Update a Rating (Upsert)

```bash
POST http://localhost:3000/ratings
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
Body:
{
  "shrineId": "same-shrine-uuid",
  "rating": 4,
  "review": "Updated review: Still great!"
}
```

### 2.3 Get Shrine Ratings (Public)

```bash
GET http://localhost:3000/ratings/shrine/{shrineId}?page=1&limit=10
```

### 2.4 Get User Ratings (JWT Required)

```bash
GET http://localhost:3000/ratings/user/{userId}?page=1&limit=10
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

### 2.5 Get Shrine Statistics (Public)

```bash
GET http://localhost:3000/ratings/shrine/{shrineId}/stats

Expected Response:
{
  "shrineId": "...",
  "totalRatings": 42,
  "averageRating": 4.5,
  "ratingDistribution": {
    "5": 20,
    "4": 15,
    "3": 5,
    "2": 1,
    "1": 1
  }
}
```

### 2.6 Delete Rating (JWT Required)

```bash
DELETE http://localhost:3000/ratings/{ratingId}
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

## 3. Test Shrine Discovery Enhancements

### 3.1 Advanced Search

```bash
# Search by query
GET http://localhost:3000/shrine-discovery/search?query=วัดพระแก้ว

# Search by category
GET http://localhost:3000/shrine-discovery/search?category=love&page=1&limit=10

# Search by location
GET http://localhost:3000/shrine-discovery/search?latitude=13.7563&longitude=100.5018&maxDistance=10

# Search with rating filter
GET http://localhost:3000/shrine-discovery/search?minRating=4.0&sortBy=rating

# Combined search
GET http://localhost:3000/shrine-discovery/search?category=wealth&province=Bangkok&latitude=13.7563&longitude=100.5018&maxDistance=20&minRating=4.0&sortBy=distance&page=1&limit=10

Expected Response:
{
  "shrines": [
    {
      "shrineId": "...",
      "shrineName": "...",
      "description": "...",
      "category": "wealth",
      "province": "Bangkok",
      "latitude": 13.7563,
      "longitude": 100.5018,
      "score": 85.5,
      "distance": 2.3,
      "averageRating": 4.5,
      "totalRatings": 100,
      "wishCount": 500
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

### 3.2 Personalized Recommendations

```bash
# Basic recommendation
GET http://localhost:3000/shrine-discovery/recommend-personalized?userId=user-uuid-here

# With location
GET http://localhost:3000/shrine-discovery/recommend-personalized?userId=user-uuid&userLatitude=13.7563&userLongitude=100.5018

# With distance limit
GET http://localhost:3000/shrine-discovery/recommend-personalized?userId=user-uuid&userLatitude=13.7563&userLongitude=100.5018&maxDistance=15&limit=5

Expected Response:
{
  "shrines": [
    {
      "shrineId": "...",
      "shrineName": "...",
      "score": 92.5,
      "distance": 3.2,
      "averageRating": 4.8,
      "category": "love", // User's preferred category
      "totalRatings": 200,
      "wishCount": 800
    }
  ]
}

# Verify scoring:
# Total Score = (Category Match × 0.40) + (Rating × 0.30) + (Popularity × 0.20) + (Distance × 0.10)
```

### 3.3 Aggregated Statistics

```bash
GET http://localhost:3000/shrine-discovery/stats/{shrineId}

Expected Response:
{
  "shrineId": "...",
  "totalRatings": 150,
  "averageRating": 4.5,
  "ratingDistribution": {
    "5": 80,
    "4": 50,
    "3": 15,
    "2": 3,
    "1": 2
  },
  "totalWishes": 800,
  "recentWishes": 120,
  "topWishCategories": [
    { "category": "love", "count": 300 },
    { "category": "wealth", "count": 250 },
    { "category": "health", "count": 150 }
  ]
}
```

## 4. Verification Checklist

### Rating Service

- [ ] Can create new ratings
- [ ] Can update existing ratings (upsert works)
- [ ] Rating validation works (1-5 only)
- [ ] Review length validation works (500 chars max)
- [ ] Pagination works correctly
- [ ] Statistics calculation is accurate
- [ ] JWT authentication enforced on protected endpoints
- [ ] Users can only modify their own ratings
- [ ] Admins can view all ratings
- [ ] Delete works correctly

### Discovery Service

- [ ] Text search works (name, description)
- [ ] Category filtering works
- [ ] Province filtering works
- [ ] Location-based search with distance works
- [ ] Rating filter works correctly
- [ ] Multiple sort options work (rating, distance, popularity)
- [ ] Pagination works
- [ ] Personalized recommendations return relevant shrines
- [ ] Scoring algorithm weights correctly:
  - [ ] Category match: 40%
  - [ ] Average rating: 30%
  - [ ] Popularity: 20%
  - [ ] Distance: 10%
- [ ] User preferences considered in recommendations
- [ ] Aggregated statistics from both services are correct

### Integration

- [ ] API Gateway routes to correct services
- [ ] gRPC communication works between services
- [ ] Database connections stable
- [ ] Error handling works correctly
- [ ] Response times acceptable (<500ms for most queries)

## 5. Performance Testing

### Load Test Recommendations

```bash
# Use k6 for load testing
k6 run testing/scripts/k6-load-test.js
```

### Expected Performance

- Rating CRUD: < 100ms
- Search queries: < 300ms
- Recommendations: < 500ms (includes multiple service calls)
- Statistics: < 200ms

## 6. Troubleshooting

### Service Won't Start

1. Check if database containers are running: `docker ps`
2. Check logs: `docker logs rating-db` or `pnpm run start:rating-service:dev`
3. Verify environment variables
4. Check port conflicts

### gRPC Connection Errors

1. Verify service URLs in environment variables
2. Check if services are listening on correct ports
3. Verify proto files are identical across services

### Database Connection Errors

1. Check database credentials in environment variables
2. Verify database is initialized
3. Check network connectivity between containers

### Authentication Errors

1. Verify JWT token is valid
2. Check Authorization header format: `Bearer <token>`
3. Verify user exists in user-service

## 7. Postman Collection

Import the collections from:

- `tools/postman/rating-service.postman.json` (if created)
- `tools/postman/shrine-discovery.postman.json`

## 8. Next Steps After Testing

1. Fix any bugs found during testing
2. Compile proto files with protoc
3. Replace temporary interfaces with compiled types
4. Add monitoring and logging
5. Deploy to staging environment
6. Performance optimization if needed
7. Documentation updates

---

**Note:** Replace placeholder UUIDs and JWT tokens with actual values from your system.
