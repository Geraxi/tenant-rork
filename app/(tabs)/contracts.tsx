import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useUser } from '@/store/user-store';
import { RentalContract } from '@/types';
import { trpc } from '@/lib/trpc';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return Colors.textSecondary;
    case 'pending_signatures':
      return '#FF9500';
    case 'finalized':
      return '#34C759';
    default:
      return Colors.textSecondary;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft':
      return AlertCircle;
    case 'pending_signatures':
      return Clock;
    case 'finalized':
      return CheckCircle;
    default:
      return FileText;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'draft':
      return 'Bozza';
    case 'pending_signatures':
      return 'In attesa di firme';
    case 'finalized':
      return 'Finalizzato';
    default:
      return 'Sconosciuto';
  }
};

const ContractCard = ({ contract }: { contract: RentalContract }) => {
  const StatusIcon = getStatusIcon(contract.status);
  const statusColor = getStatusColor(contract.status);
  
  return (
    <TouchableOpacity
      style={styles.contractCard}
      onPress={() => router.push('/contract-detail')}
    >
      <View style={styles.contractHeader}>
        <View style={styles.contractInfo}>
          <Text style={styles.contractTitle} numberOfLines={2}>
            {contract.title}
          </Text>
          <Text style={styles.contractDates}>
            {new Date(contract.start_date).toLocaleDateString('it-IT')} - {new Date(contract.end_date).toLocaleDateString('it-IT')}
          </Text>
          <Text style={styles.contractRent}>
            €{contract.monthly_rent}/mese
          </Text>
        </View>
        <View style={styles.contractStatus}>
          <StatusIcon size={20} color={statusColor} />
        </View>
      </View>
      
      <View style={styles.contractFooter}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusText(contract.status)}
          </Text>
        </View>
        
        <View style={styles.contractActions}>
          {contract.status === 'finalized' && contract.pdf_url && (
            <TouchableOpacity style={styles.actionButton}>
              <Download size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton}>
            <Eye size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ContractsScreen() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'finalized'>('all');
  
  // Fetch contracts using tRPC
  const contractsQuery = trpc.contracts.list.useQuery();
  const contracts = contractsQuery.data?.contracts || [];
  
  const filteredContracts = contracts.filter((contract: RentalContract) => {
    if (activeTab === 'pending') {
      return contract.status === 'draft' || contract.status === 'pending_signatures';
    }
    if (activeTab === 'finalized') {
      return contract.status === 'finalized';
    }
    return true;
  });

  const canCreateContract = user?.current_mode === 'landlord';
  
  if (contractsQuery.isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Caricamento contratti...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Contratti',
          headerRight: () => canCreateContract ? (
            <TouchableOpacity
              onPress={() => router.push('/create-contract')}
              style={styles.headerButton}
            >
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ) : null,
        }} 
      />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tutti
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            In Attesa
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'finalized' && styles.activeTab]}
          onPress={() => setActiveTab('finalized')}
        >
          <Text style={[styles.tabText, activeTab === 'finalized' && styles.activeTabText]}>
            Finalizzati
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {canCreateContract && (
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickCreateButton}
              onPress={() => router.push('/create-contract')}
            >
              <Plus size={20} color={Colors.background} />
              <Text style={styles.quickCreateButtonText}>Crea nuovo contratto</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {filteredContracts.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nessun contratto</Text>
            <Text style={styles.emptySubtitle}>
              {canCreateContract 
                ? 'I tuoi contratti appariranno qui una volta creati'
                : 'Non hai ancora contratti attivi'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.contractsList}>
            {filteredContracts.map((contract) => (
              <ContractCard key={contract.id} contract={contract} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.background,
  },
  content: {
    flex: 1,
  },
  contractsList: {
    padding: 20,
  },
  contractCard: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contractInfo: {
    flex: 1,
    marginRight: 12,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textLight,
    marginBottom: 4,
  },
  contractDates: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  contractRent: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  contractStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contractActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  quickActions: {
    padding: 20,
    paddingBottom: 0,
  },
  quickCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickCreateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
});