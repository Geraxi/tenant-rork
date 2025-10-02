export type UserMode = 'tenant' | 'landlord' | 'roommate';
export type SubscriptionPlan = 'free' | 'premium' | 'pro';
export type PropertyType = 'apartment' | 'house' | 'studio' | 'shared_room' | 'private_room';
export type MatchType = 'property_interest' | 'tenant_landlord' | 'roommate';
export type MatchStatus = 'active' | 'chatting' | 'cancelled';
export type PropertyStatus = 'available' | 'pending' | 'rented';

export interface User {
  id: string;
  full_name: string;
  email: string;
  profile_photos: string[];
  bio: string;
  age: number;
  profession: string;
  phone: string;
  current_mode: UserMode;
  account_modes: UserMode[];
  subscription_plan: SubscriptionPlan;
  matches_used_today: number;
  last_match_date: string;
  budget_min: number;
  budget_max: number;
  preferred_location: string;
  lifestyle_tags: string[];
  interests: string[];
  work_contract_url?: string;
  work_contract_shared: boolean;
  wants_roommate?: boolean;
  roommate_same_interests?: boolean;
  tenant_preferences?: TenantPreference[];
  profile_completed: boolean;
  photos_count: number;
  verified: boolean;
  verification_status?: 'not_started' | 'pending' | 'approved' | 'rejected';
  verification_submitted_at?: string | null;
  background_check_completed?: boolean;
  virtual_tour_setup?: boolean;
}

export interface TenantPreference {
  id: string;
  category: 'profession' | 'lifestyle' | 'age_range' | 'other';
  value: string;
  required: boolean;
}

export interface Property {
  id: string;
  created_by: string;
  title: string;
  description: string;
  rent: number;
  location: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  photos: string[];
  amenities: string[];
  rules: string[];
  status: PropertyStatus;
  available_date: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  property_id?: string;
  match_type: MatchType;
  compatibility_score: number;
  status: MatchStatus;
  created_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export type ContractStatus = 'draft' | 'pending_signatures' | 'finalized';
export type SignatureStatus = 'pending' | 'signed';

export interface ContractSignature {
  id: string;
  contract_id: string;
  user_id: string;
  signature_image: string;
  signed_at: string;
  status: SignatureStatus;
}

export interface RentalContract {
  id: string;
  property_id: string;
  owner_id: string;
  tenant_ids: string[];
  title: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit: number;
  clauses: string;
  notes?: string;
  template_url?: string;
  status: ContractStatus;
  signatures: ContractSignature[];
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractNotification {
  id: string;
  contract_id: string;
  user_id: string;
  type: 'contract_created' | 'signature_required' | 'contract_signed' | 'contract_finalized';
  message: string;
  read: boolean;
  created_at: string;
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationRequest {
  id: string;
  user_id: string;
  id_document_type: 'passport' | 'drivers_license' | 'national_id';
  status: VerificationStatus;
  submitted_at: string;
  processed_at?: string;
  rejection_reason?: string;
  confidence?: number;
  checks?: {
    documentAuthenticity: boolean;
    facialMatch: boolean;
    livenessDetection: boolean;
    documentQuality: boolean;
  };
}

// Background Check Types
export type BackgroundCheckStatus = 'pending' | 'in_progress' | 'complete' | 'failed';

export interface BackgroundCheck {
  id: string;
  user_id: string;
  status: BackgroundCheckStatus;
  results?: {
    criminal_history: {
      status: 'clear' | 'records_found';
      records_found: number;
    };
    credit_check: {
      status: 'excellent' | 'good' | 'fair' | 'poor';
      score: number;
    };
    employment_verification: {
      status: 'verified' | 'unverified';
      current_employer?: string;
    };
    rental_history: {
      status: 'positive' | 'negative' | 'no_history';
      previous_landlord_rating?: number;
    };
  };
  submitted_at: string;
  completed_at?: string;
  consent_given: boolean;
}

// Virtual Tour Types
export type VirtualTourType = 'matterport' | 'kuula' | 'custom_360';

export interface VirtualTour {
  id: string;
  property_id: string;
  tour_url: string;
  tour_type: VirtualTourType;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

// Contract Registration Types
export type ContractRegistrationStatus = 'submitted' | 'processing' | 'approved' | 'rejected';

export interface ContractRegistration {
  id: string;
  contract_id: string;
  registration_number: string;
  status: ContractRegistrationStatus;
  registration_fee: number;
  submitted_at: string;
  processed_at?: string;
  tracking_id?: string;
  rejection_reason?: string;
}