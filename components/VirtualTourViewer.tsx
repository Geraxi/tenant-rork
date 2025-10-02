import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Maximize2, ExternalLink, Eye } from 'lucide-react-native';

interface VirtualTourViewerProps {
  tourUrl: string;
  tourType: 'matterport' | 'kuula' | 'custom_360';
  title: string;
  description?: string;
  onFullscreen?: () => void;
}

export default function VirtualTourViewer({
  tourUrl,
  tourType,
  title,
  description,
  onFullscreen,
}: VirtualTourViewerProps) {
  const [isLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleFullscreen = () => {
    if (onFullscreen) {
      onFullscreen();
    } else {
      if (Platform.OS === 'web') {
        window.open(tourUrl, '_blank');
      } else {
        console.log('Open external browser for mobile');
      }
    }
  };



  const renderTourIcon = () => {
    switch (tourType) {
      case 'matterport':
        return (
          <View style={styles.tourTypeIcon}>
            <Text style={styles.tourTypeText}>M</Text>
          </View>
        );
      case 'kuula':
        return (
          <View style={styles.tourTypeIcon}>
            <Text style={styles.tourTypeText}>K</Text>
          </View>
        );
      default:
        return <Eye size={16} color="#666" />;
    }
  };

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Errore nel caricamento del tour</Text>
        <Text style={styles.errorMessage}>
          Non è possibile caricare il tour virtuale. Verifica la connessione internet.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setHasError(false)}>
          <Text style={styles.retryButtonText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {renderTourIcon()}
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.fullscreenButton} onPress={handleFullscreen}>
          <Maximize2 size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tourContainer}>
        {Platform.OS === 'web' ? (
          <View style={styles.webContainer}>
            <Text style={styles.webPlaceholder}>
              Tour virtuale disponibile - Clicca &quot;Visualizza a schermo intero&quot; per aprire
            </Text>
          </View>
        ) : (
          <View style={styles.mobilePlaceholder}>
            <Text style={styles.mobilePlaceholderText}>
              Tour virtuale 360°
            </Text>
            <Text style={styles.mobilePlaceholderSubtext}>
              Tocca per aprire il tour completo
            </Text>
          </View>
        )}
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Caricamento tour virtuale...</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.externalLinkButton} onPress={handleFullscreen}>
          <ExternalLink size={16} color="#007AFF" />
          <Text style={styles.externalLinkText}>Visualizza a schermo intero</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tourTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tourTypeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  fullscreenButton: {
    padding: 8,
  },
  tourContainer: {
    height: 300,
    position: 'relative',
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  webPlaceholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mobilePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  mobilePlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  mobilePlaceholderSubtext: {
    fontSize: 14,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  externalLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  externalLinkText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});