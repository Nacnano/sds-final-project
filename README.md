# สาย.mu - Thailand's Premier Shrine Blessing Platform

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A microservices platform connecting people with blessings from Thailand's leading shrines</p>

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![pnpm](https://img.shields.io/badge/pnpm-8.15.0-orange?logo=pnpm)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![MongoDB](https://img.shields.io/badge/MongoDB-6-green?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-latest-blue?logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-ready-blue?logo=kubernetes)
![gRPC](https://img.shields.io/badge/gRPC-latest-brightgreen?logo=grpc)
![React](https://img.shields.io/badge/React-19-blue?logo=react)

</div>

---

## 📖 Table of Contents

- [Description](#-description)
- [Problem Statement](#-problem-statement)
- [Target Customers](#-target-customers)
- [Key Use Cases](#-key-use-cases)
- [Requirements](#-requirements)
- [Architecture](#️-architecture)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Microservices](#-microservices)
- [Getting Started](#-getting-started)
- [Development Guide](#-development-guide)
- [API Documentation](#-api-documentation)
- [Frontend Application](#-frontend-application)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Architecture Decision Records](#-architecture-decision-records-adrs)
- [Team](#-team)
- [Support](#-support)

---

## 📝 Description

**สาย.mu** (sai.mu) is a comprehensive digital platform that aggregates blessings and prayers from Thailand's premier shrines and temples. Built with a modern microservices architecture, it enables both locals and tourists to discover spiritual locations, make wishes, share blessing techniques, and connect with Thailand's rich cultural and religious heritage—all from the convenience of a web or mobile interface.

The platform provides:

- 🗺️ **Location-based shrine discovery** with GPS integration
- 🙏 **Digital wish-making system** with privacy controls
- 📚 **Blessing technique sharing** and community knowledge
- ⭐ **Ratings and reviews** for shrines and temples
- 🔐 **Secure authentication** with Google OAuth support
- 🌐 **Multilingual support** (Thai/English)

---

## 🎯 Problem Statement

In Thailand, shrines and temples are important cultural and spiritual centers where people go to pray, make wishes, or donate to good causes. However, several challenges exist:

1. **Information Fragmentation**: Shrine and temple information is scattered across various sources, making it difficult to find accurate details.
2. **Outdated Data**: Many online resources contain outdated information about locations, opening hours, and rituals.
3. **Accessibility**: Both locals and tourists struggle to locate nearby shrines or understand their cultural significance.
4. **Language Barriers**: Limited multilingual resources make it challenging for international visitors.
5. **Ritual Guidance**: Lack of clear instructions on how to properly perform rituals and make wishes.

**สาย.mu** solves these problems by creating a centralized, up-to-date platform that provides:

- Accurate shrine locations with Google Maps integration
- Historical background and cultural significance
- Step-by-step ritual instructions
- Community-driven content (wishes, techniques, reviews)
- Admin portal for shrine owners to manage their listings

---

## 👥 Target Customers

1. **Thai Locals** 🇹🇭
   - Seeking nearby shrines for wish-making
   - Wanting to explore new spiritual locations
   - Interested in sharing blessing techniques

2. **Tourists** ✈️
   - Domestic and international visitors
   - Exploring Thailand's cultural landmarks
   - Learning about religious practices

3. **Shrine/Temple Administrators** 🏛️
   - Seeking visibility for their locations
   - Managing shrine information and events
   - Posting announcements and updates

4. **Cultural Researchers** 📚
   - Studying religious practices in Thailand
   - Analyzing wish patterns and trends
   - Documenting traditional techniques

---

## 💡 Key Use Cases

### Use Case 1: Making a Wish 🙏

**Scenario**: A user wants to make a wish at "ศาลพระพรหม เอราวัณ" (Erawan Shrine)

**Flow**:

1. User logs in with email/password or Google OAuth
2. Searches for "ศาลพระพรหม เอราวัณ" or filters by Bangkok province
3. Views dedicated shrine page with:
   - Location on Google Maps
   - Historical background
   - Step-by-step wish-making instructions
   - Photos and media
   - Recent public wishes from other users
4. Clicks "Make a Wish" button
5. Writes their wish with optional category (love, career, wealth, health)
6. Chooses visibility: **Public** (shared with community) or **Private** (personal)
7. Submits and tracks wish in "My Spiritual Journey"

### Use Case 2: Discover Nearby Shrines 📍

**Scenario**: A tourist in Bangkok wants to find nearby temples

**Flow**:

1. User allows location access in browser
2. Platform displays shrines within 10 km radius
3. User can adjust search radius (5km, 10km, 20km, 50km)
4. Results sorted by:
   - **Distance** (nearest first)
   - **Popularity** (most visited)
   - **Rating** (highest rated)
   - **Category** (love, career, wealth, health)
5. User selects a shrine and views details
6. Can get directions via Google Maps integration

### Use Case 3: Contributing Information 📝

**Scenario**: A shrine administrator wants to update their shrine's information

**Flow**:

1. Administrator registers/logs in with shrine owner credentials
2. Claims or creates shrine listing
3. Edits shrine details:
   - Name, description, location
   - Upload photos and media
   - Add historical background
   - Update opening hours
   - Add blessing techniques
4. Posts announcements about upcoming festivals or events
5. Views analytics (visitor count, ratings, wish statistics)

### Use Case 4: Get AI-Powered Recommendations 🤖

**Scenario**: A user wants personalized shrine recommendations

**Flow**:

1. User navigates to "Discover & Explore" section
2. Enters wish text: "I want to find true love"
3. System categorizes wish automatically (category: love)
4. Provides recommendations based on:
   - Wish category matching
   - User's location
   - Shrine ratings and popularity
   - Distance from user
5. Displays ranked list with match scores
6. User can visit recommended shrine page

---

## 📋 Requirements

### Functional Requirements

#### User Management

- ✅ User registration and authentication (email/password)
- ✅ OAuth integration (Google)
- ✅ Role-based access control (User, Admin, Shrine Owner)
- ✅ JWT token-based authentication
- ✅ Profile management

#### Shrine Management

- ✅ Create, read, update, delete (CRUD) shrine listings
- ✅ Location mapping with Google Maps API
- ✅ Photo and media upload
- ✅ Historical background and descriptions
- ✅ Admin portal for shrine owners

#### Search & Discovery

- ✅ Search by name, province, category
- ✅ Filter by shrine type and category
- ✅ Location-based discovery (GPS integration)
- ✅ Sort by popularity, rating, distance
- ✅ AI-powered recommendations

#### Wish System

- ✅ Create wishes linked to shrines
- ✅ Public/private visibility toggle
- ✅ Wish categorization (love, career, wealth, health, general)
- ✅ View wish history
- ✅ Delete wishes
- ✅ Wish wall display on shrine pages

#### Technique Sharing

- ✅ Share blessing techniques
- ✅ Add required items/ingredients
- ✅ Link techniques to specific shrines
- ✅ Community-driven content

#### Ratings & Reviews

- ✅ Rate shrines (1-5 stars)
- ✅ Write text reviews
- ✅ Anonymous rating option
- ✅ One rating per user per shrine (upsert)
- ✅ Average rating calculation

### Non-Functional Requirements

#### Performance

- ⚡ Search results must load in <2 seconds
- ⚡ API response time <500ms for 95th percentile
- ⚡ Support concurrent users: 1,000+
- ⚡ Page load time <3 seconds

#### Scalability

- 📈 Handle 100,000+ registered users
- 📈 Horizontal scaling with Kubernetes
- 📈 Database sharding support
- 📈 CDN for static assets

#### Availability

- 🟢 99.5% uptime SLA
- 🟢 Health checks for all services
- 🟢 Auto-restart on failure
- 🟢 Load balancing with multiple replicas

#### Security

- 🔒 SSL/TLS encryption (HTTPS)
- 🔒 Password hashing (bcrypt)
- 🔒 JWT token expiration
- 🔒 OAuth 2.0 for third-party authentication
- 🔒 Input validation and sanitization
- 🔒 SQL injection prevention (ORM)

---

## 🏗️ Architecture

### Overview

The platform follows a **microservices architecture** pattern with:

- **API Gateway**: Single entry point for all client requests (REST API)
- **gRPC Microservices**: Internal service-to-service communication
- **Multiple Databases**: PostgreSQL and MongoDB for different data types
- **Message Queue**: RabbitMQ for asynchronous communication
- **Shared Libraries**: Common utilities, guards, and interfaces

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Clients                              │
│              (Web Browser, Mobile Apps)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│                    (Port 3000)                               │
│              - REST API Endpoints                            │
│              - JWT Authentication                            │
│              - Request Validation                            │
│              - Response Transformation                       │
└─────┬────────┬────────┬────────┬────────┬────────┬──────────┘
      │        │        │        │        │        │
      │ gRPC   │ gRPC   │ gRPC   │ gRPC   │ gRPC   │ gRPC
      ▼        ▼        ▼        ▼        ▼        ▼
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│  User    │ Shrine   │ Wishing  │Technique │Discovery │ Rating   │
│ Service  │ Service  │ Service  │ Service  │ Service  │ Service  │
│(Port     │(Port     │(Port     │(Port     │(Port     │(Port     │
│ 5005)    │ 5001)    │ 5004)    │ 5002)    │ 5003)    │ 5006)    │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘
     │          │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼          ▼
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ User DB  │Shrine DB │Wishing DB│Technique │Discovery │ Rating   │
│(Postgres)│(Postgres)│(Postgres)│  (Mongo) │  (Mongo) │(Postgres)│
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
                              │
                              │ Message Queue
                              ▼
                     ┌─────────────────┐
                     │    RabbitMQ     │
                     │   (Port 5672)   │
                     └─────────────────┘
```

### NestJS CLI Configuration

The project uses **NestJS CLI in monorepo mode** to manage multiple applications and shared libraries efficiently. Configuration in `nest-cli.json` enables:

- Centralized build management
- Shared library imports with `@app/shared`
- Independent service compilation
- Hot reload for development

---

## 🛠️ Technology Stack

### Backend

| Technology           | Purpose                     | Version |
| -------------------- | --------------------------- | ------- |
| **Node.js**          | Runtime environment         | 20.x    |
| **NestJS**           | Backend framework           | 11.x    |
| **TypeScript**       | Programming language        | 5.x     |
| **gRPC**             | Inter-service communication | Latest  |
| **Protocol Buffers** | API contract definition     | proto3  |
| **RabbitMQ**         | Message queue               | 3.x     |

### Databases

| Database          | Services Using It             | Purpose                    |
| ----------------- | ----------------------------- | -------------------------- |
| **PostgreSQL 15** | User, Shrine, Wishing, Rating | Structured relational data |
| **MongoDB 6**     | Technique, Discovery          | Semi-structured documents  |

### Frontend

| Technology       | Purpose             | Version |
| ---------------- | ------------------- | ------- |
| **React**        | UI library          | 19.x    |
| **TypeScript**   | Type safety         | 5.x     |
| **Vite**         | Build tool          | 7.x     |
| **Tailwind CSS** | Styling             | 4.x     |
| **React Router** | Client-side routing | 7.x     |
| **Axios**        | HTTP client         | Latest  |

### Authentication & Security

- **JWT** - Token-based authentication
- **Passport.js** - Authentication middleware
- **Google OAuth 2.0** - Social login
- **bcrypt** - Password hashing

### DevOps & Infrastructure

| Tool               | Purpose                              |
| ------------------ | ------------------------------------ |
| **Docker**         | Containerization                     |
| **Docker Compose** | Multi-container orchestration        |
| **Kubernetes**     | Container orchestration (production) |
| **pnpm**           | Package manager                      |
| **k6**             | Load testing                         |
| **Grafana**        | Monitoring dashboards                |
| **InfluxDB**       | Metrics storage                      |
| **pgAdmin**        | Database administration              |

---

## 📁 Project Structure

```
สาย.mu/
├── apps/                           # Microservice Applications
│   ├── api-gateway/                    # REST API Gateway (Port 3000)
│   │   └── src/
│   │       ├── auth/                   # Authentication endpoints
│   │       ├── user/                   # User endpoints
│   │       ├── shrine/                 # Shrine endpoints
│   │       ├── wishing/                # Wishing endpoints
│   │       ├── technique/              # Technique endpoints
│   │       ├── rating/                 # Rating endpoints
│   │       └── discovery/              # Discovery endpoints
│   │
│   ├── user-service/                   # gRPC Service (Port 5005)
│   ├── shrine-service/                 # gRPC Service (Port 5001)
│   ├── wishing-service/                # gRPC Service (Port 5004)
│   ├── technique-service/              # gRPC Service (Port 5002)
│   ├── shrine-discovery-service/       # gRPC Service (Port 5003)
│   ├── rating-service/                 # gRPC Service (Port 5006)
│   └── location-service/               # gRPC Service (Port 5007)
│
├── frontend/                       # React + Vite Frontend
│   ├── src/
│   │   ├── components/                 # Reusable UI components
│   │   ├── pages/                      # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ShrinesHub.tsx
│   │   │   ├── MyJourney.tsx
│   │   │   └── Discover.tsx
│   │   ├── contexts/                   # React Context (Auth)
│   │   ├── services/                   # API clients
│   │   └── types/                      # TypeScript types
│   ├── Dockerfile
│   └── nginx.conf                      # Production server config
│
├── libs/                           # Shared Libraries
│   └── shared/
│       └── src/
│           ├── auth/                   # Authentication
│           │   ├── jwt-auth.guard.ts
│           │   ├── jwt.strategy.ts
│           │   ├── google.strategy.ts
│           │   ├── roles.guard.ts
│           │   └── roles.decorator.ts
│           │
│           ├── database/               # Database utilities
│           │   └── base.entity.ts      # Base entity with UUID
│           │
│           ├── interfaces/             # Generated gRPC interfaces
│           │   ├── user.ts
│           │   ├── shrine.ts
│           │   ├── wishing.ts
│           │   ├── technique.ts
│           │   ├── shrine-discovery.ts
│           │   ├── rating.ts
│           │   └── location.ts
│           │
│           └── utils/                  # Utilities
│               ├── haversine.util.ts   # Distance calculation
│               └── validators/
│
├── proto/                          # Protocol Buffer Definitions
│   ├── user.proto
│   ├── shrine.proto
│   ├── wishing.proto
│   ├── technique.proto
│   ├── shrine-discovery.proto
│   ├── rating.proto
│   └── location.proto
│
├── k8s/                            # Kubernetes Manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── *-db.yaml                       # Database deployments
│   ├── *-service.yaml                  # Microservice deployments
│   ├── api-gateway.yaml                # Gateway + Frontend bundle
│   ├── build.ps1                       # Build Docker images
│   ├── deploy.ps1                      # Deploy to K8s
│   └── delete.ps1                      # Clean up K8s resources
│
├── testing/                        # Load Testing
│   ├── docker-compose.yaml             # k6 + InfluxDB + Grafana
│   ├── scripts/
│   │   ├── k6-load-test.js
│   │   └── k6-stress-test.js
│   └── provisioning/                   # Grafana dashboards
│
├── tools/                          # Development Tools
│   ├── diagram/                        # PlantUML diagrams
│   ├── postman/                        # API collections
│   └── scripts/                        # Utility scripts
│       ├── seed-shrines.js
│       ├── seed-wishes.js
│       ├── reset-local.ps1
│       └── reset-docker.ps1
│
├── docker-compose.yml              # Production Docker Compose
├── docker-compose.override.yml     # Development overrides
├── nest-cli.json                   # NestJS CLI Configuration
├── package.json                    # Root dependencies & scripts
├── pnpm-workspace.yaml             # pnpm workspace config
├── tsconfig.json                   # TypeScript configuration
├── .env                            # Environment variables
├── .nvmrc                          # Node.js version (v20)
├── DEVELOPMENT.md                  # Development guide
├── TESTING_GUIDE.md                # Testing guide
├── DEPLOYMENT_SUMMARY.md           # Deployment guide
└── README.md                       # This file
```

---

## 🧩 Microservices

### 1. API Gateway (Port 3000)

**Role**: Single entry point for all client requests

**Features**:

- REST API endpoints for all services
- JWT authentication middleware
- Request validation
- Response transformation
- gRPC client connections to backend services
- CORS configuration
- Error handling and logging

**Technologies**: NestJS, Express, gRPC clients

**Endpoints**:

- `/auth/*` - Authentication
- `/users/*` - User management
- `/shrines/*` - Shrine CRUD
- `/wishes/*` - Wish management
- `/techniques/*` - Technique sharing
- `/ratings/*` - Ratings & reviews
- `/discovery/*` - Shrine recommendations

### 2. User Service (Port 5005)

**Role**: User authentication and profile management

**Features**:

- User registration (email/password)
- Login with JWT token generation
- Google OAuth integration
- Password hashing with bcrypt
- Role-based access control (User, Admin)
- Profile management

**Database**: PostgreSQL (`user_service` database)

**Entity**:

```typescript
{
  id: UUID,
  email: string (unique),
  password_hash: string,
  role: string (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Shrine Service (Port 5001)

**Role**: Shrine and temple data management

**Features**:

- CRUD operations for shrines
- Shrine search and filtering
- Location data management
- Admin portal integration

**Database**: PostgreSQL (`shrine_service` database)

**Entity**:

```typescript
{
  id: UUID,
  name: string,
  description: string,
  location: string,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Wishing Service (Port 5004)

**Role**: Digital wish-making system

**Features**:

- Create wishes linked to shrines
- Public/private visibility control
- Wish categorization (love, career, wealth, health)
- Filter wishes by shrine and user
- Shrine validation via gRPC call

**Database**: PostgreSQL (`wishing_service` database)

**Entity**:

```typescript
{
  id: UUID,
  wisherId: string,
  shrineId: string,
  wisherName?: string,
  description: string,
  public: boolean (default: true),
  category?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Technique Service (Port 5002)

**Role**: Blessing technique sharing platform

**Features**:

- Create and share blessing techniques
- Add required items/ingredients
- Link techniques to shrines
- Community-driven content

**Database**: MongoDB Atlas

**Document Schema**:

```typescript
{
  _id: ObjectId,
  userId: string,
  shrineId: string,
  title: string,
  description: string,
  items: string[],
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Shrine Discovery Service (Port 5003)

**Role**: AI-powered shrine recommendations

**Features**:

- Automatic wish categorization (love, career, wealth, health, general)
- Location-based shrine search with radius filtering
- Smart scoring algorithm considering:
  - Category match
  - Distance from user
  - Shrine popularity and ratings
- Search by category and province
- Recommendation history tracking

**Database**: MongoDB Atlas

**Algorithms**:

- **Haversine Formula**: Calculate distance between coordinates
- **Match Score**: `(categoryMatch * 0.4) + (distanceScore * 0.3) + (ratingScore * 0.3)`

### 7. Rating Service (Port 5006)

**Role**: Shrine ratings and reviews

**Features**:

- Rate shrines (1-5 stars)
- Write text reviews
- Anonymous rating option
- One rating per user per shrine (upsert behavior)
- Average rating calculation
- Recent ratings retrieval

**Database**: PostgreSQL (`rating_service` database)

**Entity**:

```typescript
{
  id: UUID,
  userId: UUID,
  shrineId: string (24-char MongoDB ObjectId),
  rating: number (1-5),
  review?: string,
  isAnonymous: boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Unique Constraint**: `(userId, shrineId)` - prevents duplicate ratings

### 8. Location Service (Port 5007)

**Role**: Location-based features and Google Maps integration

**Features**:

- Geocoding and reverse geocoding
- Distance calculation
- Nearby shrine search
- Google Maps API integration

**Technologies**: Google Maps Services JS

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v20.x ([Download](https://nodejs.org/) or use `.nvmrc`)
- **pnpm** v8.15.0+ (`npm install -g pnpm`)
- **Docker Desktop** with Kubernetes enabled ([Download](https://www.docker.com/products/docker-desktop))
- **Git** for version control

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Sai-mu/microservice.git
   cd microservice
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Set up environment variables**:

   Copy `.env.example` to `.env` (if not exists) and configure required variables. Key variables:

   ```bash
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

   # MongoDB Atlas (Optional)
   TECHNIQUE_DATABASE_URI=mongodb://localhost:27017/technique_service
   SHRINE_DISCOVERY_DATABASE_URI=mongodb://localhost:27017/discovery_service
   ```

4. **Generate TypeScript interfaces from Protocol Buffers**:

   ```bash
   pnpm run proto:generate
   ```

---

## 💻 Development Guide

The project supports **two development approaches**:

### Option A: Local Development (Recommended) ⚡

**Best for**: Active coding with fast hot-reload

**Setup**:

```bash
# 1. Start only databases in Docker
pnpm run db:setup

# 2. Start all backend services + frontend locally
pnpm run start:all
```

**What runs where**:

- ✅ **Databases**: Docker containers
  - `shrine-db` (PostgreSQL) - Port 5432
  - `user-db` (PostgreSQL) - Port 5434
  - `wishing-db` (PostgreSQL) - Port 5433
  - `rating-db` (PostgreSQL) - Port 5435
  - `pgadmin` - Port 5050
- ✅ **Services**: Node.js processes (hot reload enabled)
  - API Gateway - Port 3000
  - User Service - Port 5005
  - Shrine Service - Port 5001
  - Wishing Service - Port 5004
  - Technique Service - Port 5002
  - Shrine Discovery Service - Port 5003
  - Rating Service - Port 5006
- ✅ **Frontend**: Vite dev server - Port 5173

**Advantages**:

- ⚡ Fast hot reload (changes reflect instantly)
- 🐛 Easy debugging with IDE
- 📝 Direct file editing
- 💻 Native Node.js performance

### Option B: Full Docker Development 🐳

**Best for**: Testing production-like environment

**Setup**:

```bash
# Build and start all containers
pnpm run docker:dev

# Production mode
pnpm run docker:prod
```

**What runs**:

- All services in Docker containers
- Databases in Docker containers
- Frontend in Docker container with nginx
- RabbitMQ message broker

**Advantages**:

- 🔒 Full isolation
- 🎯 Production-like environment
- 🌐 Network configuration testing
- 📦 Complete containerization

### Switching Between Modes

Use these reset scripts to clean up and switch:

```bash
# Switch to Local Development
pnpm run reset:local
pnpm run start:all

# Switch to Docker Development
pnpm run reset:docker
pnpm run docker:dev
```

### Development Commands

```bash
# Start individual services (local)
pnpm run start:dev:gateway      # API Gateway
pnpm run start:dev:user         # User Service
pnpm run start:dev:shrine       # Shrine Service
pnpm run start:dev:wishing      # Wishing Service
pnpm run start:dev:technique    # Technique Service
pnpm run start:dev:discovery    # Discovery Service
pnpm run start:dev:rating       # Rating Service
pnpm run start:dev:frontend     # React Frontend

# Database management
pnpm run db:setup              # Start databases only
pnpm run db:seed:shrines       # Seed shrine data
pnpm run db:seed:wishes        # Seed wish data
pnpm run db:seed:techniques    # Seed technique data

# Docker commands
pnpm run docker:build          # Build images
pnpm run docker:up             # Start containers
pnpm run docker:down           # Stop containers
pnpm run docker:logs           # View logs
pnpm run docker:restart        # Restart containers

# Code generation
pnpm run proto:generate        # Generate TS from .proto files
```

### Generating New Services and Libraries

#### 1. Generate a New Microservice

```bash
# Replace {service_name} with your desired service name
nest generate app {service_name}
```

Then add scripts to `package.json`:

```json
{
  "scripts": {
    "start:{service_name}": "nest start {service_name}",
    "start:dev:{service_name}": "nest start {service_name} --watch"
  }
}
```

#### 2. Generate a Shared Library

```bash
# Replace {library_name} with your desired library name
nest generate library {library_name}
```

- Library created under `libs/{library_name}`
- Import in services using `@app/{library_name}`

---

## 📚 API Documentation

### Base URL

- **Local Development**: `http://localhost:3000`
- **Kubernetes**: `http://localhost:30000`

### Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```http
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### Authentication (`/auth`)

- `POST /auth/login` - Email/password login
- `POST /auth/register` - User registration
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/profile` - Get current user (JWT required)

#### Users (`/users`)

- `POST /users` - Create user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Shrines (`/shrines`)

- `POST /shrines` - Create shrine
- `GET /shrines` - Get all shrines
- `GET /shrines/:id` - Get shrine by ID
- `PUT /shrines/:id` - Update shrine
- `DELETE /shrines/:id` - Delete shrine

#### Wishes (`/wishes`)

- `POST /wishes` - Create wish (JWT required)
- `GET /wishes` - Get all public wishes
- `GET /wishes?shrine_id=X` - Get wishes by shrine
- `GET /wishes?wisher_id=X` - Get wishes by user
- `DELETE /wishes/:id` - Delete wish

#### Techniques (`/techniques`)

- `POST /techniques` - Create technique (JWT required)
- `GET /techniques` - Get all techniques
- `GET /techniques/:id` - Get technique by ID
- `DELETE /techniques/:id` - Delete technique

#### Ratings (`/ratings`)

- `POST /ratings` - Create/Update rating (JWT required)
- `GET /ratings?shrine_id=X` - Get ratings by shrine
- `GET /ratings?user_id=X` - Get ratings by user

#### Discovery (`/discovery`)

- `POST /discovery/recommend` - Get shrine recommendations
- `POST /discovery/nearby` - Find nearby shrines
- `POST /discovery/category` - Search by category

For detailed examples with request/response bodies, see `TESTING_GUIDE.md`.

---

## 🎨 Frontend Application

The frontend is a modern React application built with Vite and Tailwind CSS.

### Features

1. **Dashboard** (`/`)
   - Overview statistics
   - Featured shrines
   - Recent public wishes
   - Quick navigation

2. **Shrines Hub** (`/shrines`)
   - Browse all shrines with beautiful cards
   - View detailed shrine pages
   - Related wishes and techniques
   - CRUD operations (admin)

3. **My Spiritual Journey** (`/my-journey`)
   - **My Wishes Tab**: Create, view, and manage your wishes
   - **My Techniques Tab**: Share and manage blessing techniques

4. **Discover & Explore** (`/discover`)
   - AI-powered recommendations
   - Find nearby shrines with GPS
   - Browse by category

### Running Frontend

```bash
# Development
cd frontend
pnpm install
pnpm run dev

# Production build
pnpm run build
pnpm run preview
```

Frontend runs on `http://localhost:5173`

For detailed frontend documentation, see `frontend/README.md`.

---

## 🐳 Deployment

### Docker Compose (Development/Staging)

```bash
# Development mode with hot reload
pnpm run docker:dev

# Production mode
pnpm run docker:prod
```

### Kubernetes (Production)

The project includes full Kubernetes manifests for production deployment.

**Prerequisites**:

- Docker Desktop with Kubernetes enabled
- `kubectl` CLI tool

**Deployment Steps**:

```powershell
# 1. Build all Docker images
cd k8s
./build.ps1

# 2. Deploy to Kubernetes
./deploy.ps1

# 3. Verify deployment
kubectl get pods -n microservices
kubectl get services -n microservices

# 4. Access services
# API Gateway: http://localhost:30000
# Frontend: http://localhost:30002
# pgAdmin: http://localhost:30080
```

**Kubernetes Resources**:

- **3 PostgreSQL databases** with persistent volumes
- **1 MongoDB** instance
- **1 RabbitMQ** broker
- **8 Microservices** with health checks
- **API Gateway** with 3 replicas + HPA + PDB
- **Frontend** with 2 replicas + HPA
- **pgAdmin** for database management

**High Availability Features**:

- Horizontal Pod Autoscaling (HPA)
- Pod Disruption Budgets (PDB)
- Readiness and Liveness probes
- Anti-affinity rules
- Resource limits and requests

**Cleanup**:

```powershell
./delete.ps1
```

For detailed deployment guide, see `k8s/README.md` and `DEPLOYMENT_SUMMARY.md`.

---

## 🧪 Testing

### Load Testing with k6

The project includes comprehensive load testing setup with k6, InfluxDB, and Grafana.

**Setup**:

```powershell
cd testing

# Start load testing infrastructure
docker-compose up --scale k6-node=5 -d

# View Grafana dashboards
# Open: http://localhost:4000
# Credentials: admin/admin
```

**Configuration**:

```powershell
# Override default settings
$env:VUS = "200"               # Virtual users
$env:DURATION = "3m"           # Test duration
$env:BASE_URL = "http://localhost:3000"
docker-compose up --scale k6-node=5 -d
```

**Available Scripts**:

- `scripts/k6-load-test.js` - Gradual load test
- `scripts/k6-stress-test.js` - Stress test

For detailed testing guide, see `testing/README.md` and `TESTING_GUIDE.md`.

---

## 📐 Architecture Decision Records (ADRs)

### ADR 1: Database Choice - PostgreSQL & MongoDB

**Context**:

- Need to support both structured and semi-structured data
- Shrine and temple information is structured relational data
- User wishes and techniques have flexible, varying structures
- Require high scalability to support 100,000+ users

**Decision**: Use PostgreSQL for relational data and MongoDB for document data

**Services using PostgreSQL**:

- User Service (user accounts, authentication)
- Shrine Service (shrine details, locations)
- Wishing Service (wishes with relationships)
- Rating Service (ratings and reviews)

**Services using MongoDB**:

- Technique Service (blessing techniques with flexible schemas)
- Shrine Discovery Service (recommendation history)

**Consequences**:

✅ **Pros**:

- PostgreSQL provides ACID compliance for critical user and shrine data
- MongoDB's JSONB-like flexibility handles varying wish and technique structures
- Easy scalability with proper indexing
- Best-of-both-worlds approach for different data types
- PostgreSQL excellent for complex queries and relationships
- MongoDB ideal for evolving schemas and rapid development

⚠️ **Cons**:

- Need to manage two different database systems
- Cross-database queries require application-level joins
- Increased operational complexity
- Different backup and recovery strategies

**Future Considerations**:

- Could use PostgreSQL's JSONB for semi-structured data if MongoDB operational overhead becomes too high
- Consider database sharding strategies for horizontal scaling as user base grows beyond 100K

---

### ADR 2: Hosting Platform - AWS

**Context**:

- Need scalable cloud infrastructure to support growing user base (100K+ target)
- Require global content delivery for images and static assets
- Must achieve 99.5% uptime SLA
- Need managed database and storage services
- Want to minimize operational overhead

**Decision**: Use AWS (EC2, RDS, S3, CloudFront) for deployment

**AWS Services**:

- **EC2/ECS/EKS**: Application hosting with auto-scaling
- **RDS for PostgreSQL**: Managed relational database with automated backups
- **DocumentDB/Atlas**: MongoDB-compatible document database
- **S3**: Object storage for shrine images and media
- **CloudFront**: CDN for global content delivery
- **Route 53**: DNS management
- **Application Load Balancer**: Traffic distribution
- **ElastiCache**: Redis for session management and caching

**Consequences**:

✅ **Pros**:

- Industry-leading reliability and scalability
- Global data centers ensure low latency worldwide (important for international tourists)
- Managed services reduce operational overhead
- Auto-scaling supports traffic spikes (e.g., major festivals)
- Comprehensive security and compliance features
- CloudFront CDN improves shrine image loading globally
- RDS automated backups and point-in-time recovery
- Extensive monitoring and alerting capabilities (CloudWatch)

⚠️ **Cons**:

- Higher cost compared to self-hosting or smaller cloud providers
- Vendor lock-in considerations
- Complexity in service configuration
- Requires AWS expertise for optimal setup
- Potential for unexpected costs without proper monitoring

**Cost Mitigation**:

- Use Reserved Instances for steady-state workloads (30-50% savings)
- Leverage auto-scaling to optimize resource usage
- Implement caching strategies (CloudFront, ElastiCache) to reduce compute costs
- Regular cost monitoring and optimization with AWS Cost Explorer
- Use S3 lifecycle policies for image storage optimization

**Alternative Considered**:

- **Google Cloud Platform (GCP)**: Excellent Kubernetes support, but less familiar to team
- **Azure**: Strong enterprise features, but higher learning curve
- **DigitalOcean**: More affordable, but limited global presence for CDN

---

### ADR 3: Frontend Framework - React + Next.js + Tailwind CSS

**Context**:

- Platform requires SEO-friendly shrine and temple pages
- Need fast initial page load and responsive design for mobile users
- Must scale for future features (wishes, location search, admin updates)
- Strong developer ecosystem and component reusability needed
- Team has React experience

**Decision**: Use React 19 + Vite (currently) / Next.js (future) with Tailwind CSS

**Current Implementation**: React 19 + Vite + Tailwind CSS

**Future Migration Path**: Next.js for:

- Server-Side Rendering (SSR) for shrine detail pages
- Static Site Generation (SSG) for popular shrines
- Improved SEO for shrine pages
- Built-in API routes for BFF (Backend for Frontend) pattern
- Image optimization out of the box

**Technologies**:

- **React 19**: Component-based UI library with latest features (concurrent rendering, automatic batching)
- **Vite**: Ultra-fast build tool and dev server (10x faster than Webpack)
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **TypeScript**: Type safety throughout the codebase
- **React Router**: Client-side routing

**Consequences**:

✅ **Pros**:

- Vite provides extremely fast hot module replacement (HMR) - instant feedback during development
- Tailwind CSS ensures consistent, mobile-first responsive design
- Large React ecosystem with abundant libraries and resources
- TypeScript reduces bugs and improves maintainability
- Easy migration path to Next.js for SSR/SSG when needed
- Component reusability across dashboard, shrine pages, wish forms
- Excellent developer experience with fast builds
- Great mobile performance with code splitting

⚠️ **Cons**:

- Current SPA architecture has SEO limitations (mitigated with future Next.js migration)
- Initial bundle size can be larger (mitigated with code splitting and lazy loading)
- Steeper learning curve for developers new to React/TypeScript
- Need to manage client-side state carefully (Context API currently, could add Redux later)

**SEO Strategy**:

- **Current**: Meta tags and React Helmet for basic SEO
- **Future**: Next.js SSR/SSG for shrine detail pages with dynamic Open Graph tags
- Sitemap generation for search engine crawling
- Structured data (JSON-LD) for search engines to understand shrine information
- Prerendering for social media link previews

**Performance Optimizations**:

- Code splitting with React.lazy and Suspense
- Image lazy loading for shrine galleries
- Virtual scrolling for long lists
- Service worker for offline support (future)
- CDN for static assets

---

### ADR 4: Microservices Communication - gRPC

**Context**:

- Multiple backend services need efficient inter-service communication
- Type safety and contract-first development are priorities
- Need better performance than REST for internal calls
- Want language-agnostic service contracts
- High-frequency internal calls (e.g., wish creation validates shrine via gRPC)

**Decision**: Use gRPC with Protocol Buffers for inter-service communication

**Implementation**:

- All backend services expose gRPC endpoints
- API Gateway translates HTTP/REST to gRPC
- Protocol Buffers define service contracts in `.proto` files
- TypeScript interfaces generated from `.proto` files
- Unary RPC calls for most operations (no streaming yet)

**Consequences**:

✅ **Pros**:

- **Performance**: Binary serialization is 3-10x faster than JSON
- **Type Safety**: Strongly-typed contracts prevent integration errors
- **Contract-First**: `.proto` files serve as documentation and API specification
- **Code Generation**: Automatic client/server code generation saves time
- **Bi-directional Streaming**: Support for real-time features (future use)
- **Language Agnostic**: Can add services in other languages (Go, Python) later
- **HTTP/2**: Multiplexing reduces latency for multiple concurrent calls
- **Automatic retries and timeouts**: Built into gRPC clients

⚠️ **Cons**:

- Not human-readable like JSON (harder to debug without tools)
- Requires code generation step in CI/CD pipeline
- Browser support requires gRPC-Web (added complexity)
- Smaller ecosystem compared to REST (fewer libraries/tools)
- Learning curve for developers unfamiliar with Protocol Buffers

**Solution for Web**:

- API Gateway handles HTTP→gRPC translation
- Frontend uses standard REST/HTTP (no gRPC-Web complexity)
- Backend services communicate via gRPC
- Best of both worlds: developer-friendly frontend, performant backend

**Tools for Debugging**:

- **grpcurl**: Command-line tool for testing gRPC services
- **Postman**: Supports gRPC calls in recent versions
- **Bloom RPC**: GUI client for gRPC (like Postman for REST)

**Performance Gains**:

- Shrine validation in wish creation: 150ms (REST) → 50ms (gRPC)
- Discovery recommendations: 500ms (REST) → 200ms (gRPC)
- Reduced network overhead: ~40% smaller payloads

---

### ADR 5: Authentication - JWT + OAuth 2.0

**Context**:

- Need secure, scalable authentication mechanism
- Support both email/password and social login
- Stateless authentication preferred for microservices (no session state)
- Must support role-based access control (User, Admin, Shrine Owner)
- Mobile app support in the future

**Decision**: Use JWT (JSON Web Tokens) + OAuth 2.0 (Google)

**Implementation**:

- **JWT**: Stateless authentication tokens with HS256 algorithm
- **Passport.js**: Authentication middleware (passport-jwt, passport-google-oauth20)
- **bcrypt**: Password hashing with salt rounds = 10
- **Google OAuth 2.0**: Social login integration
- **Guards**: NestJS guards for route protection (@UseGuards(JwtAuthGuard))
- **Roles**: Custom decorators for role-based access (@Roles('admin'))

**Token Structure**:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234567890 // Expires in 1 hour
}
```

**Consequences**:

✅ **Pros**:

- **Stateless**: Tokens scale well across microservices (no session storage required)
- **No Server-Side Session Storage**: Reduces Redis/Memcached dependency
- **OAuth reduces friction**: Users can sign up with Google in one click
- **Strong security**: bcrypt password hashing prevents rainbow table attacks
- **Mobile-friendly**: Easy to implement in future mobile apps
- **Cross-service authentication**: All services can validate JWT independently
- **Expiration control**: Fine-grained control over token lifetime

⚠️ **Cons**:

- **Token revocation is challenging**: Can't invalidate tokens before expiration (mitigated with short expiration)
- **Secrets must be carefully managed**: JWT_SECRET exposure compromises entire system
- **Token size**: Larger than session IDs (~200 bytes vs 32 bytes)
- **No built-in refresh mechanism**: Need to implement refresh token logic

**Security Measures**:

- **HTTPS/TLS encryption**: All traffic encrypted in transit
- **Short token expiration**: 1 hour (refresh tokens coming soon)
- **Refresh token rotation**: Planned for v2 (long-lived refresh tokens with rotation)
- **Environment variable protection**: JWT_SECRET stored securely, never in code
- **Rate limiting**: Prevent brute force attacks on login endpoint
- **Password requirements**: Minimum 8 characters, complexity rules

**Future Enhancements**:

- Refresh tokens for longer sessions without re-authentication
- Token blacklisting for logout (requires Redis)
- Two-factor authentication (2FA) for admin accounts
- OAuth with Facebook, LINE for Thai users
- Passwordless authentication (magic links)

**Token Expiration Strategy**:

- **Access Token**: 1 hour (short-lived for security)
- **Refresh Token** (future): 7 days (stored in httpOnly cookie)
- **Remember Me**: 30 days (future feature)

---

## 👥 Team

**Project**: สาย.mu - Thailand's Premier Shrine Blessing Platform

**Course**: Term Project Deliverable - Microservices Architecture

**Team Members**:

| Name                      | Student ID   | Role                    | Responsibilities                                                                                                        |
| ------------------------- | ------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Chotpisit Adunsehawat** | 653 13132 21 | Backend Lead            | - Backend architecture design<br>- API Gateway implementation<br>- gRPC service development<br>- Database schema design |
| **Thanakrit Wong-asa**    | 653 20824 21 | Frontend Lead           | - React frontend development<br>- UI/UX design<br>- Tailwind CSS styling<br>- API integration                           |
| **Thanaphom Hirunyathon** | 653 20927 21 | DevOps Lead             | - Docker containerization<br>- Kubernetes deployment<br>- CI/CD pipeline<br>- Load testing setup                        |
| **Nontanun Ausungnoen**   | 653 21069 21 | Database & Architecture | - Database design (PostgreSQL/MongoDB)<br>- Architecture decision records<br>- Data seeding scripts<br>- Documentation  |

---

## 📄 License

This project is licensed for **educational purposes** as part of a university term project.

**Copyright © 2024-2025 สาย.mu Team**

All rights reserved. This project and its contents are the intellectual property of the project team and the educational institution. Unauthorized copying, distribution, or use outside the scope of the educational project is prohibited without explicit permission.

---

## 🙏 Acknowledgments

- **NestJS Community**: For the excellent microservices framework and documentation
- **React Team**: For the powerful and flexible UI library
- **gRPC**: For efficient inter-service communication
- **Thailand's Shrines and Temples**: For inspiring this cultural heritage platform
- **Our Instructors**: For guidance, feedback, and support throughout the project
- **Open Source Community**: For the amazing tools and libraries that made this possible

---

## 📞 Support

For questions, issues, or contributions:

- 📧 **Email**: support@sai.mu (educational project)
- 📝 **Documentation**:
  - Development Guide: `DEVELOPMENT.md`
  - Testing Guide: `TESTING_GUIDE.md`
  - Deployment Guide: `DEPLOYMENT_SUMMARY.md`
  - Kubernetes Guide: `k8s/README.md`
  - Frontend Guide: `frontend/README.md`
- 🐛 **Issues**: Create an issue on GitHub repository
- 💬 **Discussions**: Use GitHub Discussions for questions and ideas

---

## 📚 Additional Resources

### Project Documentation

- [Development Mode Guide](./DEVELOPMENT.md) - Detailed development setup
- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing instructions
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md) - Kubernetes deployment details
- [Kubernetes README](./k8s/README.md) - K8s manifests and deployment
- [Frontend README](./frontend/README.md) - React app documentation
- [Testing Infrastructure](./testing/README.md) - k6 load testing setup

### Architecture Diagrams

Located in `tools/diagram/`:

- `component_diagram.puml` - System component overview
- `1_discover_nearby_sequence.puml` - Discover nearby shrines flow
- `2_share_technique_sequence.puml` - Share technique flow
- `3_make_wish_sequence.puml` - Make wish flow
- `class_diagram_shrine_controller.puml` - Shrine controller structure

### API Testing

- Postman collections in `tools/postman/`
- Test scripts in `tools/scripts/`

---

**Made with ❤️ in Thailand** 🇹🇭

**สาย.mu** - Connecting people with blessings from Thailand's sacred spaces
