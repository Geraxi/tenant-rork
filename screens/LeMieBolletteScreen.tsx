import React, { useState, useEffect } from 'react';
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
  } = usePayments(user?.id || '');
  
  const [filtro, setFiltro] = useState<FiltroBollette>('tutte');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

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
      case 'affitto':
        return 'home';
      case 'luce':
        return 'lightbulb';
      case 'gas':
        return 'local-fire-department';
      case 'acqua':
        return 'water-drop';
      case 'riscaldamento':
        return 'thermostat';
      case 'condominio':
        return 'apartment';
      case 'tasse':
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
      case 'affitto':
        return '#2196F3';
      case 'luce':
        return '#FFC107';
      case 'gas':
        return '#FF5722';
      case 'acqua':
        return '#00BCD4';
      case 'riscaldamento':
        return '#FF9800';
      case 'condominio':
        return '#9C27B0';
      case 'tasse':
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
                      setBollette(prev => prev.map(b => 
                        b.id === bill.id 
                          ? { ...b, importo: parseFloat(newAmount) }
                          : b
                      ));
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
            setBollette(prev => prev.filter(b => b.id !== bill.id));
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

  const filteredBills = bollette.filter(bill => {
    switch (filtro) {
      case 'da_pagare':
        return bill.stato === 'da_pagare';
      case 'pagate':
        return bill.stato === 'pagato';
      case 'scadute':
        return bill.stato === 'scaduto' || bill.stato === 'in_ritardo';
      case 'questo_mese':
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const billDate = new Date(bill.data_scadenza);
        return billDate >= startOfMonth && billDate <= endOfMonth;
      case 'anno_corrente':
        const currentYear = new Date().getFullYear();
        const billYear = new Date(bill.data_scadenza).getFullYear();
        return billYear === currentYear;
      default:
        return true;
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {user?.ruolo === 'tenant' ? 'Le Mie Bollette' : 'Le Mie Entrate'}
        </Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <MaterialIcons name="filter-list" size={24} color="#333" />
        </TouchableOpacity>
      </View>

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

      {/* Bills List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento...</Text>
          </View>
        ) : filteredBills.length === 0 ? (
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
          filteredBills.map((bill) => (
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
          ))
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
    justifyContent: 'space-between',
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
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
    marginTop: 12,
    gap: 12,
  },
  editBillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
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
    paddingVertical: 8,
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
});
