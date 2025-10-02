import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, MapPin, Euro, Edit, Trash2, Eye, EyeOff } from 'lucide-react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import { useUser } from '@/store/user-store';

interface Listing {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  rooms: number;
  bathrooms: number;
  size: number;
  propertyType: string;
  isActive: boolean;
  views: number;
  matches: number;
  createdAt: Date;
  image?: string;
}

export default function MyListingsScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  
  // Mock data for multiple listings
  const [listings, setListings] = useState<Listing[]>([
    {
      id: '1',
      title: 'Bellissimo appartamento in centro',
      address: 'Via Roma, 123',
      city: 'Milano',
      price: 1200,
      rooms: 2,
      bathrooms: 1,
      size: 80,
      propertyType: 'Appartamento',
      isActive: true,
      views: 245,
      matches: 12,
      createdAt: new Date('2024-01-15'),
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    },
    {
      id: '2',
      title: 'Monolocale moderno vicino università',
      address: 'Via Università, 45',
      city: 'Milano',
      price: 800,
      rooms: 1,
      bathrooms: 1,
      size: 45,
      propertyType: 'Monolocale',
      isActive: true,
      views: 189,
      matches: 8,
      createdAt: new Date('2024-02-01'),
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    },
    {
      id: '3',
      title: 'Stanza singola in appartamento condiviso',
      address: 'Corso Buenos Aires, 78',
      city: 'Milano',
      price: 550,
      rooms: 1,
      bathrooms: 1,
      size: 20,
      propertyType: 'Stanza',
      isActive: false,
      views: 98,
      matches: 3,
      createdAt: new Date('2024-02-10'),
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400',
    },
  ]);

  const toggleListingStatus = (id: string) => {
    setListings(prev => prev.map(listing => 
      listing.id === id ? { ...listing, isActive: !listing.isActive } : listing
    ));
  };

  const deleteListing = (id: string) => {
    Alert.alert(
      'Elimina Annuncio',
      'Sei sicuro di voler eliminare questo annuncio?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            setListings(prev => prev.filter(listing => listing.id !== id));
          },
        },
      ]
    );
  };

  const editListing = (id: string) => {
    // For now, just show an alert. Edit functionality can be added later
    Alert.alert('Modifica', 'Funzionalità di modifica in arrivo!');
  };

  if (!user || user.current_mode !== 'landlord') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorMessage}>
          Devi essere in modalità proprietario per vedere i tuoi annunci
        </Text>
      </View>
    );
  }

  const renderListing = ({ item }: { item: Listing }) => (
    <View style={styles.listingCard}>
      <View style={styles.listingHeader}>
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.listingLocation}>{item.city}</Text>
          </View>
          <View style={styles.priceRow}>
            <Euro size={14} color={Colors.primary} />
            <Text style={styles.listingPrice}>{item.price}/mese</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, item.isActive ? styles.activeText : styles.inactiveText]}>
            {item.isActive ? 'Attivo' : 'Inattivo'}
          </Text>
        </View>
      </View>
      
      <View style={styles.listingStats}>
        <View style={styles.statItem}>
          <Eye size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>{item.views} visualizzazioni</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>{item.matches} match</Text>
        </View>
      </View>
      
      <View style={styles.listingActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => toggleListingStatus(item.id)}
        >
          {item.isActive ? (
            <EyeOff size={20} color={Colors.textSecondary} />
          ) : (
            <Eye size={20} color={Colors.primary} />
          )}
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Disattiva' : 'Attiva'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => editListing(item.id)}
        >
          <Edit size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Modifica</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => deleteListing(item.id)}
        >
          <Trash2 size={20} color={Colors.error} />
          <Text style={[styles.actionButtonText, { color: Colors.error }]}>Elimina</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'I Miei Annunci',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Gestisci i tuoi annunci</Text>
          <Text style={styles.headerSubtitle}>
            Hai {listings.length} annunci pubblicati
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-listing')}
        >
          <Plus size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={listings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nessun annuncio</Text>
            <Text style={styles.emptyText}>Inizia pubblicando il tuo primo annuncio!</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/add-listing')}
            >
              <Plus size={20} color={Colors.background} />
              <Text style={styles.emptyButtonText}>Aggiungi Annuncio</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  backButton: {
    padding: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  listingCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  listingLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  listingPrice: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: Colors.success + '20',
  },
  inactiveBadge: {
    backgroundColor: Colors.textSecondary + '20',
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  activeText: {
    color: Colors.success,
  },
  inactiveText: {
    color: Colors.textSecondary,
  },
  listingStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  listingActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundSecondary,
  },
  actionButtonText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  emptyButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  errorMessage: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    margin: Spacing.lg,
  },
});