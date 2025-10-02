import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { FileText, CheckCircle, Clock, AlertCircle, Euro } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

interface ContractRegistrationProps {
  contractId: string;
  onComplete?: (result: any) => void;
}

export default function ContractRegistration({ contractId, onComplete }: ContractRegistrationProps) {
  const [formData, setFormData] = useState({
    fiscalCode: '',
    propertyAddress: '',
    monthlyRent: '',
    startDate: '',
    endDate: '',
    tenantFiscalCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  const registerContract = trpc.contracts.registerWithAgenziaEntrate.useMutation({
    onSuccess: (data) => {
      console.log('Registration successful:', data);
      setRegistrationResult(data);
      setIsSubmitting(false);
      if (onComplete) {
        onComplete(data);
      }
    },
    onError: (error) => {
      console.error('Contract registration error:', error);
      console.error('Error details:', {
        message: error.message,
        data: error.data,
        shape: error.shape
      });
      setIsSubmitting(false);
      
      // More detailed error message
      let errorMessage = 'Errore durante la registrazione';
      if (error.message.includes('Load failed')) {
        errorMessage = 'Errore di connessione. Verifica la tua connessione internet e riprova.';
      } else if (error.message.includes('UNAUTHORIZED')) {
        errorMessage = 'Errore di autenticazione. Effettua nuovamente il login.';
      } else {
        errorMessage = `Errore: ${error.message}`;
      }
      
      alert(errorMessage);
    },
  });

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.fiscalCode.trim()) {
      alert('Inserisci il codice fiscale del proprietario');
      return;
    }
    if (!formData.propertyAddress.trim()) {
      alert('Inserisci l\'indirizzo dell\'immobile');
      return;
    }
    if (!formData.monthlyRent.trim() || isNaN(parseFloat(formData.monthlyRent))) {
      alert('Inserisci un canone mensile valido');
      return;
    }
    if (!formData.startDate.trim()) {
      alert('Inserisci la data di inizio');
      return;
    }
    if (!formData.endDate.trim()) {
      alert('Inserisci la data di fine');
      return;
    }
    if (!formData.tenantFiscalCode.trim()) {
      alert('Inserisci il codice fiscale dell\'inquilino');
      return;
    }

    const requestData = {
      contractId,
      fiscalCode: formData.fiscalCode,
      propertyAddress: formData.propertyAddress,
      monthlyRent: parseFloat(formData.monthlyRent),
      startDate: formData.startDate,
      endDate: formData.endDate,
      tenantFiscalCode: formData.tenantFiscalCode,
    };

    console.log('Submitting contract registration with data:', requestData);
    console.log('tRPC client URL should be logged above...');

    setIsSubmitting(true);
    
    try {
      registerContract.mutate(requestData);
    } catch (error) {
      console.error('Error during mutation call:', error);
      setIsSubmitting(false);
    }
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock size={24} color="#FF9500" />;
      case 'approved':
        return <CheckCircle size={24} color="#34C759" />;
      case 'rejected':
        return <AlertCircle size={24} color="#FF3B30" />;
      default:
        return <FileText size={24} color="#007AFF" />;
    }
  };

  if (registrationResult) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            {renderStatusIcon(registrationResult.status)}
            <Text style={styles.resultTitle}>Registrazione Inviata</Text>
          </View>
          
          <Text style={styles.resultMessage}>{registrationResult.message}</Text>
          
          <View style={styles.resultDetails}>
            <View style={styles.resultDetailRow}>
              <Text style={styles.resultDetailLabel}>Numero Registrazione:</Text>
              <Text style={styles.resultDetailValue}>{registrationResult.registrationNumber}</Text>
            </View>
            
            <View style={styles.resultDetailRow}>
              <Text style={styles.resultDetailLabel}>Tempo stimato:</Text>
              <Text style={styles.resultDetailValue}>{registrationResult.estimatedProcessingTime}</Text>
            </View>
            
            <View style={styles.resultDetailRow}>
              <Text style={styles.resultDetailLabel}>Tassa di registrazione:</Text>
              <Text style={styles.resultDetailValue}>€{registrationResult.registrationFee}</Text>
            </View>
          </View>
          
          <View style={styles.infoBox}>
            <AlertCircle size={20} color="#FF9500" />
            <Text style={styles.infoText}>
              La tassa di registrazione dovrà essere pagata entro 30 giorni dalla registrazione. 
              Riceverai le istruzioni per il pagamento via email.
            </Text>
          </View>
          
          <Text style={styles.resultNote}>
            Riceverai una notifica quando la registrazione sarà completata dall&apos;Agenzia delle Entrate.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <FileText size={32} color="#007AFF" />
        <Text style={styles.title}>Registrazione Agenzia delle Entrate</Text>
        <Text style={styles.subtitle}>
          Registra automaticamente il contratto di locazione
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Cosa include la registrazione:</Text>
        <Text style={styles.infoItem}>• Invio automatico all&apos;Agenzia delle Entrate</Text>
        <Text style={styles.infoItem}>• Calcolo automatico delle tasse</Text>
        <Text style={styles.infoItem}>• Tracking dello stato di registrazione</Text>
        <Text style={styles.infoItem}>• Notifiche di aggiornamento</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Dati del Proprietario</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Codice Fiscale Proprietario</Text>
          <TextInput
            style={styles.input}
            value={formData.fiscalCode}
            onChangeText={(text) => setFormData(prev => ({ ...prev, fiscalCode: text.toUpperCase() }))}
            placeholder="RSSMRA80A01H501U"
            autoCapitalize="characters"
            maxLength={16}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Indirizzo Completo Immobile</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.propertyAddress}
            onChangeText={(text) => setFormData(prev => ({ ...prev, propertyAddress: text }))}
            placeholder="Via Roma 123, 00100 Roma (RM)"
            multiline
            numberOfLines={2}
          />
        </View>

        <Text style={styles.sectionTitle}>Dati del Contratto</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Canone Mensile (€)</Text>
          <View style={styles.inputWithIcon}>
            <Euro size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputWithPadding]}
              value={formData.monthlyRent}
              onChangeText={(text) => setFormData(prev => ({ ...prev, monthlyRent: text }))}
              placeholder="1200"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>Data Inizio</Text>
            <TextInput
              style={styles.input}
              value={formData.startDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, startDate: text }))}
              placeholder="01/01/2024"
            />
          </View>
          
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>Data Fine</Text>
            <TextInput
              style={styles.input}
              value={formData.endDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, endDate: text }))}
              placeholder="31/12/2024"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Dati dell&apos;Inquilino</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Codice Fiscale Inquilino</Text>
          <TextInput
            style={styles.input}
            value={formData.tenantFiscalCode}
            onChangeText={(text) => setFormData(prev => ({ ...prev, tenantFiscalCode: text.toUpperCase() }))}
            placeholder="VRDLGI85M15F205X"
            autoCapitalize="characters"
            maxLength={16}
          />
        </View>
      </View>

      <View style={styles.warningBox}>
        <AlertCircle size={20} color="#FF9500" />
        <Text style={styles.warningText}>
          Assicurati che tutti i dati siano corretti. Una volta inviata, 
          la registrazione non potrà essere modificata.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Registrazione in corso...' : 'Registra Contratto'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  inputWithPadding: {
    paddingLeft: 40,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputHalf: {
    flex: 0.48,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#856404',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 16,
    borderRadius: 12,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  resultMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultDetails: {
    marginBottom: 20,
  },
  resultDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultDetailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  resultDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#856404',
  },
  resultNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});