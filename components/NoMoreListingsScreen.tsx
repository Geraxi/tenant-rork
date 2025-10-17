import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '../types';
import { t } from '../utils/translations';

interface NoMoreListingsScreenProps {
  currentUser: User;
  onEditPreferences: () => void;
  onEditFilters: () => void;
  onRefresh: () => void;
  onViewMatches: () => void;
  onViewProfile: () => void;
}

export default function NoMoreListingsScreen({
  currentUser,
  onEditPreferences,
  onEditFilters,
  onRefresh,
  onViewMatches,
  onViewProfile,
}: NoMoreListingsScreenProps) {
  const getEmptyStateText = () => {
    if (currentUser.userType === 'tenant') {
      return {
        title: 'Nessuna Altra Proprietà',
        subtitle: 'Hai visto tutte le proprietà disponibili che corrispondono alle tue preferenze attuali.',
        suggestion: 'Prova ad aggiustare i tuoi filtri per vedere più opzioni!',
      };
    } else if (currentUser.userType === 'homeowner') {
      return {
        title: 'Nessun Altro Inquilino',
        subtitle: 'Hai visto tutti gli inquilini disponibili che corrispondono ai tuoi criteri attuali.',
        suggestion: 'Prova ad aggiustare i requisiti per gli inquilini per vedere più profili!',
      };
    }
    return {
      title: 'Nessun Altro Annuncio',
      subtitle: 'Hai visto tutti gli annunci disponibili.',
      suggestion: 'Prova ad aggiustare le tue preferenze per vedere più opzioni!',
    };
  };

  const emptyState = getEmptyStateText();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="home-work" size={100} color="#2196F3" />
      </View>
      
      <Text style={styles.title}>{emptyState.title}</Text>
      <Text style={styles.subtitle}>{emptyState.subtitle}</Text>
      <Text style={styles.suggestion}>{emptyState.suggestion}</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={onEditPreferences}>
          <View style={styles.optionIcon}>
            <MaterialIcons name="tune" size={24} color="#2196F3" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Modifica Preferenze</Text>
            <Text style={styles.optionDescription}>
              {currentUser.userType === 'tenant' 
                ? 'Aggiusta le tue preferenze per le proprietà (budget, posizione, servizi)'
                : 'Aggiusta i requisiti per gli inquilini (reddito, età, stile di vita)'
              }
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={onEditFilters}>
          <View style={styles.optionIcon}>
            <MaterialIcons name="filter-list" size={24} color="#2196F3" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Modifica Filtri</Text>
            <Text style={styles.optionDescription}>
              {currentUser.userType === 'tenant'
                ? 'Modifica i filtri di ricerca (distanza, tipo di proprietà, caratteristiche)'
                : 'Modifica i filtri di ricerca (stato verifica, tipo di lavoro, disponibilità)'
              }
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={onRefresh}>
          <View style={styles.optionIcon}>
            <MaterialIcons name="refresh" size={24} color="#2196F3" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Aggiorna Annunci</Text>
            <Text style={styles.optionDescription}>
              Controlla se sono stati aggiunti nuovi annunci
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Azioni Rapide</Text>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={onViewMatches}>
          <MaterialIcons name="favorite" size={20} color="#FF6B6B" />
          <Text style={styles.quickActionText}>Visualizza Corrispondenze</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton} onPress={onViewProfile}>
          <MaterialIcons name="person" size={20} color="#2196F3" />
          <Text style={styles.quickActionText}>Modifica Profilo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipContainer}>
        <MaterialIcons name="lightbulb" size={20} color="#FFEAA7" />
        <Text style={styles.tipText}>
          {currentUser.userType === 'tenant'
            ? 'Suggerimento: Prova ad espandere il raggio di ricerca o ad aggiustare la fascia di budget per trovare più proprietà!'
            : 'Suggerimento: Prova ad essere più flessibile con i requisiti per gli inquilini o ad espandere l\'area di ricerca!'
          }
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 40,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F9F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  quickActions: {
    marginBottom: 30,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFEAA7',
  },
  tipText: {
    fontSize: 14,
    color: '#8B6914',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
