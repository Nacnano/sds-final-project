# Mock Location Database

This location service uses an in-memory mock database instead of external APIs like Google Maps. This approach provides several benefits for demo and development purposes:

## Benefits

1. **No External Dependencies**: Works offline without internet connection
2. **No API Keys Required**: No need to manage API keys or quotas
3. **Consistent Results**: Predictable responses for testing
4. **Fast Response**: No network latency from external API calls
5. **Cost-Free**: No API usage costs

## Available Locations

The mock database includes 20+ common Thai locations and shrines:

### Bangkok

- Erawan Shrine
- Wat Phra Kaew (Temple of the Emerald Buddha)
- Wat Arun (Temple of Dawn)
- Wat Pho (Temple of the Reclining Buddha)
- Golden Mount (Wat Saket)
- Lak Mueang (City Pillar Shrine)
- Wat Benchamabophit (Marble Temple)
- Trimurti Shrine
- Siam
- Sukhumvit
- Chatuchak

### Chiang Mai

- Wat Phra That Doi Suthep
- Wat Chedi Luang
- Wat Phra Singh

### Phuket

- Big Buddha
- Wat Chalong

### Ayutthaya

- Wat Mahathat
- Wat Phra Si Sanphet

## Usage

### Finding Coordinates

The service searches using multiple strategies:

1. **Exact name match** - Perfect match with location name
2. **Partial name match** - Substring matching
3. **Alias/address match** - Matches against known aliases
4. **Fuzzy matching** - Handles misspellings using Levenshtein distance (70% similarity threshold)

Example addresses that work:

```
"Erawan Shrine"
"ศาลพระพรหม"
"494 Ratchadamri Rd, Pathum Wan, Bangkok 10330"
"Wat Phra Kaew"
"Temple of the Emerald Buddha"
"Siam"
```

### Fuzzy Matching for Misspellings

The service uses **Levenshtein distance** (edit distance) algorithm to handle typos and misspellings. It calculates the similarity score between the input and available locations.

**Threshold**: 70% similarity required for a match

**Examples of misspellings that work**:

- "Erwan Shrine" → matches "Erawan Shrine"
- "Wat Pra Kaew" → matches "Wat Phra Kaew"
- "Watt Arun" → matches "Wat Arun"
- "Doi Suthap" → matches "Doi Suthep"
- "Chatujak" → matches "Chatuchak"
- "Big Budha" → matches "Big Buddha"

**How it works**:

1. Try exact and partial matches first (fast path)
2. If no match, calculate similarity score for each location
3. Return best match if similarity ≥ 70%
4. Log when fuzzy matching is used for debugging

### Distance Calculation

The service calculates distance between two locations using the **Haversine formula**, which provides accurate great-circle distances between points on a sphere.

Formula:

```
d = 2r * arcsin(√(sin²((φ₂-φ₁)/2) + cos(φ₁) * cos(φ₂) * sin²((λ₂-λ₁)/2)))
```

Where:

- r = Earth's radius (6,371 km)
- φ = latitude in radians
- λ = longitude in radians

### Duration Estimation

Travel duration is estimated based on:

- Average city traffic speed: 30 km/h
- Formula: `duration = distance / speed`

## API Examples

### Get Coordinates

**Request:**

```typescript
{
  location: 'Erawan Shrine';
}
```

**Response:**

```typescript
{
  lat: 13.7447,
  lng: 100.5396
}
```

### Calculate Distance

**Request:**

```typescript
{
  origin: "Erawan Shrine",
  destination: "Wat Phra Kaew"
}
```

**Response:**

```typescript
{
  distanceText: "1.2 km",
  distanceValue: 1200,  // meters
  durationText: "2 mins",
  durationValue: 144    // seconds
}
```

## Adding New Locations

To add more locations, edit `mock-location.database.ts`:

```typescript
{
  name: 'Your Location Name',
  lat: 13.7563,
  lng: 100.5018,
  province: 'Province Name',
  aliases: ['Alias 1', 'Thai Name', 'Full Address'],
}
```

## Error Handling

The service returns appropriate gRPC errors:

- `NOT_FOUND`: Location not found in database
- `INVALID_ARGUMENT`: Missing required fields

## Migration Notes

This service previously used Google Maps API. Key changes:

### Removed

- `@googlemaps/google-maps-services-js` package
- `GOOGLE_MAPS_API_KEY` environment variable
- External API calls

### Added

- In-memory location database
- Haversine distance calculation
- Duration estimation algorithm

### Unchanged

- gRPC interface (proto file)
- Service method signatures
- Response formats

## Future Enhancements

Possible improvements:

1. Load locations from JSON/CSV file
2. Add more Thai provinces and cities
3. Include elevation data
4. Support coordinate-based search (reverse geocoding)
5. Add traffic-based duration estimates
6. Support multiple languages
