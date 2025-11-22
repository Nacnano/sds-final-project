# Shrine Discovery Service

## Overview
The Shrine Discovery Service is a microservice that provides intelligent shrine recommendations based on user wishes, location, and categories. It uses AI-ready categorization and distance-based filtering to help users find the perfect shrine for their specific needs.

## Features
- **AI-Ready Wish Categorization**: Automatically categorizes wishes into types (love, wealth, career, health, general)
- **Location-Based Recommendations**: Finds shrines within a specified radius using GPS coordinates
- **Smart Scoring Algorithm**: Ranks shrines based on category match, distance, and ratings
- **Category Search**: Search shrines by specific categories and provinces
- **Recommendation History**: Tracks user recommendation history in MongoDB

## Architecture
- **Framework**: NestJS with gRPC
- **Database**: MongoDB (for recommendation history)
- **Communication**: gRPC with Shrine Service
- **Port**: 5003 (gRPC)

## API Operations

### 1. Recommend Shrine
Provides personalized shrine recommendations based on user's wish and location.

**Request:**
```typescript
{
  userId: string;
  wishText: string;
  wishCategory?: string;  // Optional: love, career, wealth, health
  latitude?: number;
  longitude?: number;
  maxDistanceKm?: number; // Default: 10km
}
```

**Response:**
```typescript
{
  recommendations: ShrineRecommendation[];
  categorizedWish: string;
}
```

### 2. Get Nearby Shrines
Finds shrines within a specified radius of a location.

**Request:**
```typescript
{
  latitude: number;
  longitude: number;
  radiusKm?: number;    // Default: 10km
  sortBy?: string;      // popularity, rating, distance
}
```

### 3. Search by Category
Searches shrines by category with optional location filtering.

**Request:**
```typescript
{
  category: string;     // love, career, wealth, health
  latitude?: number;
  longitude?: number;
  province?: string;
}
```

## Environment Variables

Add these to your `.env` file:
```bash
SHRINE_DISCOVERY_DATABASE_URI=mongodb://localhost:27017/shrine_discovery
SHRINE_DISCOVERY_SERVICE_URL=localhost:5003
SHRINE_DISCOVERY_GRPC_PORT=5003
SHRINE_SERVICE_URL=localhost:5001
```

## Running the Service

### Development Mode
```bash
# Start just the discovery service
npm run start:dev:discovery

# Start all services
npm run start:all
```

### Production Mode (Docker)
```bash
# Build and start all services
docker-compose up --build

# Or use the npm script
npm run docker:dev
```

## Wish Categorization

The service uses keyword-based categorization (expandable to AI/ML):

- **Love**: love, relationship, marriage
- **Wealth**: money, wealth, rich, 财
- **Career**: job, career, work, business
- **Health**: health, heal, sick
- **General**: Default category for unmatched wishes

## Scoring Algorithm

Shrines are scored based on:
1. **Base Score**: 50 points
2. **Category Match**: +30 points if shrine specializes in the wish category
3. **Distance Bonus**: Up to +20 points (closer = higher score)
4. **Rating**: Integrated from Rating Service (future)

Maximum score: 100 points

## Database Schema

### Shrine Discovery Collection
```typescript
{
  userId: string;
  category: string;
  recommendations: [
    {
      shrineId: string;
      matchScore: number;
    }
  ];
  createdAt: Date;
}
```

## Integration with Other Services

### Shrine Service
- Fetches shrine data via gRPC
- Methods: `findAllShrines()`, `findShrineById()`

### Rating Service (Future)
- Will fetch shrine ratings and performance metrics
- Enhances recommendation scoring

## REST API Endpoints (via API Gateway)

### POST /shrine-discovery/recommend
Recommend shrines based on wish

**Body:**
```json
{
  "wishText": "I want to find true love",
  "wishCategory": "love",
  "latitude": 13.7563,
  "longitude": 100.5018,
  "maxDistanceKm": 10
}
```

### GET /shrine-discovery/nearby
Find nearby shrines

**Query Parameters:**
- `latitude` (required)
- `longitude` (required)
- `radiusKm` (optional)
- `sortBy` (optional)

**Example:**
```
GET /shrine-discovery/nearby?latitude=13.7563&longitude=100.5018&radiusKm=10
```

### GET /shrine-discovery/search/category
Search by category

**Query Parameters:**
- `category` (required)
- `latitude` (optional)
- `longitude` (optional)
- `province` (optional)

**Example:**
```
GET /shrine-discovery/search/category?category=wealth&province=Bangkok
```

## Future Enhancements

1. **AI/ML Integration**
   - Replace keyword-based categorization with NLP models
   - Sentiment analysis for wish text

2. **Advanced Distance Calculation**
   - Implement Haversine formula for accurate GPS calculations
   - Integrate with Google Maps API for real-time distance

3. **Performance Metrics**
   - Track shrine effectiveness (ความขลัง) based on user feedback
   - Integrate with Technique Service for ritual success rates

4. **Personalization**
   - User preference learning
   - Historical recommendation refinement

## Development Notes

- The service is designed to be stateless for horizontal scaling
- Recommendation history is optional and won't fail the main request
- Distance calculations are currently mocked for development
- Category assignments to shrines should come from Shrine Service data

## Testing

```bash
# Unit tests
npm test shrine-discovery-service

# E2E tests
npm run test:e2e shrine-discovery-service
```

## Contributing

When adding new features:
1. Update the proto file first
2. Regenerate TypeScript interfaces: `npm run proto:generate`
3. Update service implementation
4. Add tests
5. Update this README

## License

UNLICENSED
