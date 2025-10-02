import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

const backgroundCheckSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string(),
  socialSecurityNumber: z.string().optional(),
  address: z.string().min(1),
  consentGiven: z.boolean(),
});

export const requestBackgroundCheckProcedure = protectedProcedure
  .input(backgroundCheckSchema)
  .mutation(async ({ input }) => {
    if (!input.consentGiven) {
      throw new Error('Consenso richiesto per il background check');
    }

    try {
      // Simulazione integrazione con Checkr/Onfido
      const checkrResponse = await simulateCheckrAPI({
        candidate: {
          first_name: input.firstName,
          last_name: input.lastName,
          dob: input.dateOfBirth,
          ssn: input.socialSecurityNumber,
          address: input.address,
        },
        package: 'tenant_screening',
      });

      return {
        success: true,
        checkId: checkrResponse.id,
        status: checkrResponse.status,
        estimatedCompletionTime: '24-48 ore',
        message: 'Background check avviato con successo',
      };
    } catch (error) {
      console.error('Errore background check:', error);
      throw new Error('Errore durante l\'avvio del background check');
    }
  });

export const getBackgroundCheckStatusProcedure = protectedProcedure
  .input(z.object({ checkId: z.string() }))
  .query(async ({ input }) => {
    try {
      const status = await simulateCheckrStatusAPI(input.checkId);
      
      return {
        checkId: input.checkId,
        status: status.status,
        results: status.results,
        completedAt: status.completed_at,
      };
    } catch (error) {
      console.error('Errore recupero status:', error);
      throw new Error('Errore durante il recupero dello status');
    }
  });

// Simulazione API Checkr
async function simulateCheckrAPI(data: any) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    id: `chk_${Date.now()}`,
    status: 'pending',
    candidate_id: `cand_${Date.now()}`,
    package: data.package,
    created_at: new Date().toISOString(),
  };
}

async function simulateCheckrStatusAPI(checkId: string) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simula diversi stati possibili
  const statuses = ['pending', 'in_progress', 'complete'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  if (randomStatus === 'complete') {
    return {
      status: 'complete',
      results: {
        criminal_history: {
          status: 'clear',
          records_found: 0,
        },
        credit_check: {
          status: 'good',
          score: Math.floor(Math.random() * 200) + 650,
        },
        employment_verification: {
          status: 'verified',
          current_employer: 'Tech Company SRL',
        },
        rental_history: {
          status: 'positive',
          previous_landlord_rating: 4.5,
        },
      },
      completed_at: new Date().toISOString(),
    };
  }
  
  return {
    status: randomStatus,
    results: null,
    completed_at: null,
  };
}