export type UserType = 'tenant' | 'homeowner' | 'roommate';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface User {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  age: number;
  bio: string;
  photos: string[];
  location: string;
  verified: VerificationStatus;
  idVerified: boolean;
  backgroundCheckPassed: boolean;
  preferences: UserPreferences;
  createdAt: number;
}

export interface UserPreferences {
  // For Tenants
  budget?: number;
  moveInDate?: string;
  leaseDuration?: string;
  petFriendly?: boolean;
  smoking?: boolean;
  
  // For Homeowners
  propertyType?: string;
  rent?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  nearAirport?: boolean;
  preferredTenantTypes?: string[]; // e.g., 'cabin crew', 'pilots', 'students', 'professionals'
  
  // For Roommates
  roommatePreferences?: string[];
  lifestyle?: string[];
  
  // Common
  ageRange?: { min: number; max: number };
  gender?: string;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  photos: string[];
  rent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  amenities: string[];
  location: string;
  nearAirport: boolean;
  available: boolean;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  matchedAt: number;
  chatId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}