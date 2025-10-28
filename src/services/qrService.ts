import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface QRScanResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface BillData {
  amount: number;
  dueDate: string;
  creditor: string;
  description: string;
  category: string;
  qrData?: string;
}

class QRService {
  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  /**
   * Scan QR code from camera
   */
  async scanQRCode(): Promise<QRScanResult> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Camera permission denied',
        };
      }

      // This would typically open a camera screen
      // For now, we'll return a mock result
      return {
        success: true,
        data: 'mock_qr_data',
      };
    } catch (error) {
      console.error('QR scan error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'QR scan failed',
      };
    }
  }

  /**
   * Pick image from gallery and scan for QR code
   */
  async pickImageAndScan(): Promise<QRScanResult> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Media library permission denied',
        };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'Image picker canceled',
        };
      }

      // Here you would process the image to extract QR code
      // For now, we'll return a mock result
      return {
        success: true,
        data: 'mock_qr_data_from_image',
      };
    } catch (error) {
      console.error('Image picker error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image picker failed',
      };
    }
  }

  /**
   * Parse QR code data to extract bill information
   */
  parseQRData(qrData: string): BillData | null {
    try {
      // Parse PagoPA QR code format
      if (qrData.startsWith('PAGOPA')) {
        return this.parsePagoPAQR(qrData);
      }

      // Parse SEPA EPC QR code format
      if (qrData.startsWith('BCD')) {
        return this.parseSEPAQR(qrData);
      }

      // Generic QR code parsing
      return this.parseGenericQR(qrData);
    } catch (error) {
      console.error('Error parsing QR data:', error);
      return null;
    }
  }

  /**
   * Parse PagoPA QR code format
   */
  private parsePagoPAQR(qrData: string): BillData | null {
    try {
      // PagoPA QR code format: PAGOPA|002|12345678901|IT60X0542811101000000123456|Mario Rossi|Via Roma 1, Milano|EUR|1200.00|2024-02-01|IT1234567890123456789012345|Descrizione bolletta
      const parts = qrData.split('|');
      
      if (parts.length < 10) {
        throw new Error('Invalid PagoPA QR format');
      }

      return {
        amount: parseFloat(parts[7]) || 0,
        dueDate: parts[8] || '',
        creditor: parts[4] || '',
        description: parts[9] || 'PagoPA Payment',
        category: this.categorizeBill(parts[9] || ''),
        qrData,
      };
    } catch (error) {
      console.error('Error parsing PagoPA QR:', error);
      return null;
    }
  }

  /**
   * Parse SEPA EPC QR code format
   */
  private parseSEPAQR(qrData: string): BillData | null {
    try {
      // SEPA EPC QR code format: BCD\n002\n1\nSCT\nIT60X0542811101000000123456\nMario Rossi\nEUR1200.00\n\nDescrizione bolletta\n
      const lines = qrData.split('\n');
      
      if (lines.length < 8) {
        throw new Error('Invalid SEPA EPC QR format');
      }

      const amount = parseFloat(lines[6].replace('EUR', '')) || 0;
      const creditor = lines[5] || '';
      const description = lines[7] || 'SEPA Payment';

      return {
        amount,
        dueDate: new Date().toISOString().split('T')[0], // Default to today
        creditor,
        description,
        category: this.categorizeBill(description),
        qrData,
      };
    } catch (error) {
      console.error('Error parsing SEPA EPC QR:', error);
      return null;
    }
  }

  /**
   * Parse generic QR code
   */
  private parseGenericQR(qrData: string): BillData | null {
    try {
      // Try to extract amount from the QR data
      const amountMatch = qrData.match(/(\d+\.?\d*)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

      return {
        amount,
        dueDate: new Date().toISOString().split('T')[0],
        creditor: 'Unknown Creditor',
        description: qrData.substring(0, 50) + (qrData.length > 50 ? '...' : ''),
        category: this.categorizeBill(qrData),
        qrData,
      };
    } catch (error) {
      console.error('Error parsing generic QR:', error);
      return null;
    }
  }

  /**
   * Categorize bill based on description
   */
  private categorizeBill(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('affitto') || desc.includes('rent')) {
      return 'Affitto';
    }
    if (desc.includes('elettricità') || desc.includes('electricity') || desc.includes('energia')) {
      return 'Elettricità';
    }
    if (desc.includes('gas') || desc.includes('gas')) {
      return 'Gas';
    }
    if (desc.includes('acqua') || desc.includes('water')) {
      return 'Acqua';
    }
    if (desc.includes('condominio') || desc.includes('condo')) {
      return 'Condominio';
    }
    if (desc.includes('internet') || desc.includes('wifi')) {
      return 'Internet';
    }
    
    return 'Altro';
  }

  /**
   * Show QR scan options
   */
  async showScanOptions(): Promise<QRScanResult> {
    return new Promise((resolve) => {
      Alert.alert(
        'Scansiona Bolletta',
        'Come vuoi scansionare la bolletta?',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const result = await this.scanQRCode();
              resolve(result);
            },
          },
          {
            text: 'Galleria',
            onPress: async () => {
              const result = await this.pickImageAndScan();
              resolve(result);
            },
          },
          {
            text: 'Annulla',
            style: 'cancel',
            onPress: () => {
              resolve({
                success: false,
                error: 'Scan canceled',
              });
            },
          },
        ]
      );
    });
  }
}

export const qrService = new QRService();
