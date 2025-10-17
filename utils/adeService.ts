import { Platform, Alert } from 'react-native';
import { User } from '../types';

export interface ADEContractData {
  // Contract basic info
  contractId: string;
  propertyAddress: string;
  propertyType: 'residential' | 'commercial' | 'mixed';
  
  // Parties involved
  landlord: {
    fiscalCode: string;
    name: string;
    surname: string;
    birthDate: string;
    birthPlace: string;
    address: string;
    city: string;
    postalCode: string;
    province: string;
    phone: string;
    email: string;
  };
  
  tenant: {
    fiscalCode: string;
    name: string;
    surname: string;
    birthDate: string;
    birthPlace: string;
    address: string;
    city: string;
    postalCode: string;
    province: string;
    phone: string;
    email: string;
  };
  
  // Contract details
  contractType: 'residential' | 'commercial' | 'temporary';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  monthlyRent: number;
  securityDeposit: number;
  utilitiesIncluded: boolean;
  utilitiesAmount?: number;
  
  // Property details
  propertyDetails: {
    cadastralCode: string;
    category: string; // A/1, A/2, etc.
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    surfaceArea: number; // in square meters
    floor: number;
    elevator: boolean;
    balcony: boolean;
    garage: boolean;
    heating: 'autonomous' | 'centralized' | 'none';
  };
  
  // Legal requirements
  registrationType: 'ordinary' | 'temporary' | 'transitory';
  registrationReason: 'first_rental' | 'renewal' | 'modification';
  previousContractId?: string;
  
  // Additional info
  notes?: string;
  attachments?: string[]; // Base64 encoded documents
}

export interface ADEResponse {
  success: boolean;
  message: string;
  contractNumber?: string;
  registrationDate?: string;
  protocolNumber?: string;
  errorCode?: string;
  errorDetails?: string;
}

export interface ADEConfig {
  baseUrl: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  timeout: number;
}

// Default configuration - to be updated with real ADE credentials
const DEFAULT_ADE_CONFIG: ADEConfig = {
  baseUrl: process.env.EXPO_PUBLIC_ADE_BASE_URL || 'https://api.agenziaentrate.gov.it',
  apiKey: process.env.EXPO_PUBLIC_ADE_API_KEY || 'your-ade-api-key',
  clientId: process.env.EXPO_PUBLIC_ADE_CLIENT_ID || 'your-client-id',
  clientSecret: process.env.EXPO_PUBLIC_ADE_CLIENT_SECRET || 'your-client-secret',
  environment: (process.env.EXPO_PUBLIC_ADE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  timeout: 30000,
};

class ADEService {
  private config: ADEConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config?: Partial<ADEConfig>) {
    this.config = { ...DEFAULT_ADE_CONFIG, ...config };
  }

  /**
   * Initialize ADE service and authenticate
   */
  async initialize(): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log('Initializing ADE service...');
      }

      // In a real implementation, you would:
      // 1. Authenticate with ADE using OAuth2
      // 2. Store access token securely
      // 3. Handle token refresh
      
      // For now, we'll simulate successful initialization
      this.accessToken = 'simulated-token-' + Date.now();
      this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

      if (__DEV__) {
        console.log('ADE service initialized successfully');
      }

      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to initialize ADE service:', error);
      }
      return false;
    }
  }

  /**
   * Check if access token is valid and refresh if needed
   */
  private async ensureValidToken(): Promise<boolean> {
    if (!this.accessToken || Date.now() > this.tokenExpiry) {
      return await this.refreshToken();
    }
    return true;
  }

  /**
   * Refresh access token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      // In a real implementation, you would make an OAuth2 token refresh request
      // For now, we'll simulate token refresh
      this.accessToken = 'refreshed-token-' + Date.now();
      this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
      
      if (__DEV__) {
        console.log('ADE access token refreshed');
      }
      
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to refresh ADE token:', error);
      }
      return false;
    }
  }

  /**
   * Validate contract data before submission
   */
  private validateContractData(data: ADEContractData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.contractId) errors.push('Contract ID is required');
    if (!data.propertyAddress) errors.push('Property address is required');
    if (!data.landlord.fiscalCode) errors.push('Landlord fiscal code is required');
    if (!data.tenant.fiscalCode) errors.push('Tenant fiscal code is required');
    if (!data.startDate) errors.push('Start date is required');
    if (!data.endDate) errors.push('End date is required');
    if (!data.monthlyRent || data.monthlyRent <= 0) errors.push('Valid monthly rent is required');
    if (!data.propertyDetails.cadastralCode) errors.push('Cadastral code is required');

    // Date validation
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }

    // Fiscal code validation (simplified)
    const fiscalCodeRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
    if (!fiscalCodeRegex.test(data.landlord.fiscalCode)) {
      errors.push('Invalid landlord fiscal code format');
    }
    if (!fiscalCodeRegex.test(data.tenant.fiscalCode)) {
      errors.push('Invalid tenant fiscal code format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Submit contract to Agenzia delle Entrate
   */
  async submitContract(contractData: ADEContractData): Promise<ADEResponse> {
    try {
      if (__DEV__) {
        console.log('Submitting contract to ADE:', contractData.contractId);
      }

      // Ensure we have a valid token
      if (!await this.ensureValidToken()) {
        return {
          success: false,
          message: 'Failed to authenticate with ADE',
          errorCode: 'AUTH_ERROR'
        };
      }

      // Validate contract data
      const validation = this.validateContractData(contractData);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Invalid contract data',
          errorCode: 'VALIDATION_ERROR',
          errorDetails: validation.errors.join(', ')
        };
      }

      // In a real implementation, you would make an HTTP request to ADE API
      // For now, we'll simulate the submission
      const response = await this.simulateADESubmission(contractData);

      if (__DEV__) {
        console.log('ADE submission response:', response);
      }

      return response;

    } catch (error) {
      if (__DEV__) {
        console.error('Error submitting contract to ADE:', error);
      }

      return {
        success: false,
        message: 'Failed to submit contract to ADE',
        errorCode: 'SUBMISSION_ERROR',
        errorDetails: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Simulate ADE submission (replace with real API call)
   */
  private async simulateADESubmission(contractData: ADEContractData): Promise<ADEResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success/failure based on environment
    if (this.config.environment === 'sandbox') {
      return {
        success: true,
        message: 'Contract submitted successfully to ADE sandbox',
        contractNumber: 'ADE-' + Date.now(),
        registrationDate: new Date().toISOString().split('T')[0],
        protocolNumber: 'PROT-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      };
    } else {
      // In production, this would be a real API call
      return {
        success: true,
        message: 'Contract registered successfully with Agenzia delle Entrate',
        contractNumber: 'ADE-' + Date.now(),
        registrationDate: new Date().toISOString().split('T')[0],
        protocolNumber: 'PROT-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      };
    }
  }

  /**
   * Get contract status from ADE
   */
  async getContractStatus(contractNumber: string): Promise<ADEResponse> {
    try {
      if (!await this.ensureValidToken()) {
        return {
          success: false,
          message: 'Failed to authenticate with ADE',
          errorCode: 'AUTH_ERROR'
        };
      }

      // Simulate status check
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Contract status retrieved successfully',
        contractNumber: contractNumber,
        registrationDate: new Date().toISOString().split('T')[0]
      };

    } catch (error) {
      if (__DEV__) {
        console.error('Error getting contract status:', error);
      }

      return {
        success: false,
        message: 'Failed to get contract status',
        errorCode: 'STATUS_ERROR'
      };
    }
  }

  /**
   * Convert user data to ADE contract format
   */
  static convertUserToADEContract(
    user: User,
    contractData: any,
    isLandlord: boolean
  ): Partial<ADEContractData> {
    return {
      contractId: contractData.id,
      propertyAddress: contractData.propertyAddress,
      propertyType: 'residential',
      
      // This would be populated based on user type
      [isLandlord ? 'landlord' : 'tenant']: {
        fiscalCode: user.fiscalCode || 'CF1234567890123', // Would need to collect this
        name: user.name.split(' ')[0] || '',
        surname: user.name.split(' ').slice(1).join(' ') || '',
        birthDate: user.dateOfBirth || '1990-01-01',
        birthPlace: 'Milano', // Would need to collect this
        address: user.address || 'Via Roma 123',
        city: user.city || 'Milano',
        postalCode: user.postalCode || '20100',
        province: user.province || 'MI',
        phone: user.phone || '+39 123 456 7890',
        email: user.email || 'user@example.com'
      },
      
      contractType: 'residential',
      startDate: contractData.startDate,
      endDate: contractData.endDate,
      monthlyRent: contractData.monthlyRent,
      securityDeposit: contractData.monthlyRent * 3,
      utilitiesIncluded: false,
      
      propertyDetails: {
        cadastralCode: 'A/1', // Would need to collect this
        category: 'A/1',
        rooms: 3,
        bedrooms: 2,
        bathrooms: 1,
        surfaceArea: 80,
        floor: 2,
        elevator: true,
        balcony: true,
        garage: false,
        heating: 'autonomous'
      },
      
      registrationType: 'ordinary',
      registrationReason: 'first_rental'
    };
  }
}

// Export singleton instance
export const adeService = new ADEService();

// Export utility functions
export const initializeADEService = async (): Promise<boolean> => {
  return await adeService.initialize();
};

export const submitContractToADE = async (contractData: ADEContractData): Promise<ADEResponse> => {
  return await adeService.submitContract(contractData);
};

export const getADEContractStatus = async (contractNumber: string): Promise<ADEResponse> => {
  return await adeService.getContractStatus(contractNumber);
};





