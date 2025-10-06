import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

interface BackgroundCheckFormProps {
  userId: string;
  onComplete?: (result: any) => void;
}

export default function BackgroundCheckForm({ userId, onComplete }: BackgroundCheckFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    consentGiven: false,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<any>(null);

  const requestBackgroundCheck = trpc.backgroundCheck.request.useMutation({
    onSuccess: (data) => {
      setCheckResult(data);
      setIsSubmitting(false);
      if (onComplete) {
        onComplete(data);
      }
    },
    onError: (error) => {
      console.error('Background check error:', error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!formData.consentGiven) {
      return;
    }

    setIsSubmitting(true);
    requestBackgroundCheck.mutate({
      userId,
      ...formData,
    });
  };

  const renderConsentSection = () => (
    <View style={styles.consentSection}>
      <View style={styles.consentHeader}>
        <Shield size={24} color="#007AFF" />
        <Text style={styles.consentTitle}>Consenso per Background Check</Text>
      </View>
      
      <Text style={styles.consentText}>
        Autorizzando questo background check, acconsenti alla verifica di:
      </Text>
      
      <View style={styles.consentList}>
        <Text style={styles.consentItem}>• Precedenti penali</Text>
        <Text style={styles.consentItem}>• Storia creditizia</Text>
        <Text style={styles.consentItem}>• Verifica dell&apos;impiego</Text>
        <Text style={styles.consentItem}>• Storia degli affitti precedenti</Text>
      </View>
      
      <View style={styles.privacyNoteBox}>
        <Shield size={16} color="#007AFF" />
        <View style={styles.privacyNoteContent}>
          <Text style={styles.privacyNote}>
            I tuoi dati saranno trattati in conformità al GDPR e utilizzati esclusivamente per la verifica dell&apos;identità. Non verranno mai condivisi senza il tuo consenso esplicito.
          </Text>
          <TouchableOpacity
            onPress={() => {
              console.log('Navigate to privacy policy');
            }}
            style={styles.privacyLink}
          >
            <Text style={styles.privacyLinkText}>Leggi la Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.consentButton,
          formData.consentGiven ? styles.consentButtonActive : styles.consentButtonInactive
        ]}
        onPress={() => setFormData(prev => ({ ...prev, consentGiven: !prev.consentGiven }))}
      >
        <View style={styles.consentCheckbox}>
          {formData.consentGiven && <CheckCircle size={20} color="#007AFF" />}
        </View>
        <Text style={styles.consentButtonText}>
          Acconsento al background check
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={24} color="#FF9500" />;
      case 'complete':
        return <CheckCircle size={24} color="#34C759" />;
      case 'failed':
        return <XCircle size={24} color="#FF3B30" />;
      default:
        return <AlertTriangle size={24} color="#666" />;
    }
  };

  if (checkResult) {
    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          {renderStatusIcon(checkResult.status)}
          <Text style={styles.resultTitle}>Background Check Avviato</Text>
        </View>
        
        <Text style={styles.resultMessage}>{checkResult.message}</Text>
        
        <View style={styles.resultDetails}>
          <Text style={styles.resultDetailLabel}>ID Verifica:</Text>
          <Text style={styles.resultDetailValue}>{checkResult.checkId}</Text>
        </View>
        
        <View style={styles.resultDetails}>
          <Text style={styles.resultDetailLabel}>Tempo stimato:</Text>
          <Text style={styles.resultDetailValue}>{checkResult.estimatedCompletionTime}</Text>
        </View>
        
        <Text style={styles.resultNote}>
          Riceverai una notifica quando il background check sarà completato.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Shield size={32} color="#007AFF" />
        <Text style={styles.title}>Background Check</Text>
        <Text style={styles.subtitle}>
          Verifica la tua affidabilità per i proprietari
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nome</Text>
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
            placeholder="Inserisci il tuo nome"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cognome</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
            placeholder="Inserisci il tuo cognome"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Data di Nascita</Text>
          <TextInput
            style={styles.input}
            value={formData.dateOfBirth}
            onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))}
            placeholder="DD/MM/YYYY"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Indirizzo Completo</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            placeholder="Via, Città, CAP"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {renderConsentSection()}

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!formData.consentGiven || isSubmitting) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={!formData.consentGiven || isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Invio in corso...' : 'Avvia Background Check'}
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
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
    height: 80,
    textAlignVertical: 'top',
  },
  consentSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  consentText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  consentList: {
    marginBottom: 16,
  },
  consentItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  privacyNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  privacyNoteContent: {
    flex: 1,
  },
  privacyNote: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  privacyLink: {
    marginTop: 4,
  },
  privacyLinkText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  consentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  consentButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  consentButtonInactive: {
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  consentCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consentButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  resultMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  resultDetailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resultDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  resultNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});