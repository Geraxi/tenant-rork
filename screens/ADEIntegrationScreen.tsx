import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { ADEContractData, submitContractToADE, initializeADEService } from '../utils/adeService';

interface Contract {
  id: string;
  propertyAddress: string;
  tenantName: string;
  homeownerName: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface ADEIntegrationScreenProps {
  contract: Contract;
  currentUser: any;
  onSuccess: (contractNumber: string) => void;
  onBack: () => void;
}

export const ADEIntegrationScreen: React.FC<ADEIntegrationScreenProps> = ({
  contract,
  currentUser,
  onSuccess,
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ADEContractData>>({
    contractId: contract.id,
    propertyAddress: contract.propertyAddress,
    monthlyRent: contract.monthlyRent,
    startDate: contract.startDate,
    endDate: contract.endDate,
    contractType: 'residential',
    registrationType: 'ordinary',
    registrationReason: 'first_rental',
  });

  useEffect(() => {
    initializeADEService();
  }, []);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any || {}),
        [field]: value
      }
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formData.propertyAddress && formData.monthlyRent && formData.startDate && formData.endDate);
      case 2:
        return !!(formData.landlord?.fiscalCode && formData.landlord?.name && formData.landlord?.surname);
      case 3:
        return !!(formData.tenant?.fiscalCode && formData.tenant?.name && formData.tenant?.surname);
      case 4:
        return !!(formData.propertyDetails?.cadastralCode && formData.propertyDetails?.surfaceArea);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      Alert.alert('Dati Mancanti', 'Compila tutti i campi obbligatori per continuare.');
    }
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      Alert.alert('Dati Mancanti', 'Compila tutti i campi obbligatori per inviare il contratto.');
      return;
    }

    setLoading(true);

    try {
      const response = await submitContractToADE(formData as ADEContractData);

      if (response.success) {
        Alert.alert(
          'Successo!',
          `Contratto registrato con successo all'Agenzia delle Entrate.\n\nNumero Contratto: ${response.contractNumber}\nData Registrazione: ${response.registrationDate}`,
          [
            {
              text: 'OK',
              onPress: () => onSuccess(response.contractNumber || '')
            }
          ]
        );
      } else {
        Alert.alert(
          'Errore',
          `Impossibile registrare il contratto: ${response.message}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Errore',
        'Si è verificato un errore durante la registrazione del contratto.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informazioni Base del Contratto</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Indirizzo Immobile *</Text>
        <TextInput
          style={styles.input}
          value={formData.propertyAddress}
          onChangeText={(value) => updateFormData('propertyAddress', value)}
          placeholder="Via Roma 123, Milano"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Affitto Mensile (€) *</Text>
        <TextInput
          style={styles.input}
          value={formData.monthlyRent?.toString()}
          onChangeText={(value) => updateFormData('monthlyRent', parseFloat(value) || 0)}
          keyboardType="numeric"
          placeholder="1500"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Data Inizio *</Text>
          <TextInput
            style={styles.input}
            value={formData.startDate}
            onChangeText={(value) => updateFormData('startDate', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Data Fine *</Text>
          <TextInput
            style={styles.input}
            value={formData.endDate}
            onChangeText={(value) => updateFormData('endDate', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo di Contratto</Text>
        <View style={styles.radioGroup}>
          {['residential', 'commercial', 'temporary'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.radioOption,
                formData.contractType === type && styles.radioOptionSelected
              ]}
              onPress={() => updateFormData('contractType', type)}
            >
              <Text style={[
                styles.radioText,
                formData.contractType === type && styles.radioTextSelected
              ]}>
                {type === 'residential' ? 'Residenziale' : 
                 type === 'commercial' ? 'Commerciale' : 'Temporaneo'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dati Proprietario</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Codice Fiscale *</Text>
        <TextInput
          style={styles.input}
          value={formData.landlord?.fiscalCode}
          onChangeText={(value) => updateNestedData('landlord', 'fiscalCode', value)}
          placeholder="RSSMRA80A01H501U"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={formData.landlord?.name}
            onChangeText={(value) => updateNestedData('landlord', 'name', value)}
            placeholder="Mario"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Cognome *</Text>
          <TextInput
            style={styles.input}
            value={formData.landlord?.surname}
            onChangeText={(value) => updateNestedData('landlord', 'surname', value)}
            placeholder="Rossi"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Data di Nascita</Text>
        <TextInput
          style={styles.input}
          value={formData.landlord?.birthDate}
          onChangeText={(value) => updateNestedData('landlord', 'birthDate', value)}
          placeholder="1980-01-01"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.landlord?.email}
          onChangeText={(value) => updateNestedData('landlord', 'email', value)}
          placeholder="mario.rossi@email.com"
          keyboardType="email-address"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dati Inquilino</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Codice Fiscale *</Text>
        <TextInput
          style={styles.input}
          value={formData.tenant?.fiscalCode}
          onChangeText={(value) => updateNestedData('tenant', 'fiscalCode', value)}
          placeholder="VRDLCA90B15H501X"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={formData.tenant?.name}
            onChangeText={(value) => updateNestedData('tenant', 'name', value)}
            placeholder="Luca"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Cognome *</Text>
          <TextInput
            style={styles.input}
            value={formData.tenant?.surname}
            onChangeText={(value) => updateNestedData('tenant', 'surname', value)}
            placeholder="Verdi"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Data di Nascita</Text>
        <TextInput
          style={styles.input}
          value={formData.tenant?.birthDate}
          onChangeText={(value) => updateNestedData('tenant', 'birthDate', value)}
          placeholder="1990-02-15"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.tenant?.email}
          onChangeText={(value) => updateNestedData('tenant', 'email', value)}
          placeholder="luca.verdi@email.com"
          keyboardType="email-address"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dettagli Immobile</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Codice Catastale *</Text>
        <TextInput
          style={styles.input}
          value={formData.propertyDetails?.cadastralCode}
          onChangeText={(value) => updateNestedData('propertyDetails', 'cadastralCode', value)}
          placeholder="A/1"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Superficie (m²) *</Text>
          <TextInput
            style={styles.input}
            value={formData.propertyDetails?.surfaceArea?.toString()}
            onChangeText={(value) => updateNestedData('propertyDetails', 'surfaceArea', parseFloat(value) || 0)}
            keyboardType="numeric"
            placeholder="80"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Piano</Text>
          <TextInput
            style={styles.input}
            value={formData.propertyDetails?.floor?.toString()}
            onChangeText={(value) => updateNestedData('propertyDetails', 'floor', parseInt(value) || 0)}
            keyboardType="numeric"
            placeholder="2"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Camere</Text>
          <TextInput
            style={styles.input}
            value={formData.propertyDetails?.rooms?.toString()}
            onChangeText={(value) => updateNestedData('propertyDetails', 'rooms', parseInt(value) || 0)}
            keyboardType="numeric"
            placeholder="3"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Bagni</Text>
          <TextInput
            style={styles.input}
            value={formData.propertyDetails?.bathrooms?.toString()}
            onChangeText={(value) => updateNestedData('propertyDetails', 'bathrooms', parseInt(value) || 0)}
            keyboardType="numeric"
            placeholder="1"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoria Catastale</Text>
        <TextInput
          style={styles.input}
          value={formData.propertyDetails?.category}
          onChangeText={(value) => updateNestedData('propertyDetails', 'category', value)}
          placeholder="A/1"
          autoCapitalize="characters"
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrazione ADE</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Passo {step} di 4</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {step > 1 && (
          <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
            <MaterialIcons name="arrow-back" size={20} color="#666" />
            <Text style={styles.previousButtonText}>Indietro</Text>
          </TouchableOpacity>
        )}

        {step < 4 ? (
          <TouchableOpacity
            style={[styles.nextButton, !validateStep(step) && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!validateStep(step)}
          >
            <Text style={styles.nextButtonText}>Avanti</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Registra Contratto</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  radioOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#f0f8ff',
  },
  radioText: {
    fontSize: 14,
    color: '#666',
  },
  radioTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  previousButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
