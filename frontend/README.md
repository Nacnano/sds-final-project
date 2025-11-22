# สาย.mu Frontend

A clean and professional React + TypeScript frontend for Thailand's Premier Shrine Blessing Platform.

## 🎨 Tech Stack

- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP Client

## 📱 Features

### Authentication
- ✅ Login with email/password
- ✅ User registration
- ✅ JWT token management
- ✅ Protected routes
- ⚠️ **Note**: Auth endpoints are mocked - replace with actual backend when ready

### Pages

#### 1. **Dashboard** (`/`)
- Overview stats (shrines, wishes, blessings)
- Featured shrines with images from loremflickr
- Recent public wishes
- Quick navigation

#### 2. **Shrines Hub** (`/shrines`)
- Browse all shrines with beautiful cards
- View shrine details with:
  - Related wishes from users
  - Blessing techniques
  - Shrine images from `https://loremflickr.com/{width}/{height}/shrine`
- Create/Edit/Delete shrines (CRUD)
- Responsive grid layout

#### 3. **My Spiritual Journey** (`/my-journey`)
- **My Wishes Tab**:
  - View all your wishes
  - Create new wishes
  - Link wishes to shrines
  - Mark wishes as public/private
  - Delete wishes
- **My Techniques Tab**:
  - Share blessing techniques
  - Add ingredients/items needed
  - Link techniques to shrines
  - Delete techniques

#### 4. **Discover & Explore** (`/discover`)
- **Get Recommendations**:
  - AI-powered shrine recommendations
  - Based on wish text, category, and location
  - Match score calculation
  - Distance-aware suggestions
- **Find Nearby**:
  - Location-based shrine search
  - Adjustable search radius
  - Sort by distance/popularity/rating
- **Browse by Category**:
  - Filter shrines by category (love, career, wealth, health, education)
  - Optional location filters
  - Province-based search

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (already exists)
# VITE_API_URL=http://localhost:3000

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Running the Full Stack

**To run the complete application, you need both backend and frontend:**

1. **Start Backend Services** (from root directory):
```bash
# Option 1: Start all services manually
pnpm run start:all

# Option 2: Use Docker
pnpm run docker:dev
```

2. **Start Frontend** (from frontend directory):
```bash
cd frontend
npm run dev
```

3. **Access the application**:
   - Frontend: `http://localhost:5173`
   - API Gateway: `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🖼️ Shrine Images

Images are dynamically loaded from loremflickr:
- URL format: `https://loremflickr.com/{width}/{height}/shrine`
- Each shrine gets a consistent image based on its ID
- Images are cached by the browser

## 🎨 UI/UX Design

- **Clean & Professional**: Minimal design, no flashy animations
- **Responsive**: Works on mobile, tablet, and desktop
- **Color Scheme**: 
  - Primary: Orange tones (#ec5b20)
  - Background: Gray 50
  - Accent: Green for success, Red for warnings
- **Typography**: System fonts for fast loading
- **Components**: Reusable card, button, and input styles

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.tsx      # Navigation bar
│   └── ProtectedRoute.tsx  # Auth guard
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # Home/dashboard
│   ├── Shrines.tsx     # Shrines hub
│   ├── MyJourney.tsx   # User's wishes & techniques
│   └── Discover.tsx    # Discovery features
├── services/           # API services
│   ├── api.ts          # Axios instance
│   ├── authService.ts  # Auth API (mocked)
│   ├── shrineService.ts    # Shrine CRUD
│   ├── wishService.ts      # Wish CRUD
│   ├── techniqueService.ts # Technique CRUD
│   └── discoveryService.ts # Discovery APIs
├── types/              # TypeScript types
│   └── index.ts        # All type definitions
├── utils/              # Utility functions
│   └── imageUtils.ts   # Shrine image helpers
├── App.tsx             # Main app with routing
├── main.tsx            # Entry point
└── index.css           # Tailwind + custom styles
```

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
│   Port: 5173    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  API Gateway    │◄─── All requests go here first
│   Port: 3000    │
└────────┬────────┘
         │ gRPC
         ├──────────┐
         │          │
         ▼          ▼
┌──────────────┐  ┌──────────────┐
│Shrine Service│  │Wish Service  │
│  Port: 5001  │  │  Port: 5004  │
└──────────────┘  └──────────────┘
         │          │
         ▼          ▼
┌──────────────┐  ┌──────────────┐
│Technique Svc │  │Discovery Svc │
│  Port: 5002  │  │  Port: 5003  │
└──────────────┘  └──────────────┘
```

**Important**: The frontend only communicates with the API Gateway. The gateway handles all gRPC communication with individual microservices.

## 🔌 API Integration

All API calls are made through services in `src/services/`:
- **Base URL**: `http://localhost:3000` (API Gateway - configurable via .env)
- **Architecture**: Frontend → API Gateway → Microservices (gRPC)
  - API Gateway runs on port 3000 (REST)
  - Shrine Service on port 5001 (gRPC)
  - Technique Service on port 5002 (gRPC)
  - Shrine Discovery on port 5003 (gRPC)
  - Wishing Service on port 5004 (gRPC)
- JWT token automatically added to headers
- Error handling included

### API Endpoints Used

**Shrines** (via API Gateway → Shrine Service)
- `GET /shrines` - List all shrines
- `GET /shrines/:id` - Get shrine details
- `POST /shrines` - Create shrine
- `PATCH /shrines/:id` - Update shrine
- `DELETE /shrines/:id` - Delete shrine

**Wishes** (via API Gateway → Wishing Service)
- `GET /wishes?shrineId=&wisherId=` - List wishes
- `POST /wishes` - Create wish
- `PATCH /wishes/:id` - Update wish
- `DELETE /wishes/:id` - Delete wish

**Techniques** (via API Gateway → Technique Service)
- `GET /techniques` - List techniques
- `POST /techniques` - Create technique
- `PATCH /techniques/:id` - Update technique
- `DELETE /techniques/:id` - Delete technique

**Discovery** (via API Gateway → Shrine Discovery Service)
- `POST /shrine-discovery/recommend` - Get recommendations
- `GET /shrine-discovery/nearby` - Find nearby shrines
- `GET /shrine-discovery/search/category` - Search by category

**Auth** (Mocked - will be implemented in API Gateway)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

### Tailwind Configuration

Custom colors and utilities are defined in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Custom component classes

## 📝 TODO / Future Enhancements

- [ ] Implement actual auth backend integration
- [ ] Add user profile page
- [ ] Image upload for shrines
- [ ] Real-time wish updates with WebSocket
- [ ] Geolocation API integration
- [ ] Map view for nearby shrines
- [ ] Social sharing features
- [ ] Wish analytics dashboard
- [ ] Multi-language support (Thai/English)
- [ ] Dark mode

## 🐛 Known Issues

- Auth is currently mocked (placeholder implementation)
- Need to handle API errors more gracefully
- Some TypeScript warnings for unused imports (non-breaking)

## 📄 License

Private - Part of สาย.mu microservices platform

