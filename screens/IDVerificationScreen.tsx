import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { t } from '../utils/translations';

interface IDVerificationScreenProps {
  onComplete: (idDocument: string, selfie: string) => void;
  onBack: () => void;
}

export default function IDVerificationScreen({ onComplete, onBack }: IDVerificationScreenProps) {
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  const handleUploadID = () => {
    Alert.alert(
      t('uploadIdDocument'),
      t('uploadIdDesc'),
      [
        {
          text: t('takePhoto'),
          onPress: () => {
            // Simulate ID document capture
            const mockID = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400';
            setIdDocument(mockID);
            Alert.alert(t('success'), t('uploadSuccess'));
          },
        },
        {
          text: t('chooseFromLibrary'),
          onPress: () => {
            const mockID = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400';
            setIdDocument(mockID);
            Alert.alert(t('success'), t('uploadSuccess'));
          },
        },
        { text: t('cancel'), style: 'cancel' },
      ]
    );
  };

  const handleTakeSelfie = () => {
    Alert.alert(
      t('takeSelfie'),
      t('takeSelfieDesc'),
      [
        {
          text: t('takePhoto'),
          onPress: () => {
            // Simulate selfie capture
            const mockSelfie = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400';
            setSelfie(mockSelfie);
            Alert.alert(t('success'), t('uploadSuccess'));
          },
        },
        { text: t('cancel'), style: 'cancel' },
      ]
    );
  };

  const handleContinue = () => {
    if (!idDocument || !selfie) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    onComplete(idDocument, selfie);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('idVerification')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBox}>
          <MaterialIcons name="security" size={48} color="#4ECDC4" />
          <Text style={styles.infoTitle}>{t('idVerificationRequired')}</Text>
          <Text style={styles.infoText}>
            Per garantire la sicurezza di tutti gli utenti, è necessario verificare la tua identità.
          </Text>
        </View>

        <View style={styles.verificationSteps}>
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, idDocument && styles.stepNumberComplete]}>
                {idDocument ? (
                  <MaterialIcons name="check" size={24} color="#fff" />
                ) : (
                  <Text style={styles.stepNumberText}>1</Text>
                )}
              </View>
              <Text style={styles.stepTitle}>{t('uploadIdDocument')}</Text>
            </View>
            <Text style={styles.stepDescription}>{t('uploadIdDesc')}</Text>
            
            {idDocument ? (
              <View style={styles.uploadedContainer}>
                <Image source={{ uri: idDocument }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleUploadID}
                >
                  <MaterialIcons name="refresh" size={20} color="#4ECDC4" />
                  <Text style={styles.retakeText}>Ricarica</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={handleUploadID}>
                <MaterialIcons name="upload-file" size={32} color="#4ECDC4" />
                <Text style={styles.uploadButtonText}>{t('uploadIdDocument')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, selfie && styles.stepNumberComplete]}>
                {selfie ? (
                  <MaterialIcons name="check" size={24} color="#fff" />
                ) : (
                  <Text style={styles.stepNumberText}>2</Text>
                )}
              </View>
              <Text style={styles.stepTitle}>{t('takeSelfie')}</Text>
            </View>
            <Text style={styles.stepDescription}>{t('takeSelfieDesc')}</Text>
            
            {selfie ? (
              <View style={styles.uploadedContainer}>
                <Image source={{ uri: selfie }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleTakeSelfie}
                >
                  <MaterialIcons name="refresh" size={20} color="#4ECDC4" />
                  <Text style={styles.retakeText}>Rifai</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={handleTakeSelfie}>
                <MaterialIcons name="camera-alt" size={32} color="#4ECDC4" />
                <Text style={styles.uploadButtonText}>{t('takeSelfie')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, (!idDocument || !selfie) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!idDocument || !selfie}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBox: {
    backgroundColor: '#E8F9F7',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  verificationSteps: {
    gap: 20,
    marginBottom: 24,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberComplete: {
    backgroundColor: '#4ECDC4',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#E8F9F7',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginTop: 8,
  },
  uploadedContainer: {
    alignItems: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  retakeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});