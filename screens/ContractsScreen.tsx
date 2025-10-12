import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { t } from '../utils/translations';

interface Contract {
  id: string;
  propertyAddress: string;
  tenantName: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'sent' | 'signed';
}

interface ContractsScreenProps {
  onBack: () => void;
  onCreateContract: () => void;
  onViewContract: (contract: Contract) => void;
}

export default function ContractsScreen({ 
  onBack, 
  onCreateContract,
  onViewContract 
}: ContractsScreenProps) {
  const [contracts] = useState<Contract[]>([
    {
      id: '1',
      propertyAddress: 'Via Roma 123, Milano',
      tenantName: 'Mario Rossi',
      monthlyRent: 1500,
      startDate: '2024-02-01',
      endDate: '2025-02-01',
      status: 'signed',
    },
  ]);

  const renderContract = ({ item }: { item: Contract }) => (
    <TouchableOpacity 
      style={styles.contractCard}
      onPress={() => onViewContract(item)}
    >
      <View style={styles.contractHeader}>
        <MaterialIcons name="description" size={32} color="#4ECDC4" />
        <View style={[
          styles.statusBadge,
          styles[`status_${item.status}`]
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'draft' ? 'Bozza' : 
             item.status === 'sent' ? 'Inviato' : 'Firmato'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.propertyAddress}>{item.propertyAddress}</Text>
      <Text style={styles.tenantName}>{item.tenantName}</Text>
      
      <View style={styles.contractDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="attach-money" size={16} color="#666" />
          <Text style={styles.detailText}>€{item.monthlyRent}/mese</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.startDate).toLocaleDateString('it-IT')}
          </Text>
        </View>
      </View>
      
      <MaterialIcons name="chevron-right" size={24} color="#CCC" style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('rentalContracts')}</Text>
        <TouchableOpacity onPress={onCreateContract}>
          <MaterialIcons name="add" size={28} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      {contracts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="description" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>{t('noContracts')}</Text>
          <Text style={styles.emptySubtitle}>{t('createFirstContract')}</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={onCreateContract}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.createButtonText}>{t('createContract')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contracts}
          renderItem={renderContract}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  contractCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status_draft: {
    backgroundColor: '#FFF3E0',
  },
  status_sent: {
    backgroundColor: '#E3F2FD',
  },
  status_signed: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  propertyAddress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tenantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  contractDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});