import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { qrService } from '../src/services/qrService';

const { width, height } = Dimensions.get('window');

interface QRScannerScreenProps {
  onNavigateBack: () => void;
  onQRScanned: (data: string) => void;
}

export default function QRScannerScreen({ onNavigateBack, onQRScanned }: QRScannerScreenProps) {
  const [scanned, setScanned] = useState(false);

  const handleQRData = (data: string) => {
    if (scanned) return;
    
    setScanned(true);
    console.log('QR Code data:', data);
    
    // Parse the QR data
    const billData = qrService.parseQRData(data);
    
    if (billData) {
      Alert.alert(
        'QR Code Scansionato!',
        `Importo: €${billData.amount}\nCreditor: ${billData.creditor}\nCategoria: ${billData.category}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onQRScanned(data);
              onNavigateBack();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'QR Code Non Riconosciuto',
        'Il QR code inserito non contiene informazioni di bolletta valide.',
        [
          {
            text: 'Riprova',
            onPress: () => setScanned(false),
          },
          {
            text: 'Annulla',
            onPress: onNavigateBack,
          },
        ]
      );
    }
  };

  const handleManualQRInput = () => {
    Alert.prompt(
      'Inserisci QR Code',
      'Incolla o digita il contenuto del QR code della bolletta:',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Scansiona',
          onPress: (qrData) => {
            if (qrData && qrData.trim()) {
              handleQRData(qrData.trim());
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleTestQR = () => {
    // Test with a sample PagoPA QR code
    const testQRData = 'PAGOPA|002|12345678901|IT60X0542811101000000123456|Mario Rossi|Via Roma 1, Milano|EUR|120.00|2024-02-01|IT1234567890123456789012345|Bolletta Elettricità';
    handleQRData(testQRData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onNavigateBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scansiona QR Code</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="qr-code-scanner" size={120} color="#2196F3" />
        </View>
        
        <Text style={styles.title}>Scansiona QR Code Bolletta</Text>
        <Text style={styles.subtitle}>
          Inserisci manualmente il contenuto del QR code della bolletta per aggiungerla automaticamente.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleManualQRInput}>
            <MaterialIcons name="edit" size={24} color="white" />
            <Text style={styles.buttonText}>Inserisci QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleTestQR}>
            <MaterialIcons name="science" size={24} color="#2196F3" />
            <Text style={styles.secondaryButtonText}>Test con QR di Prova</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Formati Supportati:</Text>
          <Text style={styles.infoText}>• PagoPA QR Code</Text>
          <Text style={styles.infoText}>• SEPA EPC QR Code</Text>
          <Text style={styles.infoText}>• QR Code generici</Text>
        </View>
      </View>

      {scanned && (
        <View style={styles.scannedOverlay}>
          <Text style={styles.scannedText}>QR Code processato!</Text>
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scannedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
