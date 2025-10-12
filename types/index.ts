export type UserType = 'tenant' | 'homeowner' | 'roommate';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export type EmploymentStatus = 'employed' | 'unemployed' | 'self-employed' | 'student' | 'retired';

export type JobType = 
  | 'professional' 
  | 'cabin-crew' 
  | 'pilot' 
  | 'student' 
  | 'healthcare' 
  | 'tech' 
  | 'finance'
  | 'education'
  | 'hospitality'
  | 'retail'
  | 'other';

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
  employmentStatus?: EmploymentStatus;
  jobType?: JobType;
  monthlyIncome?: number;
  createdAt: number;
}

export interface UserPreferences {
  // For Tenants
  budget?: number;
  moveInDate?: string;
  leaseDuration?: string;
  petFriendly?: boolean;
  smoking?: boolean;
  hasChildren?: boolean;
  numberOfOccupants?: number;
  employmentStatus?: EmploymentStatus;
  jobType?: JobType;
  
  // For Homeowners
  propertyType?: string;
  rent?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  nearAirport?: boolean;
  preferredTenantTypes?: string[];
  requiresEmployed?: boolean;
  acceptedJobTypes?: JobType[];
  minimumIncome?: number;
  petsAllowed?: boolean;
  childrenAllowed?: boolean;
  
  // For Roommates
  roommatePreferences?: string[];
  lifestyle?: string[];
  cleanliness?: string;
  workSchedule?: string;
  
  // Common
  ageRange?: { min: number; max: number };
  gender?: string;
  furnished?: boolean;
  parkingAvailable?: boolean;
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

export interface Contract {
  id: string;
  landlordId: string;
  tenantId: string;
  propertyAddress: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  terms: string;
  status: 'draft' | 'sent' | 'signed' | 'registered';
  registeredWithAgency?: boolean;
  registrationDate?: string;
  createdAt: number;
}