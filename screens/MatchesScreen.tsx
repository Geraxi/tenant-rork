import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '../types';

interface Match {
  id: string;
  user: User;
  lastMessage?: string;
  timestamp?: number;
}

const mockMatches: Match[] = [
  {
    id: '1',
    user: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      userType: 'homeowner',
      age: 32,
      bio: 'Renting out a cozy 2BR apartment',
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'],
      location: 'Downtown, Seattle',
      verified: 'verified',
      idVerified: true,
      backgroundCheckPassed: true,
      preferences: { rent: 1800 },
      createdAt: Date.now(),
    },
    lastMessage: 'Hi! When would you like to schedule a viewing?',
    timestamp: Date.now() - 3600000,
  },
];

interface MatchesScreenProps {
  onBack: () => void;
  onSelectMatch: (match: Match) => void;
}

export default function MatchesScreen({ onBack, onSelectMatch }: MatchesScreenProps) {
  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity 
      style={styles.matchCard}
      onPress={() => onSelectMatch(item)}
    >
      <Image source={{ uri: item.user.photos[0] }} style={styles.avatar} />
      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>{item.user.name}</Text>
          {item.user.verified === 'verified' && (
            <MaterialIcons name="verified" size={16} color="#4CAF50" />
          )}
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || 'Start a conversation'}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Matches</Text>
        <View style={{ width: 28 }} />
      </View>

      {mockMatches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>
            Keep swiping to find your perfect match!
          </Text>
        </View>
      ) : (
        <FlatList
          data={mockMatches}
          renderItem={renderMatch}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});