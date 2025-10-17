import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Property, Utente } from '../types';
import { MatchingService, Match } from '../src/services/matchingService';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';

interface MatchesScreenProps {
  onNavigateBack: () => void;
}

interface MatchWithDetails {
  match: Match;
  tenant: Utente;
  landlord: Utente;
  property: Property;
}

export default function MatchesScreen({ onNavigateBack }: MatchesScreenProps) {
  const { user } = useSupabaseAuth();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (user) {
      setLoading(true);
      console.log('🔍 MatchesScreen - Loading matches for user:', user.id, 'role:', user.ruolo);
      try {
        const userMatches = await MatchingService.getMatches(user.id, user.ruolo);
        console.log('🔍 MatchesScreen - Found matches:', userMatches.length);
        
        // If no matches found, show some sample matches for demo purposes
        if (userMatches.length === 0) {
          console.log('🔍 MatchesScreen - No matches found, showing sample matches');
          const sampleMatches = await MatchingService.getMatches('test_user_1', 'tenant');
          console.log('🔍 MatchesScreen - Sample matches:', sampleMatches.length);
          
          const sampleMatchesWithDetails = await Promise.all(
            sampleMatches.map(async (match) => {
              console.log('🔍 MatchesScreen - Getting details for sample match:', match.id);
              const details = await MatchingService.getMatchDetails(match.id);
              console.log('🔍 MatchesScreen - Sample match details:', details);
              return details;
            })
          );
          
          const validSampleMatches = sampleMatchesWithDetails.filter(Boolean) as MatchWithDetails[];
          console.log('🔍 MatchesScreen - Valid sample matches:', validSampleMatches.length);
          setMatches(validSampleMatches);
        } else {
          // Get detailed information for each match
          const matchesWithDetails = await Promise.all(
            userMatches.map(async (match) => {
              console.log('🔍 MatchesScreen - Getting details for match:', match.id);
              const details = await MatchingService.getMatchDetails(match.id);
              console.log('🔍 MatchesScreen - Match details:', details);
              return details;
            })
          );
          
          const validMatches = matchesWithDetails.filter(Boolean) as MatchWithDetails[];
          console.log('🔍 MatchesScreen - Valid matches:', validMatches.length);
          setMatches(validMatches);
        }
      } catch (error) {
        console.error('Error loading matches:', error);
        Alert.alert('Errore', 'Impossibile caricare i match');
      } finally {
        setLoading(false);
      }
    } else {
      console.log('🔍 MatchesScreen - No user found');
      setLoading(false);
    }
  };

  const handleContactMatch = (match: MatchWithDetails) => {
    const otherPerson = user?.ruolo === 'tenant' ? match.landlord : match.tenant;
    Alert.alert(
      'Contatta',
      `Vuoi contattare ${otherPerson.nome}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Invia Messaggio', 
          onPress: () => {
            // TODO: Implement messaging functionality
            Alert.alert('Info', 'Funzionalità di messaggistica in arrivo!');
          }
        },
      ]
    );
  };

  const handleRemoveMatch = async (matchId: string) => {
    Alert.alert(
      'Rimuovi Match',
      'Sei sicuro di voler rimuovere questo match?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Rimuovi', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await MatchingService.rejectMatch(matchId);
              if (success) {
                setMatches(prev => prev.filter(m => m.match.id !== matchId));
                Alert.alert('Successo', 'Match rimosso con successo');
              } else {
                Alert.alert('Errore', 'Impossibile rimuovere il match');
              }
            } catch (error) {
              console.error('Error removing match:', error);
              Alert.alert('Errore', 'Si è verificato un errore');
            }
          }
        },
      ]
    );
  };

  const renderMatch = ({ item }: { item: MatchWithDetails }) => {
    const otherPerson = user?.ruolo === 'tenant' ? item.landlord : item.tenant;
    const property = item.property;

    return (
      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <View style={styles.personInfo}>
            <Image 
              source={{ uri: otherPerson.foto || 'https://via.placeholder.com/50' }} 
              style={styles.personAvatar} 
            />
            <View style={styles.personDetails}>
              <Text style={styles.personName}>{otherPerson.nome}</Text>
              <Text style={styles.matchDate}>
                Match del {new Date(item.match.created_at).toLocaleDateString('it-IT')}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveMatch(item.match.id)}
          >
            <MaterialIcons name="close" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.propertySection}>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <View style={styles.propertyLocation}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.locationText}>{property.location}</Text>
          </View>
          <Text style={styles.propertyDescription} numberOfLines={2}>
            {property.description}
          </Text>
          
          <View style={styles.propertyDetails}>
            <View style={styles.detailItem}>
              <MaterialIcons name="bed" size={16} color="#4A90E2" />
              <Text style={styles.detailText}>{property.bedrooms} camere</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="bathtub" size={16} color="#4A90E2" />
              <Text style={styles.detailText}>{property.bathrooms} bagni</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="square-foot" size={16} color="#4A90E2" />
              <Text style={styles.detailText}>{property.squareMeters}m²</Text>
            </View>
          </View>
          
          <View style={styles.rentInfo}>
            <Text style={styles.rentAmount}>€{property.rent}/mese</Text>
          </View>
        </View>

        <View style={styles.matchActions}>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => handleContactMatch(item)}
          >
            <MaterialIcons name="message" size={20} color="white" />
            <Text style={styles.contactButtonText}>Contatta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Caricamento match...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>I Tuoi Match</Text>
        <View style={styles.placeholder} />
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="favorite-border" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Nessun match ancora</Text>
          <Text style={styles.emptyDescription}>
            Continua a fare swipe per trovare la tua casa perfetta!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.match.id}
          contentContainerStyle={styles.matchesList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  matchesList: {
    padding: 20,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  matchDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  propertySection: {
    marginBottom: 15,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  propertyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  rentInfo: {
    alignItems: 'flex-end',
  },
  rentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});