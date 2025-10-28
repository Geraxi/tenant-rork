import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  Image, 
  StyleSheet,
  Alert,
  SafeAreaView 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase, Bill, classifyTaxType } from '../lib/supabase';

interface ScanBillButtonProps {
  onBillCreated: (bill: Bill) => void;
  userId: string;
}

export default function ScanBillButton({ onBillCreated, userId }: ScanBillButtonProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [open, setOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snapshotUri, setSnapshotUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!permission) {
    return (
      <TouchableOpacity onPress={requestPermission} style={styles.button}>
        <MaterialIcons name="camera-alt" size={20} color="white" />
        <Text style={styles.buttonText}>Abilita Fotocamera</Text>
      </TouchableOpacity>
    );
  }

  const parsePagoPAQR = (qrData: string) => {
    try {
      // PagoPA QR format: PAGOPA|002|IUV|ENTE|IMPORTO|CAUSALE|SCADENZA
      const parts = qrData.split('|');
      if (parts.length >= 7 && parts[0] === 'PAGOPA') {
        return {
          iuv: parts[2],
          ente: parts[3],
          amount: parseFloat(parts[4]),
          causale: parts[5],
          dueDate: parts[6] ? new Date(parts[6]).toISOString().split('T')[0] : null
        };
      }
    } catch (error) {
      console.log('Error parsing PagoPA QR:', error);
    }
    return null;
  };

  const parseSepaEpcQR = (qrData: string) => {
    try {
      // SEPA EPC QR format (BCD format)
      const lines = qrData.split('\n');
      if (lines[0] === 'BCD') {
        const amountLine = lines.find(line => line.startsWith('EUR'));
        const amount = amountLine ? parseFloat(amountLine.replace('EUR', '')) : null;
        
        return {
          ente: lines[5] || 'Unknown',
          amount,
          causale: lines[7] || '',
          dueDate: null
        };
      }
    } catch (error) {
      console.log('Error parsing SEPA EPC QR:', error);
    }
    return null;
  };

  const onBarCodeScanned = async ({ data }: any) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    
    try {
      let parsedData = null;
      
      // Try PagoPA format first
      if (data.includes('PAGOPA')) {
        parsedData = parsePagoPAQR(data);
      } else if (data.includes('BCD')) {
        parsedData = parseSepaEpcQR(data);
      }
      
      if (parsedData && parsedData.amount && parsedData.ente) {
        const taxType = classifyTaxType(parsedData.ente, parsedData.causale || '');
        
        const billData = {
          user_id: userId,
          tax_type: taxType,
          provider_name: parsedData.ente,
          amount: parsedData.amount,
          due_date: parsedData.dueDate,
          status: 'pending' as const,
          qr_raw: data,
          meta: {
            ente: parsedData.ente,
            iuv: parsedData.iuv,
            causale: parsedData.causale,
            source: 'QR' as const,
            parsed_at: new Date().toISOString()
          }
        };
        
        const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/parse-bill`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}` 
          },
          body: JSON.stringify({ billData, userId })
        });
        
        const json = await response.json();
        
        if (json?.bill) {
          onBillCreated(json.bill);
          setOpen(false);
          Alert.alert('Successo', `Bolletta ${taxType} aggiunta con successo!`);
        } else {
          setScanned(false);
          Alert.alert('Errore', 'Impossibile creare la bolletta. Riprova con la fotocamera.');
        }
      } else {
        setScanned(false);
        Alert.alert('QR non valido', 'QR code non riconosciuto. Prova a scattare una foto per l\'OCR.');
      }
    } catch (error: any) {
      setScanned(false);
      Alert.alert('Errore', error.message || 'Errore durante l\'elaborazione del QR');
    } finally {
      setLoading(false);
    }
  };

  const captureAndUpload = async () => {
    if (!snapshotUri) {
      Alert.alert('Errore', 'Nessuna foto selezionata. Scatta prima una foto.');
      return;
    }

    try {
      setUploading(true);
      const base64 = await FileSystem.readAsStringAsync(snapshotUri, { 
        encoding: FileSystem.EncodingType.Base64 
      });
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/parse-bill`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}` 
        },
        body: JSON.stringify({ imageBase64: base64, userId })
      });
      
      const json = await response.json();
      
      if (json?.bill) {
        onBillCreated(json.bill);
        setOpen(false);
        Alert.alert('Successo', 'Bolletta processata e aggiunta con successo!');
      } else {
        Alert.alert('Errore', 'OCR non riuscito a leggere la bolletta. Riprova con una foto più nitida.');
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante l\'elaborazione dell\'immagine');
    } finally {
      setUploading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setSnapshotUri(null);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(true)} style={styles.button}>
        <MaterialIcons name="qr-code-scanner" size={18} color="white" />
        <Text style={styles.buttonText} numberOfLines={1}>Scansiona</Text>
      </TouchableOpacity>

      <Modal visible={open} onRequestClose={() => setOpen(false)} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scansiona Bolletta</Text>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.cameraContainer}>
            {permission.granted ? (
              <CameraView
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={onBarCodeScanned}
              />
            ) : (
              <View style={styles.permissionContainer}>
                <MaterialIcons name="camera-alt" size={64} color="#ccc" />
                <Text style={styles.permissionText}>Permesso fotocamera richiesto</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                  <Text style={styles.permissionButtonText}>Concedi Permesso</Text>
                </TouchableOpacity>
              </View>
            )}

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Elaborazione QR code...</Text>
              </View>
            )}
          </View>

          {snapshotUri && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: snapshotUri }} style={styles.previewImage} />
              <TouchableOpacity onPress={() => setSnapshotUri(null)} style={styles.removeImageButton}>
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity 
              onPress={captureAndUpload} 
              style={[styles.actionButton, uploading && styles.actionButtonDisabled]}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialIcons name="upload" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Carica Foto per OCR</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={resetScanner} style={styles.secondaryButton}>
              <MaterialIcons name="refresh" size={20} color="#2196F3" />
              <Text style={styles.secondaryButtonText}>Ripristina Scanner</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setOpen(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 16,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  imagePreview: {
    position: 'relative',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActions: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
