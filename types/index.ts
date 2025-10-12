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
  phone?: string;
  userType: UserType;
  age: number;
  dateOfBirth: string; // Format: YYYY-MM-DD
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
  lookingForRoommate?: boolean;
  idDocument?: string;
  selfiePhoto?: string;
  createdAt: number;
}

export interface UserPreferences {
  // For Tenants
  budget?: number;
  minBudget?: number;
  maxBudget?: number;
  moveInDate?: string;
  leaseDuration?: string;
  petFriendly?: boolean;
  smoking?: boolean;
  hasChildren?: boolean;
  numberOfOccupants?: number;
  employmentStatus?: EmploymentStatus;
  jobType?: JobType;
  bedrooms?: number;
  bathrooms?: number;
  minSquareMeters?: number;
  maxSquareMeters?: number;
  balconyOrTerrace?: boolean;
  speseCondominiali?: number;
  
  // For Homeowners - Tenant Requirements
  requiresEmployed?: boolean;
  acceptedJobTypes?: JobType[];
  acceptedEmploymentStatuses?: EmploymentStatus[];
  minimumIncome?: number;
  petsAllowed?: boolean;
  childrenAllowed?: boolean;
  smokingAllowed?: boolean;
  ageRange?: { min: number; max: number };
  gender?: string;
  maxOccupants?: number;
  minLeaseDuration?: string;
  
  // Property details (moved to Property interface, kept for backward compatibility)
  propertyType?: string;
  rent?: number;
  squareMeters?: number;
  amenities?: string[];
  nearAirport?: boolean;
  preferredTenantTypes?: string[];
  
  // For Roommates
  roommatePreferences?: string[];
  lifestyle?: string[];
  cleanliness?: string;
  workSchedule?: string;
  
  // Common
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
  squareMeters: number;
  speseCondominiali?: number;
  amenities: string[];
  location: string;
  address: string;
  nearAirport: boolean;
  balconyOrTerrace: boolean;
  furnished: boolean;
  available: boolean;
  createdAt: number;
}

export interface Match {
  id: string;
  user: User;
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
  propertyId?: string;
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

export interface OnboardingData {
  userType: UserType;
  name: string;
  email: string;
  phone: string;
  age: number;
  bio: string;
  location: string;
  photos: string[];
  idDocument?: string;
  selfiePhoto?: string;
  preferences: UserPreferences;
  employmentStatus?: EmploymentStatus;
  jobType?: JobType;
  lookingForRoommate?: boolean;
  properties?: Property[];
}
