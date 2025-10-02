import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { 
  Download,
  PenTool,
  Check,
  Users,
  Calendar,
  Euro,
  AlertCircle
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useUser } from '@/store/user-store';
import { ContractSignature, RentalContract } from '@/types';

import SignaturePad from '@/components/SignaturePad';

export default function ContractDetailScreen() {
  const { user } = useUser();
  const params = useLocalSearchParams();
  const contractId = params.contractId as string;
  
  // Mock contract data - in real app, fetch from tRPC
  const contract: RentalContract = {
    id: contractId || '1',
    property_id: 'prop_1',
    owner_id: 'owner_1',
    tenant_ids: ['tenant_1', 'tenant_2'],
    title: 'Contratto di Locazione - Via Roma 123',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    monthly_rent: 1200,
    deposit: 2400,
    clauses: 'Il presente contratto di locazione è stipulato tra il proprietario e l\'inquilino per la durata di 12 mesi. L\'inquilino si impegna a pagare l\'affitto entro il 5 di ogni mese e a mantenere l\'immobile in buone condizioni.',
    notes: 'Spese condominiali incluse. Animali domestici non ammessi.',
    status: 'pending_signatures' as const,
    signatures: [
      {
        id: 'sig_1',
        contract_id: contractId || '1',
        user_id: 'owner_1',
        signature_image: '',
        signed_at: '2024-01-01T10:00:00Z',
        status: 'signed' as const,
      },
      {
        id: 'sig_2',
        contract_id: contractId || '1',
        user_id: 'tenant_1',
        signature_image: '',
        signed_at: '',
        status: 'pending' as const,
      },
    ],
    created_at: '2024-01-01T09:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  };
  
  const [contractData] = useState<RentalContract>(contract);
  const [showSignaturePad, setShowSignaturePad] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const userSignature = contractData.signatures.find((sig: ContractSignature) => sig.user_id === user?.id);
  const canSign = userSignature?.status === 'pending';


  const handleSign = async (signatureImage: string) => {
    setIsLoading(true);
    try {
      // In a real app, call tRPC mutation
      console.log('Signing contract with signature:', signatureImage);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSignaturePad(false);
      // Update local state or refetch contract
    } catch (error) {
      console.error('Error signing contract:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSignatureStatus = (signature: ContractSignature) => {
    if (signature.status === 'signed') {
      return {
        icon: Check,
        color: '#34C759',
        text: 'Firmato',
      };
    }
    return {
      icon: AlertCircle,
      color: '#FF9500',
      text: 'In attesa',
    };
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Dettagli Contratto',
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Download size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contract Header */}
        <View style={styles.section}>
          <Text style={styles.contractTitle}>{contractData.title}</Text>
          
          <View style={styles.contractMeta}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                {new Date(contractData.start_date).toLocaleDateString('it-IT')} - {new Date(contractData.end_date).toLocaleDateString('it-IT')}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Euro size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                €{contractData.monthly_rent}/mese • Deposito €{contractData.deposit}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Users size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                {contractData.tenant_ids.length} inquilino{contractData.tenant_ids.length > 1 ? 'i' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Signatures Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stato Firme</Text>
          
          {contractData.signatures.map((signature: ContractSignature) => {
            const status = getSignatureStatus(signature);
            const StatusIcon = status.icon;
            const isCurrentUser = signature.user_id === user?.id;
            
            return (
              <View key={signature.id} style={styles.signatureItem}>
                <View style={styles.signatureInfo}>
                  <Text style={styles.signatureName}>
                    {isCurrentUser ? 'Tu' : signature.user_id === contractData.owner_id ? 'Proprietario' : 'Inquilino'}
                  </Text>
                  <View style={styles.signatureStatus}>
                    <StatusIcon size={16} color={status.color} />
                    <Text style={[styles.signatureStatusText, { color: status.color }]}>
                      {status.text}
                    </Text>
                  </View>
                </View>
                
                {signature.signed_at && (
                  <Text style={styles.signatureDate}>
                    Firmato il {new Date(signature.signed_at).toLocaleDateString('it-IT')}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Contract Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clausole Contrattuali</Text>
          <Text style={styles.contractContent}>{contractData.clauses}</Text>
          
          {contractData.notes && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Note</Text>
              <Text style={styles.contractContent}>{contractData.notes}</Text>
            </>
          )}
        </View>

        {/* Sign Button */}
        {canSign && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.signButton}
              onPress={() => setShowSignaturePad(true)}
              disabled={isLoading}
            >
              <PenTool size={20} color={Colors.background} />
              <Text style={styles.signButtonText}>Firma Contratto</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Signature Modal */}
      <Modal
        visible={showSignaturePad}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SignaturePad
          onSave={handleSign}
          onCancel={() => setShowSignaturePad(false)}
        />
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contractTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  contractMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  signatureItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  signatureInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  signatureStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signatureStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signatureDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  contractContent: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  signButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  signaturePadContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  signaturePadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  signaturePadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  signatureCanvas: {
    flex: 1,
    margin: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  signaturePlaceholder: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  signaturePadActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  signatureCancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  signatureCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  signatureSaveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  signatureSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});