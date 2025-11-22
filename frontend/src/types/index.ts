// Auth types
export interface User {
  id: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name?: string; // Optional since backend doesn't require it
  email: string;
  password: string;
  role?: string; // Optional, defaults to 'user'
}

// Shrine types
export interface Shrine {
  id: string;
  name: string;
  description: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface CreateShrineRequest {
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
}

// Wish types
export interface Wish {
  id: string;
  wisherId: string;
  shrineId: string;
  wisherName: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWishRequest {
  wisherId: string;
  shrineId: string;
  wisherName?: string;
  description: string;
  public?: boolean;
}

// Technique types
export interface Technique {
  id: string;
  shrineId: string;
  userId: string;
  title: string;
  description: string;
  ingredients: string[];
}

export interface CreateTechniqueRequest {
  shrineId: string;
  title: string;
  description: string;
  ingredients: string[];
}

// Location types
export interface CoordinatesRequest {
  location: string;
}

export interface CoordinatesResponse {
  lat: number;
  lng: number;
}

export interface DistanceRequest {
  origin: string;
  destination: string;
}

export interface DistanceResponse {
  distanceText: string;
  distanceValue: number;
  durationText: string;
  durationValue: number;
}
