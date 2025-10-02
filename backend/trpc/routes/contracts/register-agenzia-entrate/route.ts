import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

const registerContractSchema = z.object({
  contractId: z.string(),
  fiscalCode: z.string(),
  propertyAddress: z.string(),
  monthlyRent: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  tenantFiscalCode: z.string(),
});

const registerContractWithAgenziaEntrateProcedure = publicProcedure
  .input(registerContractSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('Contract registration request received:', {
        contractId: input.contractId,
        userId: ctx.userId,
        fiscalCode: input.fiscalCode
      });

      // Simulazione API Agenzia delle Entrate
      // In produzione, utilizzare le API ufficiali dell'Agenzia delle Entrate
      const registrationData = {
        contractId: input.contractId,
        registrationNumber: `REG-${Date.now()}`,
        fiscalCode: input.fiscalCode,
        propertyAddress: input.propertyAddress,
        monthlyRent: input.monthlyRent,
        startDate: input.startDate,
        endDate: input.endDate,
        tenantFiscalCode: input.tenantFiscalCode,
        registrationFee: calculateRegistrationFee(input.monthlyRent),
        submittedAt: new Date().toISOString(),
        userId: ctx.userId,
      };

      console.log('Calling Agenzia delle Entrate API simulation...');
      // Simulazione chiamata API esterna
      const response = await simulateAgenziaEntrateAPI(registrationData);
      console.log('API response:', response);
      
      if (response.success) {
        // Salva lo stato della registrazione nel database
        // In un'app reale, salvare in un database
        const result = {
          success: true,
          registrationNumber: response.registrationNumber,
          status: 'submitted',
          message: 'Contratto inviato con successo all\'Agenzia delle Entrate',
          estimatedProcessingTime: '5-7 giorni lavorativi',
          registrationFee: registrationData.registrationFee,
        };
        console.log('Registration successful:', result);
        return result;
      } else {
        console.error('API returned error:', response.error);
        throw new Error(response.error || 'Errore durante la registrazione');
      }
    } catch (error) {
      console.error('Errore registrazione Agenzia delle Entrate:', error);
      throw new Error(`Errore durante la registrazione del contratto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  });

export { registerContractWithAgenziaEntrateProcedure };

// Funzione per calcolare la tassa di registrazione
function calculateRegistrationFee(monthlyRent: number): number {
  // Calcolo semplificato: 2% del canone annuo, minimo €67
  const annualRent = monthlyRent * 12;
  const fee = Math.max(annualRent * 0.02, 67);
  return Math.round(fee * 100) / 100;
}

// Simulazione API Agenzia delle Entrate
async function simulateAgenziaEntrateAPI(data: any) {
  // Simula un delay di rete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simula successo nel 90% dei casi
  if (Math.random() > 0.1) {
    return {
      success: true,
      registrationNumber: `AE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'submitted',
      trackingId: `TRACK-${Date.now()}`,
    };
  } else {
    return {
      success: false,
      error: 'Dati fiscali non validi o servizio temporaneamente non disponibile',
    };
  }
}