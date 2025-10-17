import { PagopaPayment, PagopaResponse } from '../types';

// Pagopa Sandbox API Configuration
const PAGOPA_SANDBOX_URL = 'https://api-sandbox.pagopa.it';
const PAGOPA_API_KEY = process.env.EXPO_PUBLIC_PAGOPA_API_KEY || 'sandbox-key';

// Mock implementation for development
// In production, replace with real Pagopa API calls

export const creaPagamento = async (
  importo: number,
  categoria: string,
  utenteId: string,
  descrizione?: string
): Promise<PagopaResponse> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock payment data
    const paymentId = `pagopa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const linkPagamento = `${PAGOPA_SANDBOX_URL}/pay/${paymentId}`;
    
    // Calculate expiration date (7 days from now)
    const dataScadenza = new Date();
    dataScadenza.setDate(dataScadenza.getDate() + 7);

    const mockPayment: PagopaPayment = {
      id: paymentId,
      importo,
      categoria,
      descrizione: descrizione || `Pagamento ${categoria}`,
      stato: 'in_attesa',
      link_pagamento: linkPagamento,
      data_scadenza: dataScadenza.toISOString(),
      utente_id: utenteId,
      created_at: new Date().toISOString(),
    };

    // In production, make actual API call:
    /*
    const response = await fetch(`${PAGOPA_SANDBOX_URL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAGOPA_API_KEY}`,
      },
      body: JSON.stringify({
        amount: importo,
        category: categoria,
        description: descrizione,
        user_id: utenteId,
        return_url: 'https://yourapp.com/payment-success',
        cancel_url: 'https://yourapp.com/payment-cancel',
      }),
    });

    if (!response.ok) {
      throw new Error(`Pagopa API error: ${response.status}`);
    }

    const data = await response.json();
    */

    return {
      success: true,
      data: mockPayment,
    };
  } catch (error) {
    console.error('Error creating Pagopa payment:', error);
    return {
      success: false,
      error: error.message || 'Errore durante la creazione del pagamento',
    };
  }
};

export const verificaStatoPagamento = async (paymentId: string): Promise<PagopaResponse> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock payment status check
    // In production, make actual API call:
    /*
    const response = await fetch(`${PAGOPA_SANDBOX_URL}/api/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAGOPA_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Pagopa API error: ${response.status}`);
    }

    const data = await response.json();
    */

    // Mock different payment states for testing
    const states = ['in_attesa', 'completato', 'fallito', 'annullato'];
    const randomState = states[Math.floor(Math.random() * states.length)];

    const mockPayment: PagopaPayment = {
      id: paymentId,
      importo: 0, // Will be filled from database
      categoria: '',
      descrizione: '',
      stato: randomState as any,
      link_pagamento: `${PAGOPA_SANDBOX_URL}/pay/${paymentId}`,
      data_scadenza: new Date().toISOString(),
      utente_id: '',
      created_at: new Date().toISOString(),
    };

    return {
      success: true,
      data: mockPayment,
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      success: false,
      error: error.message || 'Errore durante la verifica del pagamento',
    };
  }
};

export const annullaPagamento = async (paymentId: string): Promise<PagopaResponse> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock payment cancellation
    // In production, make actual API call:
    /*
    const response = await fetch(`${PAGOPA_SANDBOX_URL}/api/v1/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAGOPA_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Pagopa API error: ${response.status}`);
    }
    */

    return {
      success: true,
      data: {
        id: paymentId,
        importo: 0,
        categoria: '',
        descrizione: '',
        stato: 'annullato',
        link_pagamento: '',
        data_scadenza: new Date().toISOString(),
        utente_id: '',
        created_at: new Date().toISOString(),
      } as PagopaPayment,
    };
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return {
      success: false,
      error: error.message || 'Errore durante l\'annullamento del pagamento',
    };
  }
};

export const ottieniMetodiPagamento = async (): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    nome: string;
    descrizione: string;
    icona: string;
    disponibile: boolean;
  }>;
  error?: string;
}> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock payment methods
    const metodiPagamento = [
      {
        id: 'carta_credito',
        nome: 'Carta di Credito',
        descrizione: 'Visa, Mastercard, American Express',
        icona: '💳',
        disponibile: true,
      },
      {
        id: 'carta_debito',
        nome: 'Carta di Debito',
        descrizione: 'Bancomat, Maestro',
        icona: '🏦',
        disponibile: true,
      },
      {
        id: 'bonifico',
        nome: 'Bonifico Bancario',
        descrizione: 'Bonifico SEPA',
        icona: '🏛️',
        disponibile: true,
      },
      {
        id: 'paypal',
        nome: 'PayPal',
        descrizione: 'Pagamento sicuro con PayPal',
        icona: '🔵',
        disponibile: false, // Not available in sandbox
      },
      {
        id: 'apple_pay',
        nome: 'Apple Pay',
        descrizione: 'Pagamento con Apple Pay',
        icona: '🍎',
        disponibile: false, // Not available in sandbox
      },
      {
        id: 'google_pay',
        nome: 'Google Pay',
        descrizione: 'Pagamento con Google Pay',
        icona: '🤖',
        disponibile: false, // Not available in sandbox
      },
    ];

    return {
      success: true,
      data: metodiPagamento,
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return {
      success: false,
      error: error.message || 'Errore durante il recupero dei metodi di pagamento',
    };
  }
};

export const simulaPagamentoCompletato = async (paymentId: string): Promise<PagopaResponse> => {
  try {
    // This function simulates a completed payment for testing purposes
    // In production, this would be called by Pagopa webhook when payment is actually completed
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockPayment: PagopaPayment = {
      id: paymentId,
      importo: 0, // Will be filled from database
      categoria: '',
      descrizione: '',
      stato: 'completato',
      link_pagamento: `${PAGOPA_SANDBOX_URL}/pay/${paymentId}`,
      data_scadenza: new Date().toISOString(),
      utente_id: '',
      created_at: new Date().toISOString(),
    };

    return {
      success: true,
      data: mockPayment,
    };
  } catch (error) {
    console.error('Error simulating completed payment:', error);
    return {
      success: false,
      error: error.message || 'Errore durante la simulazione del pagamento',
    };
  }
};

// Utility function to format currency
export const formattaValuta = (importo: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(importo);
};

// Utility function to format date
export const formattaData = (data: string): string => {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(data));
};

// Utility function to get payment status color
export const getStatoColore = (stato: string): string => {
  switch (stato) {
    case 'completato':
      return '#4CAF50'; // Green
    case 'in_attesa':
      return '#FF9800'; // Orange
    case 'fallito':
      return '#F44336'; // Red
    case 'annullato':
      return '#9E9E9E'; // Gray
    default:
      return '#2196F3'; // Blue
  }
};

// Utility function to get payment status text
export const getStatoTesto = (stato: string): string => {
  switch (stato) {
    case 'completato':
      return 'Completato';
    case 'in_attesa':
      return 'In Attesa';
    case 'fallito':
      return 'Fallito';
    case 'annullato':
      return 'Annullato';
    default:
      return 'Sconosciuto';
  }
};
