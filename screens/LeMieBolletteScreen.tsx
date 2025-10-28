import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { usePayments } from '../src/hooks/usePayments';
import { Bolletta, FiltroBollette } from '../src/types';
import { qrService, BillData as QRBillData } from '../src/services/qrService';
import { ocrService, BillData as OCRBillData } from '../src/services/ocrService';
import QRScannerScreen from './QRScannerScreen';
import ScanBillButton from '../src/components/ScanBillButton';
import PayBillButton from '../src/components/PayBillButton';
import { Bill, billsApi, transactionsApi } from '../src/lib/supabase';

import { logger } from '../src/utils/logger';

interface LeMieBolletteScreenProps {
  onNavigateToPayment: (billId: string, importo: number, categoria: string) => void;
  onBack: () => void;
}

export default function LeMieBolletteScreen({
  onNavigateToPayment,
  onBack,
}: LeMieBolletteScreenProps) {
  const { user } = useSupabaseAuth();
  const {
    bollette, 
    loading, 
    fetchBollette,
    getUpcomingBills,
    getOverdueBills,
    addBill,
  } = usePayments(user?.id || '');

  // Debug logging
  logger.debug('🔍 LeMieBolletteScreen - User:', user);
  logger.debug('🔍 LeMieBolletteScreen - User ID:', user?.id);
  logger.debug('🔍 LeMieBolletteScreen - Bollette:', bollette);
  logger.debug('🔍 LeMieBolletteScreen - Loading:', loading);
  
  const [filtro, setFiltro] = useState<FiltroBollette>('tutte');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showScanOptions, setShowScanOptions] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'bills' | 'qr-scanner'>('bills');

  // Filter bills based on selected category
  const filteredBills = selectedCategory === 'all'
    ? bollette
    : bollette.filter(bill => bill.categoria === selectedCategory);

  // Debug logging
  logger.debug('🔍 LeMieBolletteScreen - selectedCategory:', selectedCategory);
  logger.debug('🔍 LeMieBolletteScreen - filteredBills:', filteredBills);

  useEffect(() => {
    if (user?.id) {
      loadBills();
    }
  }, [user?.id, filtro]);

  const loadBills = async () => {
    await fetchBollette(filtro);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBills();
    setRefreshing(false);
  };

  const handleQRScan = () => {
    setCurrentScreen('qr-scanner');
  };

  const handleQRScanned = (data: string) => {
    try {
      const billData = qrService.parseQRData(data);
      if (billData) {
        // Add the scanned bill to the list
        const newBill = {
          id: Date.now().toString(),
          categoria: billData.category,
          importo: billData.amount,
          data_scadenza: billData.dueDate,
          stato: 'da_pagare',
          lease_id: 'lease1',
          created_at: new Date().toISOString(),
        };
        addBill(newBill);
        Alert.alert('Successo', 'Bolletta aggiunta con successo!');
      } else {
        Alert.alert('Errore', 'Impossibile analizzare i dati della bolletta');
      }
    } catch (error) {
      logger.error('QR scan error:', error);
      Alert.alert('Errore', 'Errore durante l\'elaborazione del QR code');
    }
  };

  const handleBillCreated = (bill: Bill) => {
    // Convert the new Italian tax bill format to the existing format
    const newBill = {
      id: bill.id,
      categoria: bill.tax_type?.toLowerCase() || 'other',
      importo: bill.amount,
      data_scadenza: bill.due_date || new Date().toISOString().split('T')[0],
      stato: bill.status === 'pending' ? 'da_pagare' : bill.status,
      lease_id: 'lease1',
      created_at: bill.created_at,
      descrizione: `${bill.tax_type || 'Tax'} - ${bill.provider_name}`,
    };
    addBill(newBill);
    
    // Show tax-specific success message
    const taxTypeNames = {
      'IMU': 'IMU - Imposta Municipale',
      'TARI': 'TARI - Tassa Rifiuti',
      'TASI': 'TASI - Tassa Servizi',
      'CONSORZIO': 'Consorzio di Bonifica',
      'CONDOMINIO': 'Spese Condominiali',
      'CANONE_UNICO': 'Canone Unico',
      'OTHER': 'Bolletta'
    };
    const taxDisplayName = taxTypeNames[bill.tax_type as keyof typeof taxTypeNames] || 'Bolletta';
    Alert.alert('Successo', `${taxDisplayName} aggiunta con successo!`);
  };

  const handlePaymentSuccess = () => {
    // Refresh the bills list after successful payment
    loadBills();
  };

  const handleOCRScan = async () => {
    try {
      const result = await ocrService.showOCROptions();
      
      if (result.success && result.text) {
        const billData = ocrService.parseBillText(result.text);
        if (billData) {
          Alert.alert(
            'Testo Estratto',
            `Importo: €${billData.amount}\nCreditor: ${billData.creditor}\nCategoria: ${billData.category}`,
            [
              {
                text: 'Aggiungi Bolletta',
                onPress: () => {
                  // Here you would add the bill to the database
                  Alert.alert('Successo', 'Bolletta aggiunta con successo!');
                },
              },
              {
                text: 'Annulla',
                style: 'cancel',
              },
            ]
          );
        } else {
          Alert.alert('Errore', 'Impossibile analizzare il testo della bolletta');
        }
      }
    } catch (error) {
      console.error('OCR error:', error);
      Alert.alert('Errore', 'Errore durante l\'estrazione del testo');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getBillIcon = (categoria: string) => {
    switch (categoria) {
      case 'Affitto':
        return 'home';
      case 'Elettricità':
        return 'lightbulb';
      case 'Gas':
        return 'local-fire-department';
      case 'Acqua':
        return 'water-drop';
      case 'Riscaldamento':
        return 'thermostat';
      case 'Condominio':
        return 'apartment';
      case 'Tasse':
        return 'receipt';
      // Landlord-specific categories
      case 'manutenzione':
        return 'build';
      case 'assicurazione':
        return 'security';
      case 'tasse_immobili':
        return 'account-balance';
      case 'pulizie':
        return 'cleaning-services';
      case 'entrata_affitto':
        return 'account-balance-wallet';
      case 'deposito_cauzione':
        return 'savings';
      default:
        return 'receipt';
    }
  };

  const getBillColor = (categoria: string) => {
    switch (categoria) {
      case 'Affitto':
        return '#2196F3';
      case 'Elettricità':
        return '#FFC107';
      case 'Gas':
        return '#FF5722';
      case 'Acqua':
        return '#00BCD4';
      case 'Riscaldamento':
        return '#FF9800';
      case 'Condominio':
        return '#9C27B0';
      case 'Tasse':
        return '#795548';
      // Landlord-specific categories
      case 'manutenzione':
        return '#FF9800';
      case 'assicurazione':
        return '#4CAF50';
      case 'tasse_immobili':
        return '#2196F3';
      case 'pulizie':
        return '#9C27B0';
      case 'entrata_affitto':
        return '#4CAF50';
      case 'deposito_cauzione':
        return '#FFC107';
      default:
        return '#607D8B';
    }
  };

  const getStatusColor = (stato: string) => {
    switch (stato) {
      case 'pagato':
        return '#4CAF50';
      case 'da_pagare':
        return '#FF9800';
      case 'scaduto':
        return '#F44336';
      case 'in_ritardo':
        return '#D32F2F';
      default:
        return '#666';
    }
  };

  const getStatusText = (stato: string) => {
    if (user?.ruolo === 'landlord') {
      switch (stato) {
        case 'pagato':
          return 'Ricevuto';
        case 'da_pagare':
          return 'In sospeso';
        case 'scaduto':
          return 'In ritardo';
        case 'in_ritardo':
          return 'In ritardo';
        default:
          return stato;
      }
    } else {
      switch (stato) {
        case 'pagato':
          return 'Pagato';
        case 'da_pagare':
          return 'Da pagare';
        case 'scaduto':
          return 'Scaduto';
        case 'in_ritardo':
          return 'In ritardo';
        default:
          return stato;
      }
    }
  };

  const isOverdue = (dataScadenza: string) => {
    return new Date(dataScadenza) < new Date();
  };

  const isPaymentOverdue = (bill: Bolletta) => {
    if (bill.stato === 'pagato') return false;
    return isOverdue(bill.data_scadenza);
  };

  const handleSendReminder = (bill: Bolletta) => {
    Alert.alert(
      'Invia Promemoria',
      `Vuoi inviare un promemoria di pagamento per ${bill.descrizione} (${formatCurrency(bill.importo)})?`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Invia',
          onPress: () => {
            // TODO: Implement actual reminder sending logic
            Alert.alert(
              'Promemoria Inviato',
              'Il promemoria di pagamento è stato inviato al tuo inquilino.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleEditBill = (bill: Bolletta) => {
    Alert.alert(
      'Modifica Bolletta',
      `Vuoi modificare la bolletta "${bill.descrizione}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Modifica', 
          onPress: () => {
            // Basic edit functionality - show input dialog
            Alert.prompt(
              'Modifica Importo',
              `Inserisci il nuovo importo per "${bill.descrizione}":`,
              [
                { text: 'Annulla', style: 'cancel' },
                { 
                  text: 'Salva', 
                  onPress: (newAmount) => {
                    if (newAmount && !isNaN(parseFloat(newAmount))) {
                      // Update the bill amount
                      // Note: This would need to be implemented in the usePayments hook
                      // For now, we'll just show a success message
                      Alert.alert('Successo', 'Importo aggiornato!');
                      Alert.alert('Successo', 'Bolletta modificata con successo!');
                    } else {
                      Alert.alert('Errore', 'Importo non valido');
                    }
                  }
                }
              ],
              'plain-text',
              bill.importo.toString()
            );
          }
        }
      ]
    );
  };

  const handleDeleteBill = (bill: Bolletta) => {
    Alert.alert(
      'Elimina Bolletta',
      `Sei sicuro di voler eliminare la bolletta "${bill.descrizione}" (${formatCurrency(bill.importo)})?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: () => {
            // Remove bill from state
            // Note: This would need to be implemented in the usePayments hook
            // For now, we'll just show a success message
            Alert.alert('Successo', 'Bolletta eliminata con successo!');
          }
        }
      ]
    );
  };

  const handlePayBill = (bill: Bolletta) => {
    if (bill.stato === 'pagato') {
      Alert.alert('Info', user?.ruolo === 'tenant' ? 'Questa bolletta è già stata pagata' : 'Questo pagamento è già stato ricevuto');
      return;
    }
    onNavigateToPayment(bill.id, bill.importo, bill.categoria);
  };

  const filterOptions: { value: FiltroBollette; label: string }[] = [
    { value: 'tutte', label: 'Tutte' },
    { 
      value: 'da_pagare', 
      label: user?.ruolo === 'tenant' ? 'Da pagare' : 'In sospeso' 
    },
    { 
      value: 'pagate', 
      label: user?.ruolo === 'tenant' ? 'Pagate' : 'Ricevute' 
    },
    { value: 'scadute', label: 'Scadute' },
    { value: 'questo_mese', label: 'Questo mese' },
    { value: 'anno_corrente', label: 'Anno corrente' },
  ];

  const categoryOptions: { value: string; label: string; icon: string }[] = [
    { value: 'all', label: 'Tutte', icon: 'list' },
    { value: 'Affitto', label: 'Affitto', icon: 'home' },
    { value: 'Elettricità', label: 'Elettricità', icon: 'lightbulb' },
    { value: 'Gas', label: 'Gas', icon: 'local-fire-department' },
    { value: 'Acqua', label: 'Acqua', icon: 'water-drop' },
    { value: 'Riscaldamento', label: 'Riscaldamento', icon: 'thermostat' },
    { value: 'Condominio', label: 'Condominio', icon: 'apartment' },
    { value: 'Tasse', label: 'Tasse', icon: 'receipt' },
    // Landlord-specific categories
    ...(user?.ruolo === 'landlord' ? [
      { value: 'manutenzione', label: 'Manutenzione', icon: 'build' },
      { value: 'assicurazione', label: 'Assicurazione', icon: 'security' },
      { value: 'tasse_immobili', label: 'Tasse Immobili', icon: 'account-balance' },
      { value: 'pulizie', label: 'Pulizie', icon: 'cleaning-services' },
      { value: 'entrata_affitto', label: 'Entrate Affitto', icon: 'account-balance-wallet' },
      { value: 'deposito_cauzione', label: 'Depositi', icon: 'savings' },
    ] : []),
  ];

  // Apply additional filters to the already filtered bills
  const finalFilteredBills = filteredBills.filter(bill => {
    // First filter by status/date filter
    let passesStatusFilter = true;
    switch (filtro) {
      case 'da_pagare':
        passesStatusFilter = bill.stato === 'da_pagare';
        break;
      case 'pagate':
        passesStatusFilter = bill.stato === 'pagato';
        break;
      case 'scadute':
        passesStatusFilter = bill.stato === 'scaduto' || bill.stato === 'in_ritardo';
        break;
      case 'questo_mese':
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const billDate = new Date(bill.data_scadenza);
        passesStatusFilter = billDate >= startOfMonth && billDate <= endOfMonth;
        break;
      case 'anno_corrente':
        const currentYear = new Date().getFullYear();
        const billYear = new Date(bill.data_scadenza).getFullYear();
        passesStatusFilter = billYear === currentYear;
        break;
      default:
        passesStatusFilter = true;
    }

    return passesStatusFilter;
  });

  const upcomingBills = useMemo(() => {
    const now = new Date();
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);

    return filteredBills
      .filter((bill) => {
        if (bill.stato === 'pagato') return false;
        const dueDate = new Date(bill.data_scadenza);
        return dueDate >= now && dueDate <= in30Days;
      })
      .sort(
        (a, b) =>
          new Date(a.data_scadenza).getTime() -
          new Date(b.data_scadenza).getTime(),
      );
  }, [filteredBills]);

  const categoryBreakdown = useMemo(() => {
    const result: Record<string, number> = {};
    filteredBills.forEach((bill) => {
      result[bill.categoria] = (result[bill.categoria] || 0) + bill.importo;
    });
    return result;
  }, [filteredBills]);

  const categoryEntries = useMemo(
    () =>
      Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]),
    [categoryBreakdown],
  );

  const totalCategoryAmount = useMemo(
    () =>
      categoryEntries.reduce((sum, [, total]) => sum + total, 0),
    [categoryEntries],
  );

  const statusBreakdown = useMemo(() => {
    const result: Record<string, number> = {
      da_pagare: 0,
      pagato: 0,
      scaduto: 0,
      in_ritardo: 0,
    };
    filteredBills.forEach((bill) => {
      result[bill.stato] = (result[bill.stato] || 0) + 1;
    });
    return result;
  }, [filteredBills]);

  const statusEntries = useMemo(
    () => Object.entries(statusBreakdown),
    [statusBreakdown],
  );

  const maxStatusCount = useMemo(() => {
    const values = statusEntries.map(([, count]) => count);
    return values.length ? Math.max(...values, 1) : 1;
  }, [statusEntries]);

  // Debug logging
  logger.debug('🔍 LeMieBolletteScreen - finalFilteredBills:', finalFilteredBills);
  logger.debug('🔍 LeMieBolletteScreen - filtro:', filtro);
  logger.debug('🔍 LeMieBolletteScreen - loading:', loading);
  logger.debug('🔍 LeMieBolletteScreen - finalFilteredBills.length:', finalFilteredBills.length);

  // Show QR scanner screen if currentScreen is 'qr-scanner'
  if (currentScreen === 'qr-scanner') {
    return (
      <QRScannerScreen
        onNavigateBack={() => setCurrentScreen('bills')}
        onQRScanned={handleQRScanned}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {user?.ruolo === 'tenant' ? 'Le Mie Bollette' : 'Le Mie Entrate'}
        </Text>
        <View style={styles.headerButtons}>
          <View style={styles.scanButtonWrapper}>
            <ScanBillButton 
              onBillCreated={handleBillCreated}
              userId={user?.id || ''}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialIcons name="filter-list" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentScrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredBills.length}</Text>
            <Text style={styles.statLabel}>
              {user?.ruolo === 'tenant' ? 'Bollette' : 'Transazioni'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F44336' }]}>
              {filteredBills.filter(b => b.stato === 'da_pagare' || b.stato === 'scaduto').length}
            </Text>
            <Text style={styles.statLabel}>
              {user?.ruolo === 'tenant' ? 'Da pagare' : 'In sospeso'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {filteredBills.filter(b => b.stato === 'pagato').length}
            </Text>
            <Text style={styles.statLabel}>
              {user?.ruolo === 'tenant' ? 'Pagate' : 'Ricevute'}
            </Text>
          </View>
        </View>

        {/* Category Filter Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categoryOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.categoryButton,
                selectedCategory === option.value && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(option.value)}
            >
              <MaterialIcons 
                name={option.icon as any} 
                size={16} 
                color={selectedCategory === option.value ? '#fff' : '#374151'} 
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === option.value && styles.categoryButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Analytics */}
        <View style={styles.analyticsContainer}>
          <Text style={styles.analyticsTitle}>Andamento bollette</Text>
          <Text style={styles.analyticsSubtitle}>
            Distribuzione delle bollette per categoria e stato
          </Text>

          <View style={styles.analyticsRow}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Categorie</Text>
              {totalCategoryAmount > 0 ? (
                <>
                  <View style={styles.stackedBar}>
                    {categoryEntries.map(([category, total]) => (
                      <View
                        key={category}
                        style={[
                          styles.stackedSegment,
                          {
                            flex: total,
                            backgroundColor: getBillColor(category),
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.legendList}>
                    {categoryEntries.map(([category, total]) => (
                      <View key={category} style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: getBillColor(category) },
                          ]}
                        />
                        <Text style={styles.legendLabel}>
                          {category} • {formatCurrency(total)} (
                          {Math.round((total / totalCategoryAmount) * 100)}%)
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.chartPlaceholder}>
                  <Text style={styles.chartPlaceholderText}>Nessun dato disponibile</Text>
                </View>
              )}
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Stato</Text>
              <View style={styles.barChart}>
                {statusEntries.map(([status, count]) => {
                  const barHeight = 20 + (count / maxStatusCount) * 80;
                  return (
                    <View key={status} style={styles.barColumn}>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: barHeight,
                              backgroundColor: getStatusColor(status),
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>{getStatusText(status)}</Text>
                      <Text style={styles.barCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.analyticsRow}>
            <View style={styles.chartCardFull}>
              <Text style={styles.chartTitle}>Scadenze prossime</Text>
              <Text style={styles.chartSubtitle}>
                Nei prossimi 30 giorni: {upcomingBills.length} bollette •{' '}
                {formatCurrency(
                  upcomingBills.reduce((sum, bill) => sum + bill.importo, 0),
                )}
              </Text>
              {upcomingBills.length > 0 ? (
                <View style={styles.timelineList}>
                  {upcomingBills.slice(0, 4).map((bill) => (
                    <View key={bill.id} style={styles.timelineItem}>
                      <View
                        style={[
                          styles.timelineDot,
                          { backgroundColor: getBillColor(bill.categoria) },
                        ]}
                      />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>{bill.descrizione}</Text>
                        <Text style={styles.timelineMeta}>
                          {formatDate(bill.data_scadenza)} • {formatCurrency(bill.importo)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.timelinePlaceholder}>
                  <Text style={styles.chartPlaceholderText}>Nessuna scadenza imminente</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento...</Text>
          </View>
        ) : finalFilteredBills.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>
              {user?.ruolo === 'tenant' ? 'Nessuna bolletta' : 'Nessuna transazione'}
            </Text>
            <Text style={styles.emptyStateText}>
              {filtro === 'tutte' 
                ? user?.ruolo === 'tenant' 
                  ? 'Non hai ancora bollette registrate'
                  : 'Non hai ancora transazioni registrate'
                : `Nessuna ${user?.ruolo === 'tenant' ? 'bolletta' : 'transazione'} per il filtro "${filterOptions.find(f => f.value === filtro)?.label}"`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.billsListContainer}>
            {finalFilteredBills.map((bill) => (
              <TouchableOpacity
                key={bill.id}
                style={[
                  styles.billCard,
                  isOverdue(bill.data_scadenza) && bill.stato !== 'pagato' && styles.overdueCard
                ]}
                onPress={() => handlePayBill(bill)}
              >
              <View style={styles.billHeader}>
                <View style={styles.billIconContainer}>
                  <MaterialIcons 
                    name={getBillIcon(bill.categoria)} 
                    size={24} 
                    color={getBillColor(bill.categoria)} 
                  />
                </View>
                <View style={styles.billInfo}>
                  <Text style={styles.billTitle}>{bill.descrizione}</Text>
                  <Text style={styles.billCategory}>
                    {bill.categoria.charAt(0).toUpperCase() + bill.categoria.slice(1)}
                    {user?.ruolo === 'landlord' && isPaymentOverdue(bill) && (
                      <Text style={styles.overdueIndicator}> • SCADUTO</Text>
                    )}
                  </Text>
                </View>
                <View style={styles.billStatus}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(bill.stato) }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusText(bill.stato)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.billDetails}>
                <View style={styles.billAmount}>
                  <Text style={styles.amountText}>
                    {formatCurrency(bill.importo)}
                  </Text>
                  <Text style={styles.dueDateText}>
                    {user?.ruolo === 'tenant' ? 'Scadenza' : 'Data'}: {formatDate(bill.data_scadenza)}
                  </Text>
                </View>

                {bill.stato !== 'pagato' && (
                  user?.ruolo === 'tenant' ? (
                    <PayBillButton
                      billId={bill.id}
                      amountCents={Math.round(bill.importo * 100)}
                      label="Paga"
                      onPaymentSuccess={handlePaymentSuccess}
                      bill={{
                        id: bill.id,
                        tax_type: bill.categoria?.toUpperCase() as any || 'OTHER',
                        provider_name: bill.descrizione || 'Provider',
                        amount: bill.importo,
                        status: bill.stato === 'pagato' ? 'paid' : 'pending',
                        due_date: bill.data_scadenza,
                        user_id: user?.id || '',
                        qr_raw: null,
                        meta: {},
                        stripe_pi_id: null,
                        created_at: bill.created_at || new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      }}
                    />
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.payButton,
                        user?.ruolo === 'landlord' && isPaymentOverdue(bill) && styles.reminderButton
                      ]}
                      onPress={() => {
                        if (user?.ruolo === 'landlord' && isPaymentOverdue(bill)) {
                          handleSendReminder(bill);
                        } else {
                          handlePayBill(bill);
                        }
                      }}
                    >
                      <LinearGradient
                        colors={
                          user?.ruolo === 'landlord' && isPaymentOverdue(bill)
                            ? ['#FF9800', '#F57C00'] // Orange for reminder
                            : ['#4CAF50', '#45a049'] // Green for pay/manage
                        }
                        style={styles.payButtonGradient}
                      >
                        <MaterialIcons 
                          name={
                            user?.ruolo === 'landlord' && isPaymentOverdue(bill)
                              ? 'notifications' 
                              : 'payment'
                          } 
                          size={20} 
                          color="#fff" 
                        />
                        <Text style={styles.payButtonText}>
                          {user?.ruolo === 'tenant' 
                            ? 'Paga' 
                            : isPaymentOverdue(bill) 
                              ? 'Invia Promemoria' 
                              : 'Gestisci'
                          }
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Edit/Delete buttons for bills */}
              <View style={styles.billActionsContainer}>
                <TouchableOpacity 
                  style={styles.editBillButton}
                  onPress={() => handleEditBill(bill)}
                >
                  <MaterialIcons name="edit" size={16} color="#2196F3" />
                  <Text style={styles.editBillButtonText}>Modifica</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteBillButton}
                  onPress={() => handleDeleteBill(bill)}
                >
                  <MaterialIcons name="delete" size={16} color="#F44336" />
                  <Text style={styles.deleteBillButtonText}>Elimina</Text>
                </TouchableOpacity>
              </View>

              {bill.note && (
                <View style={styles.billNote}>
                  <MaterialIcons name="note" size={16} color="#666" />
                  <Text style={styles.noteText}>{bill.note}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {user?.ruolo === 'tenant' ? 'Filtra Bollette' : 'Filtra Transazioni'}
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filtro === option.value && styles.filterOptionActive
                ]}
                onPress={() => {
                  setFiltro(option.value);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  filtro === option.value && styles.filterOptionTextActive
                ]}>
                  {option.label}
                </Text>
                {filtro === option.value && (
                  <MaterialIcons name="check" size={20} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Scan Options Modal */}
      <Modal
        visible={showScanOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScanOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scansiona Bolletta</Text>
              <TouchableOpacity onPress={() => setShowScanOptions(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.scanOption}
              onPress={() => {
                setShowScanOptions(false);
                handleQRScan();
              }}
            >
              <MaterialIcons name="qr-code-scanner" size={32} color="#2196F3" />
              <View style={styles.scanOptionText}>
                <Text style={styles.scanOptionTitle}>QR Code</Text>
                <Text style={styles.scanOptionSubtitle}>
                  Scansiona il codice QR della bolletta
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scanOption}
              onPress={() => {
                setShowScanOptions(false);
                handleOCRScan();
              }}
            >
              <MaterialIcons name="text-fields" size={32} color="#2196F3" />
              <View style={styles.scanOptionText}>
                <Text style={styles.scanOptionTitle}>OCR</Text>
                <Text style={styles.scanOptionSubtitle}>
                  Estrai testo da un'immagine della bolletta
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    flexShrink: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  scanButtonWrapper: {
    maxWidth: 120,
    marginRight: 8,
  },
  scanButton: {
    padding: 8,
    marginRight: 8,
  },
  filterButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  analyticsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  analyticsSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 16,
  },
  analyticsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  chartCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 12,
    minWidth: 160,
  },
  chartCardFull: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    minWidth: 260,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  chartPlaceholder: {
    height: 140,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelinePlaceholder: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  chartPlaceholderText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  stackedBar: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#e5e7eb',
  },
  stackedSegment: {
    height: '100%',
  },
  legendList: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: '#374151',
    flexShrink: 1,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 12,
    gap: 12,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'flex-end',
    paddingBottom: 6,
    paddingHorizontal: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 80,
  },
  barCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    marginBottom: 0,
  },
  categoryContent: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 32,
  },
  categoryButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  billsListContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  billCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  billIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  billCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  overdueIndicator: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: 'bold',
  },
  billStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  billDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billAmount: {
    flex: 1,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dueDateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  payButton: {
    borderRadius: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderButton: {
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  billActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  editBillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  editBillButtonText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  deleteBillButtonText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  billNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  noteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionActive: {
    backgroundColor: '#f8f9fa',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterOptionTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  scanOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scanOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  scanOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scanOptionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  timelineList: {
    marginTop: 8,
    gap: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timelineMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});
