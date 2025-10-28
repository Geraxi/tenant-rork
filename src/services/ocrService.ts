import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface OCRResult {
  success: boolean;
  text?: string;
  error?: string;
}

export interface BillData {
  amount: number;
  dueDate: string;
  creditor: string;
  description: string;
  category: string;
  rawText?: string;
}

class OCRService {
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
   * Pick image from gallery and extract text
   */
  async pickImageAndExtractText(): Promise<OCRResult> {
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

      // Here you would use an OCR library to extract text from the image
      // For now, we'll return mock data
      const mockText = `
        FATTURA N. 123456
        Data: 15/01/2024
        Scadenza: 15/02/2024
        
        Fornitore: Enel Energia S.p.A.
        Via Roma 123, 00100 Roma
        
        Importo: € 85.50
        IVA: € 18.76
        Totale: € 104.26
        
        Descrizione: Fornitura energia elettrica
        Periodo: Dicembre 2023
      `;

      return {
        success: true,
        text: mockText,
      };
    } catch (error) {
      console.error('OCR error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OCR failed',
      };
    }
  }

  /**
   * Extract text from image URI
   */
  async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    try {
      // Here you would use an OCR library like react-native-text-detector
      // For now, we'll return mock data
      const mockText = `
        FATTURA N. 123456
        Data: 15/01/2024
        Scadenza: 15/02/2024
        
        Fornitore: Enel Energia S.p.A.
        Via Roma 123, 00100 Roma
        
        Importo: € 85.50
        IVA: € 18.76
        Totale: € 104.26
        
        Descrizione: Fornitura energia elettrica
        Periodo: Dicembre 2023
      `;

      return {
        success: true,
        text: mockText,
      };
    } catch (error) {
      console.error('OCR error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OCR failed',
      };
    }
  }

  /**
   * Parse extracted text to extract bill information
   */
  parseBillText(text: string): BillData | null {
    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let amount = 0;
      let dueDate = '';
      let creditor = '';
      let description = '';
      let category = 'Altro';

      // Extract amount
      const amountMatch = text.match(/€\s*(\d+[.,]\d{2})/);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(',', '.'));
      }

      // Extract due date
      const dateMatch = text.match(/scadenza[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
      if (dateMatch) {
        dueDate = this.formatDate(dateMatch[1]);
      }

      // Extract creditor
      const creditorMatch = text.match(/fornitore[:\s]*([^\n]+)/i);
      if (creditorMatch) {
        creditor = creditorMatch[1].trim();
      }

      // Extract description
      const descMatch = text.match(/descrizione[:\s]*([^\n]+)/i);
      if (descMatch) {
        description = descMatch[1].trim();
      }

      // Categorize based on text content
      category = this.categorizeBill(text);

      return {
        amount,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        creditor: creditor || 'Unknown Creditor',
        description: description || 'Bill Payment',
        category,
        rawText: text,
      };
    } catch (error) {
      console.error('Error parsing bill text:', error);
      return null;
    }
  }

  /**
   * Format date string to ISO format
   */
  private formatDate(dateStr: string): string {
    try {
      // Handle different date formats
      const formats = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, // DD/MM/YYYY or DD-MM-YYYY
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/, // DD/MM/YY or DD-MM-YY
      ];

      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          let [, day, month, year] = match;
          
          // Convert 2-digit year to 4-digit
          if (year.length === 2) {
            year = '20' + year;
          }
          
          // Ensure day and month are 2 digits
          day = day.padStart(2, '0');
          month = month.padStart(2, '0');
          
          return `${year}-${month}-${day}`;
        }
      }

      return new Date().toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Categorize bill based on text content
   */
  private categorizeBill(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('affitto') || lowerText.includes('rent')) {
      return 'Affitto';
    }
    if (lowerText.includes('elettricità') || lowerText.includes('electricity') || lowerText.includes('energia') || lowerText.includes('enel')) {
      return 'Elettricità';
    }
    if (lowerText.includes('gas') || lowerText.includes('gas')) {
      return 'Gas';
    }
    if (lowerText.includes('acqua') || lowerText.includes('water') || lowerText.includes('acquedotto')) {
      return 'Acqua';
    }
    if (lowerText.includes('condominio') || lowerText.includes('condo')) {
      return 'Condominio';
    }
    if (lowerText.includes('internet') || lowerText.includes('wifi') || lowerText.includes('telecom')) {
      return 'Internet';
    }
    
    return 'Altro';
  }

  /**
   * Show OCR options
   */
  async showOCROptions(): Promise<OCRResult> {
    return new Promise((resolve) => {
      Alert.alert(
        'Estrai Testo da Bolletta',
        'Seleziona un\'immagine per estrarre il testo della bolletta',
        [
          {
            text: 'Galleria',
            onPress: async () => {
              const result = await this.pickImageAndExtractText();
              resolve(result);
            },
          },
          {
            text: 'Annulla',
            style: 'cancel',
            onPress: () => {
              resolve({
                success: false,
                error: 'OCR canceled',
              });
            },
          },
        ]
      );
    });
  }
}

export const ocrService = new OCRService();
