export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR' | 'GUIDE';
  subscriptionTier: 'FREE' | 'BASIC' | 'PRO' | 'ELITE';
  location?: string;
  latitude?: number;
  longitude?: number;
  environmentScore: number;
}

export interface Catch {
  id: string;
  userId: string;
  user?: User;
  speciesId?: string;
  species?: Species;
  customSpecies?: string;
  weight?: number;
  length?: number;
  photos: string[];
  videos: string[];
  latitude: number;
  longitude: number;
  locationName: string;
  waterBody?: string;
  waterDepth?: number;
  waterTemp?: number;
  technique?: string;
  bait?: string;
  lure?: string;
  weather?: any;
  moonPhase?: string;
  timestamp: Date;
  visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  description?: string;
  isReleased: boolean;
}

export interface Species {
  id: string;
  name: string;
  scientificName?: string;
  description?: string;
  habitat?: string;
  averageWeight?: number;
  averageLength?: number;
  techniques: string[];
  baits: string[];
  photos: string[];
}

export interface Post {
  id: string;
  userId: string;
  user?: User;
  content: string;
  media: string[];
  type: 'post' | 'recipe' | 'tutorial' | 'tip';
  latitude?: number;
  longitude?: number;
  createdAt: Date;
}

export interface Club {
  id: string;
  name: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  avatar?: string;
  coverPhoto?: string;
  isPublic: boolean;
  memberCount?: number;
}

export interface Event {
  id: string;
  clubId?: string;
  title: string;
  description?: string;
  eventType: 'tournament' | 'meetup' | 'cleanup' | 'educational';
  startDate: Date;
  endDate?: Date;
  location: string;
  latitude?: number;
  longitude?: number;
  maxParticipants?: number;
}

export interface Tournament {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  rules?: any;
  prizes?: any;
  entryFee: number;
  location?: string;
}

export interface MarketplaceItem {
  id: string;
  userId: string;
  user?: User;
  title: string;
  description: string;
  category: 'rod' | 'reel' | 'lure' | 'bait' | 'boat' | 'other';
  condition: 'new' | 'like-new' | 'good' | 'fair';
  price: number;
  isRental: boolean;
  rentalPrice?: number;
  rentalPeriod?: string;
  photos: string[];
  location?: string;
  isSold: boolean;
}

export interface Guide {
  id: string;
  name: string;
  description?: string;
  specialty: string[];
  experience: number;
  location: string;
  hourlyRate: number;
  photos: string[];
  rating: number;
}

export interface Weather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  clouds: number;
  description: string;
  icon: string;
}
