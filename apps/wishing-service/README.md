# Wishing Service

A microservice for managing wishes at shrines, built with NestJS, gRPC, and PostgreSQL.

## Overview

The Wishing Service allows users to create, read, update, and delete wishes at various shrines. It validates shrine existence by calling the Shrine Service via gRPC.

## Tech Stack

- **Framework**: NestJS
- **Transport**: gRPC (Protocol Buffers)
- **Database**: PostgreSQL (via TypeORM)
- **Port**: 5003 (gRPC)
- **Database Port**: 5433 (PostgreSQL container)

## Data Model

```typescript
{
  id: string;              // Auto-generated 24-char hex ID
  wisher_id: string;       // User ID (no validation)
  shrine_id: string;       // Shrine ID (validated against shrine-service)
  wisher_name?: string;    // Optional wisher name
  description: string;     // Wish description
  public: boolean;         // Visibility flag (default: true)
  createdAt: Date;        // Auto-generated timestamp
  updatedAt: Date;        // Auto-updated timestamp
}
```

## API Endpoints (via API Gateway)

### Create Wish
```http
POST /wishes
Content-Type: application/json

{
  "wisher_id": "user123",
  "shrine_id": "507f1f77bcf86cd799439011",
  "wisher_name": "John Doe",
  "description": "I wish for good health",
  "public": true
}
```

### Get All Wishes (Public)
```http
GET /wishes
```
Returns all public wishes.

### Get Wishes by Shrine (Public)
```http
GET /wishes?shrine_id=507f1f77bcf86cd799439011
```
Returns all public wishes for the specified shrine.

### Get Wishes by Wisher (All)
```http
GET /wishes?wisher_id=user123
```
Returns all wishes (public and private) created by the specified wisher.

### Get Wishes by Wisher at Shrine (All)
```http
GET /wishes?shrine_id=507f1f77bcf86cd799439011&wisher_id=user123
```
Returns all wishes (public and private) created by the wisher at the specified shrine.

### Get Single Wish
```http
GET /wishes/:id
```

### Update Wish
```http
PATCH /wishes/:id
Content-Type: application/json

{
  "description": "Updated wish description",
  "public": false
}
```

### Delete Wish
```http
DELETE /wishes/:id
```

## Environment Variables

```env
# Wishing Service Database
WISHING_DATABASE_HOST=localhost
WISHING_DATABASE_PORT=5433
WISHING_DATABASE_USER=postgres
WISHING_DATABASE_PASSWORD=postgres
WISHING_DATABASE_NAME=wishing_service

# Wishing Service gRPC
WISHING_GRPC_PORT=5003
WISHING_SERVICE_URL=localhost:5003

# Dependencies
SHRINE_SERVICE_URL=localhost:5001
```

## Running Locally

### Individual Service (Development)
```powershell
pnpm run start:dev:wishing
```

### With All Services
```powershell
pnpm run start:all
```

### With Docker
```powershell
pnpm run docker:dev
```

## Features

- **Shrine Validation**: Automatically validates that shrine exists before creating/updating wishes
- **Privacy Control**: Supports public and private wishes
- **Flexible Querying**: Filter wishes by shrine, wisher, or both
- **gRPC Communication**: Uses Protocol Buffers for efficient service-to-service communication
- **PostgreSQL Storage**: Relational database with TypeORM for robust data management

## Implementation Notes

- Shrine ID validation is performed by making a gRPC call to the shrine-service
- The `public` field defaults to `true` if not provided
- Uses 24-character hex ObjectId format for IDs (compatible with MongoDB-style IDs)
- TypeORM `synchronize: true` is enabled for development (disable in production)
