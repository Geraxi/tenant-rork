import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

const virtualTourSchema = z.object({
  propertyId: z.string(),
  tourUrl: z.string().url(),
  tourType: z.enum(['matterport', 'kuula', 'custom_360']),
  title: z.string().min(1),
  description: z.string().optional(),
});

export const addVirtualTourProcedure = protectedProcedure
  .input(virtualTourSchema)
  .mutation(async ({ input }) => {
    try {
      // Validazione URL del tour virtuale
      const isValidTour = await validateVirtualTourUrl(input.tourUrl, input.tourType);
      
      if (!isValidTour) {
        throw new Error('URL del tour virtuale non valido');
      }

      // Salva il tour virtuale nel database
      const virtualTour = {
        id: `tour_${Date.now()}`,
        propertyId: input.propertyId,
        tourUrl: input.tourUrl,
        tourType: input.tourType,
        title: input.title,
        description: input.description,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        tour: virtualTour,
        message: 'Tour virtuale aggiunto con successo',
      };
    } catch (error) {
      console.error('Errore aggiunta tour virtuale:', error);
      throw new Error('Errore durante l\'aggiunta del tour virtuale');
    }
  });

export const getVirtualToursProcedure = protectedProcedure
  .input(z.object({ propertyId: z.string() }))
  .query(async ({ input }) => {
    try {
      // Simula recupero tours dal database
      const tours = await getVirtualToursFromDB(input.propertyId);
      
      return {
        tours,
        count: tours.length,
      };
    } catch (error) {
      console.error('Errore recupero tours:', error);
      throw new Error('Errore durante il recupero dei tour virtuali');
    }
  });

// Funzione per validare URL del tour virtuale
async function validateVirtualTourUrl(url: string, tourType: string): Promise<boolean> {
  try {
    // Validazione specifica per tipo di tour
    switch (tourType) {
      case 'matterport':
        return url.includes('matterport.com') || url.includes('my.matterport.com');
      case 'kuula':
        return url.includes('kuula.co');
      case 'custom_360':
        // Validazione generica per URL personalizzati
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      default:
        return false;
    }
  } catch (error) {
    console.error('Errore validazione URL:', error);
    return false;
  }
}

// Simulazione recupero tours dal database
async function getVirtualToursFromDB(propertyId: string) {
  // Simula delay database
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Dati di esempio
  return [
    {
      id: 'tour_1',
      propertyId,
      tourUrl: 'https://my.matterport.com/show/?m=example123',
      tourType: 'matterport',
      title: 'Tour Completo Appartamento',
      description: 'Tour 360° di tutte le stanze',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
}