# SPID Authentication Setup

This document explains how to set up SPID (Sistema Pubblico di Identità Digitale) authentication for the Tenant app, specifically for publishing rental contracts to the Agenzia delle Entrate (Italian Revenue Agency).

## What is SPID?

SPID is Italy's national digital identity system that allows citizens to access public administration services online securely. It's required for many government services, including publishing rental contracts to the Agenzia delle Entrate.

## Implementation Overview

The SPID authentication has been implemented with the following components:

### 1. SPID Authentication Service (`utils/spidAuth.ts`)
- Handles SPID provider selection and authentication flow
- Manages OAuth2/SAML integration (simulated for development)
- Provides fallback for Expo Go compatibility

### 2. SPID Authentication Screen (`screens/SPIDAuthScreen.tsx`)
- User interface for selecting SPID providers
- Displays official SPID providers (Aruba, Infocert, Poste Italiane, etc.)
- Handles authentication flow and user feedback

### 3. Contract Integration (`screens/ContractsScreen.tsx`)
- Added "Pubblica con SPID" button for signed contracts
- Integrates SPID authentication for ADE publishing
- Updates contract status after successful publication

## SPID Providers Supported

The app includes support for all major Italian SPID providers:

- **Aruba** - aruba.it
- **Infocert** - infocert.it  
- **Poste Italiane** - poste.it
- **Sielte** - sielte.it
- **TIM** - tim.it
- **Lepida** - lepida.it
- **Namirial** - namirial.it
- **Register.it** - register.it

## Environment Variables Required

Add these to your `.env` file:

```env
# SPID Configuration
EXPO_PUBLIC_SPID_CLIENT_ID=your-spid-client-id
EXPO_PUBLIC_SPID_REDIRECT_URI=tenant://spid-callback
EXPO_PUBLIC_SPID_BASE_URL=https://your-backend.com/spid
```

## Production Setup

### 1. Register with SPID Providers

To use SPID in production, you need to:

1. **Register your app** with each SPID provider you want to support
2. **Obtain client credentials** (client ID, client secret)
3. **Configure redirect URIs** for your app
4. **Set up OAuth2/SAML endpoints** on your backend

### 2. Backend Integration

The current implementation simulates SPID authentication. For production, you need:

1. **OAuth2/SAML server** to handle SPID authentication
2. **Database** to store user SPID credentials
3. **API endpoints** to:
   - Initiate SPID authentication
   - Handle SPID callbacks
   - Exchange authorization codes for tokens
   - Fetch user information from SPID providers

### 3. Agenzia delle Entrate Integration

For publishing contracts to ADE, you need:

1. **ADE API credentials** and integration
2. **Contract data formatting** according to ADE requirements
3. **SPID token validation** before publishing
4. **Error handling** for failed publications

## Development vs Production

### Development (Current Implementation)
- Simulates SPID authentication flow
- Uses mock user data
- Works in Expo Go
- Shows UI flow without real authentication

### Production Requirements
- Real OAuth2/SAML integration
- Backend server for handling authentication
- Development build (not Expo Go)
- Real SPID provider credentials

## Usage Flow

1. **User signs a rental contract**
2. **Contract status becomes "signed"**
3. **"Pubblica con SPID" button appears**
4. **User clicks button → SPID authentication screen**
5. **User selects SPID provider**
6. **App redirects to provider's authentication page**
7. **User authenticates with SPID credentials**
8. **App receives authorization code**
9. **Backend exchanges code for user info**
10. **Contract is published to Agenzia delle Entrate**
11. **Contract status updates to "published_ade"**

## Security Considerations

- **Never store SPID credentials** in the app
- **Use secure backend** for token exchange
- **Validate all SPID responses** server-side
- **Implement proper error handling**
- **Use HTTPS** for all communications
- **Follow OAuth2 security best practices**

## Testing

For testing SPID integration:

1. **Use development builds** (not Expo Go)
2. **Test with real SPID credentials** (if available)
3. **Verify callback handling**
4. **Test error scenarios**
5. **Validate user data extraction**

## Legal Compliance

Ensure compliance with:

- **Italian data protection laws** (GDPR)
- **SPID technical specifications**
- **Agenzia delle Entrate requirements**
- **Privacy regulations** for handling personal data

## Support

For SPID-related issues:

1. **Check SPID provider documentation**
2. **Verify client credentials**
3. **Test network connectivity**
4. **Review error logs**
5. **Contact SPID provider support**

## Future Enhancements

Potential improvements:

1. **Biometric authentication** integration
2. **Offline contract storage** with sync
3. **Batch contract publishing**
4. **Contract status tracking**
5. **Automated renewal notifications**





