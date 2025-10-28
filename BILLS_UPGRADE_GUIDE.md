# Bills Section Upgrade - Complete Setup Guide

## 🎉 Implementation Complete!

Your React Native Expo app's Bills section has been successfully upgraded with:

- ✅ **Apple Pay** (native, via `@stripe/stripe-react-native`)
- ✅ **Fallback to saved card** (Stripe Payment Sheet)
- ✅ **On-device QR scanning** (Expo Camera)
- ✅ **Hybrid OCR** (upload to Supabase Edge Function running Tesseract)
- ✅ **Supabase** persistence (bills, transactions, payment methods)
- ✅ **Stripe webhooks** (in Supabase Edge Functions)
- ✅ **NO new screens** — components injected into existing Bills UI

## 📁 Files Created/Modified

### New Components
- `src/components/ScanBillButton.tsx` - QR scan / upload → create bill
- `src/components/PayBillButton.tsx` - Apple Pay + fallback to saved card

### Configuration Files
- `app.json` - Updated with Stripe and camera permissions
- `src/lib/supabase.ts` - Supabase client with bills/payments API
- `supabase-bills-schema.sql` - Database schema for bills and payments
- `env-config.example.ts` - Environment variables template

### Supabase Edge Functions
- `supabase/functions/parse-bill/index.ts` - QR → parse EPC/PagoPA; OCR fallback
- `supabase/functions/create-payment-sheet/index.ts` - Saved card fallback
- `supabase/functions/pay-bill/index.ts` - Apple Pay flow
- `supabase/functions/stripe-webhook/index.ts` - Payment status updates

### Modified Files
- `App.tsx` - Added StripeProvider wrapper
- `screens/LeMieBolletteScreen.tsx` - Integrated new components

## 🚀 Next Steps

### 1. Environment Setup

Create `.env.local` file with your actual values:

```bash
# Supabase Configuration
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR-ANON-KEY

# Expo Public Environment Variables (accessible in client)
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY

# Server-side Environment Variables (for Supabase Edge Functions)
STRIPE_SECRET=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### 2. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```sql
-- Copy contents from supabase-bills-schema.sql
-- This creates tables: users, bills, transactions, payment_methods
```

### 3. Supabase Edge Functions Deployment

Deploy the Edge Functions to Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy parse-bill
supabase functions deploy create-payment-sheet
supabase functions deploy pay-bill
supabase functions deploy stripe-webhook
```

### 4. Stripe Configuration

#### Apple Pay Setup
1. Create Apple Merchant ID in Apple Developer Console
2. Update `merchantIdentifier` in `app.json` to match your Merchant ID
3. Configure Apple Pay in Stripe Dashboard

#### Webhook Setup
1. In Stripe Dashboard, add webhook endpoint: `https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook`
2. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` environment variable

### 5. EAS Build (iOS)

Build for iOS with Apple Pay support:

```bash
# Prebuild to generate native code
npx expo prebuild --clean

# Build for iOS
eas build -p ios
```

## 🧪 Testing Checklist

### QR Scanning & OCR
- [ ] Tap "Scan / Upload Bill" button
- [ ] Grant camera permissions
- [ ] Scan QR code → creates bill
- [ ] Upload photo → OCR processing → creates bill

### Payment Flow
- [ ] Tap "Paga" button on unpaid bill
- [ ] Apple Pay sheet opens (iOS) → confirm payment
- [ ] Fallback to Payment Sheet → add card → pay
- [ ] Bill status updates to "paid"
- [ ] Transaction logged in Supabase

### Integration Points
- [ ] Bills list shows new scanned bills
- [ ] Payment buttons only show for tenants
- [ ] Landlords see existing "Gestisci" buttons
- [ ] No new screens created (as requested)

## 🔧 Troubleshooting

### Common Issues

1. **Camera Permission Denied**
   - Check `NSCameraUsageDescription` in `app.json`
   - Ensure permissions are granted in device settings

2. **Stripe Payment Fails**
   - Verify `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
   - Check Apple Merchant ID configuration
   - Ensure webhook endpoint is properly configured

3. **Supabase Functions Not Working**
   - Verify environment variables are set in Supabase Dashboard
   - Check function logs in Supabase Dashboard
   - Ensure functions are deployed successfully

4. **QR/OCR Parsing Issues**
   - Check `parse-bill` function logs
   - Verify Tesseract.js is working in Edge Function
   - Test with known QR codes first

## 📱 Usage

### For Tenants
1. **Scan Bills**: Tap "Scan / Upload Bill" → scan QR or upload photo
2. **Pay Bills**: Tap "Paga" button → Apple Pay or Payment Sheet
3. **View Status**: Bills show as "paid" after successful payment

### For Landlords
1. **View Bills**: See all tenant bills and payment status
2. **Send Reminders**: Tap "Invia Promemoria" for overdue bills
3. **Manage Bills**: Use existing "Gestisci" functionality

## 🎯 Key Features Implemented

- **Native Apple Pay**: Seamless payment experience on iOS
- **Payment Sheet Fallback**: Works on all devices with saved cards
- **QR Code Scanning**: Instant bill creation from QR codes
- **OCR Processing**: Upload photos for automatic bill parsing
- **Real-time Updates**: Webhook-driven status updates
- **Secure Storage**: All payment data stored securely in Supabase
- **No New Screens**: Components integrated into existing UI

## 🔒 Security Notes

- All sensitive data handled by Stripe
- Payment methods vaulted in Stripe (not stored locally)
- Webhook signatures verified for security
- Row Level Security (RLS) enabled on Supabase tables
- Environment variables properly configured

Your Bills section is now fully upgraded with modern payment processing capabilities! 🚀

