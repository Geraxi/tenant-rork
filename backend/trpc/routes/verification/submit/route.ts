import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

const submitVerificationSchema = z.object({
  idDocumentType: z.enum(['passport', 'drivers_license', 'national_id']),
  idDocumentImage: z.string(), // base64 encoded image
  selfieImage: z.string(), // base64 encoded image
});

export const submitVerificationProcedure = protectedProcedure
  .input(submitVerificationSchema)
  .mutation(async ({ input, ctx }) => {
    const { idDocumentType, idDocumentImage, selfieImage } = input;
    const userId = ctx.userId;
    const user = ctx.db.users.get(userId);
    
    if (!user) {
      console.error('User not found for ID:', userId);
      throw new Error('User not found');
    }

    console.log('Submitting verification for user:', userId);
    console.log('Document type:', idDocumentType);
    console.log('ID document image length:', idDocumentImage?.length || 0);
    console.log('Selfie image length:', selfieImage?.length || 0);

    // Validate input data
    if (!idDocumentImage || !selfieImage) {
      console.error('Missing required images');
      throw new Error('Both document and selfie images are required');
    }

    if (idDocumentImage.length < 100 || selfieImage.length < 100) {
      console.error('Images appear to be too small or corrupted');
      throw new Error('Invalid image data provided');
    }

    try {
      // In a real app, you would:
      // 1. Upload images to secure storage
      // 2. Call Onfido API or similar verification service
      // 3. Store verification request in database
      
      // For demo purposes, we'll simulate the API call
      const verificationResult = await simulateVerificationAPI({
        idDocumentImage,
        selfieImage,
        documentType: idDocumentType,
      });

      // Update user verification status
      const updatedUser = {
        ...user,
        verification_status: verificationResult.status as 'pending' | 'approved' | 'rejected',
        verification_submitted_at: new Date().toISOString(),
        verified: verificationResult.status === 'approved',
      };
      
      // Save updated user to database
      ctx.db.users.set(userId, updatedUser);

      console.log('Verification result:', verificationResult);
      console.log('Updated user verification status:', updatedUser.verification_status);

      return {
        success: true,
        status: verificationResult.status,
        message: verificationResult.message,
        verificationId: verificationResult.id,
      };
    } catch (error) {
      console.error('Verification submission error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('Verification service timeout. Please try again.');
        }
        if (error.message.includes('network')) {
          throw new Error('Network error. Please check your connection.');
        }
      }
      
      throw new Error('Failed to submit verification. Please try again.');
    }
  });

// Simulate advanced verification API (replace with real Onfido/Jumio integration)
async function simulateVerificationAPI(data: {
  idDocumentImage: string;
  selfieImage: string;
  documentType: string;
}) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  // Simulate advanced verification checks
  const verificationChecks = {
    documentAuthenticity: Math.random() > 0.1, // 90% pass rate
    facialMatch: Math.random() > 0.15, // 85% pass rate
    livenessDetection: Math.random() > 0.05, // 95% pass rate
    documentQuality: Math.random() > 0.2, // 80% pass rate
  };
  
  const allChecksPassed = Object.values(verificationChecks).every(check => check);
  const mostChecksPassed = Object.values(verificationChecks).filter(check => check).length >= 3;
  
  let result;
  if (allChecksPassed) {
    result = {
      status: 'approved',
      message: 'Verifica completata con successo! La tua identità è stata confermata.',
      confidence: 0.95,
      checks: verificationChecks,
    };
  } else if (mostChecksPassed) {
    result = {
      status: 'pending',
      message: 'Verifica in corso. Alcuni controlli richiedono revisione manuale.',
      confidence: 0.75,
      checks: verificationChecks,
    };
  } else {
    result = {
      status: 'rejected',
      message: 'Verifica fallita. Assicurati che i documenti siano chiari e riprova.',
      confidence: 0.3,
      checks: verificationChecks,
      rejectionReasons: getFailureReasons(verificationChecks),
    };
  }
  
  return {
    id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    ...result,
  };
}

function getFailureReasons(checks: Record<string, boolean>): string[] {
  const reasons: string[] = [];
  
  if (!checks.documentAuthenticity) {
    reasons.push('Documento non autentico o danneggiato');
  }
  if (!checks.facialMatch) {
    reasons.push('Il volto nel selfie non corrisponde al documento');
  }
  if (!checks.livenessDetection) {
    reasons.push('Test di vitalità fallito - assicurati di essere una persona reale');
  }
  if (!checks.documentQuality) {
    reasons.push('Qualità del documento insufficiente - foto troppo sfocata o scura');
  }
  
  return reasons;
}