import { useState, useEffect } from 'react';
import { supabase } from '../../utils/src/supabaseClient';
import { Bolletta, Pagamento, Cashback, FiltroBollette, FiltroPagamenti } from '../types';

export const usePayments = (userId: string) => {
  const [bollette, setBollette] = useState<Bolletta[]>([]);
  const [pagamenti, setPagamenti] = useState<Pagamento[]>([]);
  const [cashback, setCashback] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockBollette: Bolletta[] = [
    {
      id: '1',
      lease_id: 'lease1',
      categoria: 'Affitto',
      importo: 1200,
      data_scadenza: '2024-02-01',
      stato: 'da_pagare',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      lease_id: 'lease1',
      categoria: 'Elettricità',
      importo: 85.50,
      data_scadenza: '2024-01-25',
      stato: 'pagato',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      lease_id: 'lease1',
      categoria: 'Gas',
      importo: 65.30,
      data_scadenza: '2024-01-30',
      stato: 'da_pagare',
      created_at: new Date().toISOString(),
    },
  ];

  const mockPagamenti: Pagamento[] = [
    {
      id: '1',
      bill_id: '2',
      user_id: userId,
      importo: 85.50,
      metodo: 'Pagopa',
      stato: 'successo',
      data: '2024-01-20T10:30:00Z',
      transaction_id: 'pagopa_123456',
    },
  ];

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, use mock data
      setBollette(mockBollette);
      setPagamenti(mockPagamenti);
      setCashback(17.10); // 2% of 1200 + 1% of 85.50

      // Try to load from database, but don't fail if tables don't exist
      try {
        const { data: billsData, error: billsError } = await supabase
          .from('bollette')
          .select('*')
          .eq('lease_id', 'lease1'); // Mock lease ID

        if (!billsError && billsData) {
          setBollette(billsData);
        }

        const { data: paymentsData, error: paymentsError } = await supabase
          .from('pagamenti')
          .select('*')
          .eq('user_id', userId);

        if (!paymentsError && paymentsData) {
          setPagamenti(paymentsData);
        }

        const { data: cashbackData, error: cashbackError } = await supabase
          .from('cashback')
          .select('amount')
          .eq('user_id', userId)
          .single();

        if (!cashbackError && cashbackData) {
          setCashback(cashbackData.amount || 0);
        }
      } catch (dbError) {
        console.log('Database tables may not exist yet, using mock data');
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (billId: string, amount: number, method: string) => {
    try {
      setLoading(true);
      setError(null);

      const newPayment: Pagamento = {
        id: Date.now().toString(),
        bill_id: billId,
        user_id: userId,
        importo: amount,
        metodo: method,
        stato: 'successo',
        data: new Date().toISOString(),
        transaction_id: `pagopa_${Date.now()}`,
      };

      // Try to save to database
      try {
        await supabase
          .from('pagamenti')
          .insert(newPayment);

        await supabase
          .from('bollette')
          .update({ stato: 'pagato' })
          .eq('id', billId);
      } catch (dbError) {
        console.log('Could not save to database, using local state only');
      }

      // Update local state
      setPagamenti(prev => [newPayment, ...prev]);
      setBollette(prev => 
        prev.map(bill => 
          bill.id === billId ? { ...bill, stato: 'pagato' } : bill
        )
      );

      // Calculate cashback
      const bill = bollette.find(b => b.id === billId);
      const cashbackAmount = bill?.categoria === 'Affitto' ? amount * 0.02 : amount * 0.01;
      setCashback(prev => prev + cashbackAmount);

      return { success: true, payment: newPayment };
    } catch (error) {
      console.error('Error adding payment:', error);
      setError('Errore durante il pagamento');
      return { success: false, error: 'Errore durante il pagamento' };
    } finally {
      setLoading(false);
    }
  };

  const updateBillStatus = async (billId: string, status: string) => {
    try {
      setLoading(true);
      setError(null);

      // Try to update in database
      try {
        await supabase
          .from('bollette')
          .update({ stato: status })
          .eq('id', billId);
      } catch (dbError) {
        console.log('Could not update database, using local state only');
      }

      // Update local state
      setBollette(prev => 
        prev.map(bill => 
          bill.id === billId ? { ...bill, stato: status as any } : bill
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating bill status:', error);
      setError('Errore durante l\'aggiornamento');
      return { success: false, error: 'Errore durante l\'aggiornamento' };
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBills = (filter: FiltroBollette) => {
    switch (filter) {
      case 'tutti':
        return bollette;
      case 'da_pagare':
        return bollette.filter(bill => bill.stato === 'da_pagare');
      case 'pagati':
        return bollette.filter(bill => bill.stato === 'pagato');
      case 'scaduti':
        return bollette.filter(bill => {
          const dueDate = new Date(bill.data_scadenza);
          const today = new Date();
          return dueDate < today && bill.stato !== 'pagato';
        });
      default:
        return bollette;
    }
  };

  const getFilteredPayments = (filter: FiltroPagamenti) => {
    switch (filter) {
      case 'tutti':
        return pagamenti;
      case 'successo':
        return pagamenti.filter(payment => payment.stato === 'successo');
      case 'fallito':
        return pagamenti.filter(payment => payment.stato === 'fallito');
      case 'rimborsato':
        return pagamenti.filter(payment => payment.stato === 'rimborsato');
      default:
        return pagamenti;
    }
  };

  // Additional functions for HomeScreen compatibility
  const fetchBollette = async (filter?: FiltroBollette) => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Supabase
      // For now, we'll use mock data
      setBollette(mockBollette);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento delle bollette');
      console.error('Error fetching bollette:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingBills = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return bollette.filter(bill => {
      const dueDate = new Date(bill.data_scadenza);
      return dueDate >= today && dueDate <= nextWeek && bill.stato !== 'pagato';
    });
  };

  const getOverdueBills = () => {
    const today = new Date();
    return bollette.filter(bill => {
      const dueDate = new Date(bill.data_scadenza);
      return dueDate < today && bill.stato !== 'pagato';
    });
  };

  const getMonthlyStats = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const monthlyBills = bollette.filter(bill => {
      const billDate = new Date(bill.created_at);
      return billDate.getMonth() === thisMonth && billDate.getFullYear() === thisYear;
    });

    const totalePagato = monthlyBills
      .filter(bill => bill.stato === 'pagato')
      .reduce((sum, bill) => sum + bill.importo, 0);

    const totaleDaPagare = monthlyBills
      .filter(bill => bill.stato === 'da_pagare')
      .reduce((sum, bill) => sum + bill.importo, 0);

    const bollettePagate = monthlyBills.filter(bill => bill.stato === 'pagato').length;

    return {
      totalePagato,
      totaleDaPagare,
      cashbackGuadagnato: cashback,
      bollettePagate,
    };
  };

  const getTotalCashback = () => {
    return cashback;
  };

  return {
    bollette,
    pagamenti,
    cashback,
    loading,
    error,
    loadData,
    addPayment,
    updateBillStatus,
    getFilteredBills,
    getFilteredPayments,
    fetchBollette,
    getUpcomingBills,
    getOverdueBills,
    getMonthlyStats,
    getTotalCashback,
  };
};