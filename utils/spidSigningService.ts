import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

export enum SPIDProvider {
  Aruba = 'ArubaPEC',
  Infocert = 'Infocert',
  Intesa = 'IntesaID',
  Lepida = 'Lepida',
  Namirial = 'NamirialID',
  Poste = 'PosteID',
  Sielte = 'SielteID',
  SpidItalia = 'SpidItalia',
  TIM = 'TIMid',
}

export interface SPIDSigningResult {
  success: boolean;
  error?: string;
  signature?: {
    signatureId: string;
    signatureHash: string;
    timestamp: string;
    provider: SPIDProvider;
    certificate: string;
    signedData: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    fiscalCode: string;
    provider: SPIDProvider;
  };
}

export interface ContractSigningData {
  contractId: string;
  contractHash: string;
  contractContent: string;
  signerType: 'homeowner' | 'tenant';
  signerFiscalCode: string;
  timestamp: string;
}

// Configuration for SPID signing
const SPID_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_SPID_BASE_URL || 'https://spid.tenant.app',
  NAMIRIAL_ENDPOINT: process.env.EXPO_PUBLIC_NAMIRIAL_ENDPOINT || 'https://api.namirial.it/spid',
  CLIENT_ID: process.env.EXPO_PUBLIC_SPID_CLIENT_ID || 'tenant-app-client',
  REDIRECT_URI: process.env.EXPO_PUBLIC_SPID_REDIRECT_URI || 'tenant://spid-callback',
  SIGNING_SCOPE: 'spid_signature',
};

// Store for session management
let currentSigningSession: {
  contractId: string;
  provider: SPIDProvider;
  state: string;
  nonce: string;
} | null = null;

/**
 * Initialize SPID signing service
 */
export const initializeSPIDSigning = async (): Promise<void> => {
  if (__DEV__) {
    console.log('Initializing SPID signing service...');
  }
  
  // Clear any existing sessions
  await SecureStore.deleteItemAsync('spid_signing_session');
  currentSigningSession = null;
  
  if (__DEV__) {
    console.log('SPID signing service initialized');
  }
};

/**
 * Generate cryptographic nonce for security
 */
const generateNonce = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
};

/**
 * Generate state parameter for OAuth2 security
 */
const generateState = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
};

/**
 * Generate contract hash for integrity verification
 */
export const generateContractHash = (contractContent: string): string => {
  return CryptoJS.SHA256(contractContent).toString(CryptoJS.enc.Hex);
};

/**
 * Verify contract integrity using hash
 */
export const verifyContractIntegrity = (contractContent: string, expectedHash: string): boolean => {
  const actualHash = generateContractHash(contractContent);
  return actualHash === expectedHash;
};

/**
 * Start SPID signing process for a contract
 */
export const startSPIDSigning = async (
  contractData: ContractSigningData,
  provider: SPIDProvider
): Promise<SPIDSigningResult> => {
  if (__DEV__) {
    console.log(`Starting SPID signing with ${provider} for contract ${contractData.contractId}`);
  }

  try {
    // Generate security parameters
    const state = generateState();
    const nonce = generateNonce();
    
    // Store signing session
    currentSigningSession = {
      contractId: contractData.contractId,
      provider,
      state,
      nonce,
    };
    
    // Save session securely
    await SecureStore.setItemAsync('spid_signing_session', JSON.stringify(currentSigningSession));
    
    // Prepare signing request
    const signingRequest = {
      client_id: SPID_CONFIG.CLIENT_ID,
      redirect_uri: SPID_CONFIG.REDIRECT_URI,
      scope: SPID_CONFIG.SIGNING_SCOPE,
      response_type: 'code',
      state,
      nonce,
      contract_id: contractData.contractId,
      contract_hash: contractData.contractHash,
      signer_fiscal_code: contractData.signerFiscalCode,
      signer_type: contractData.signerType,
      timestamp: contractData.timestamp,
    };
    
    // Build authorization URL
    const authUrl = `${SPID_CONFIG.BASE_URL}/auth/${provider.toLowerCase()}?${new URLSearchParams(signingRequest).toString()}`;
    
    if (__DEV__) {
      console.log('Opening SPID signing URL:', authUrl);
    }
    
    // Open SPID provider authentication
    let result;
    if (Platform.OS === 'web') {
      // For web, open in new window
      const popup = window.open(authUrl, 'spid-signing', 'width=600,height=700,scrollbars=yes,resizable=yes');
      
      // Wait for popup to close or return result
      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Simulate success for web
            resolve({
              success: true,
              signature: {
                signatureId: `spid_${Date.now()}`,
                signatureHash: generateContractHash(contractData.contractContent),
                timestamp: new Date().toISOString(),
                provider,
                certificate: 'mock-certificate',
                signedData: contractData.contractContent,
              },
              user: {
                id: `spid-${provider}-user-${Date.now()}`,
                name: 'Mario Rossi',
                email: 'mario.rossi@example.com',
                fiscalCode: contractData.signerFiscalCode,
                provider,
              },
            });
          }
        }, 1000);
      });
    } else {
      // For mobile, use WebBrowser
      result = await WebBrowser.openAuthSessionAsync(authUrl, SPID_CONFIG.REDIRECT_URI);
    }
    
    if (result.type === 'success' && result.url) {
      return await handleSPIDCallback(result.url);
    } else if (result.type === 'cancel') {
      return {
        success: false,
        error: 'Firma SPID annullata dall\'utente',
      };
    } else {
      return {
        success: false,
        error: 'Errore durante l\'autenticazione SPID',
      };
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error during SPID signing:', error);
    }
    return {
      success: false,
      error: `Errore durante la firma SPID: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Handle SPID callback and process signature
 */
const handleSPIDCallback = async (callbackUrl: string): Promise<SPIDSigningResult> => {
  if (__DEV__) {
    console.log('Handling SPID callback:', callbackUrl);
  }
  
  try {
    // Parse callback URL
    const url = new URL(callbackUrl);
    const params = new URLSearchParams(url.search);
    
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    // Check for errors
    if (error) {
      return {
        success: false,
        error: errorDescription || `Errore SPID: ${error}`,
      };
    }
    
    if (!code || !state) {
      return {
        success: false,
        error: 'Parametri di callback SPID mancanti',
      };
    }
    
    // Verify state parameter
    if (currentSigningSession?.state !== state) {
      return {
        success: false,
        error: 'Stato di sicurezza non valido',
      };
    }
    
    // Exchange code for signature
    const signatureResult = await exchangeCodeForSignature(code, state);
    
    if (signatureResult.success) {
      // Clear session
      await SecureStore.deleteItemAsync('spid_signing_session');
      currentSigningSession = null;
    }
    
    return signatureResult;
  } catch (error) {
    if (__DEV__) {
      console.error('Error handling SPID callback:', error);
    }
    return {
      success: false,
      error: `Errore durante il callback SPID: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Exchange authorization code for signature
 */
const exchangeCodeForSignature = async (code: string, state: string): Promise<SPIDSigningResult> => {
  if (__DEV__) {
    console.log('Exchanging code for signature...');
  }
  
  try {
    // In a real implementation, this would call your backend
    // which would then call the SPID provider's token endpoint
    const tokenRequest = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPID_CONFIG.REDIRECT_URI,
      client_id: SPID_CONFIG.CLIENT_ID,
      client_secret: process.env.EXPO_PUBLIC_SPID_CLIENT_SECRET || 'mock-secret',
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful signature
    const mockSignature = {
      signatureId: `spid_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      signatureHash: CryptoJS.SHA256(`contract_${currentSigningSession?.contractId}_${Date.now()}`).toString(),
      timestamp: new Date().toISOString(),
      provider: currentSigningSession?.provider || SPIDProvider.Namirial,
      certificate: `spid_cert_${Date.now()}`,
      signedData: `signed_contract_${currentSigningSession?.contractId}`,
    };
    
    return {
      success: true,
      signature: mockSignature,
      user: {
        id: `spid-${currentSigningSession?.provider}-user-${Date.now()}`,
        name: 'Mario Rossi',
        email: 'mario.rossi@example.com',
        fiscalCode: 'RSSMRA80A01H501Z',
        provider: currentSigningSession?.provider || SPIDProvider.Namirial,
      },
    };
  } catch (error) {
    if (__DEV__) {
      console.error('Error exchanging code for signature:', error);
    }
    return {
      success: false,
      error: `Errore durante l\'ottenimento della firma: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Verify SPID signature
 */
export const verifySPIDSignature = async (signature: {
  signatureId: string;
  signatureHash: string;
  timestamp: string;
  provider: SPIDProvider;
  certificate: string;
  signedData: string;
}): Promise<boolean> => {
  if (__DEV__) {
    console.log('Verifying SPID signature:', signature.signatureId);
  }
  
  try {
    // In a real implementation, this would verify the signature
    // with the SPID provider's verification service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate verification success
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Error verifying SPID signature:', error);
    }
    return false;
  }
};

/**
 * Get current signing session
 */
export const getCurrentSigningSession = async () => {
  try {
    const sessionData = await SecureStore.getItemAsync('spid_signing_session');
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting signing session:', error);
    }
    return null;
  }
};

/**
 * Clear signing session
 */
export const clearSigningSession = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('spid_signing_session');
    currentSigningSession = null;
    if (__DEV__) {
      console.log('Signing session cleared');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error clearing signing session:', error);
    }
  }
};
