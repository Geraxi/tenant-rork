import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import { useUser } from '@/store/user-store';
import { mockMatches } from '@/mocks/matches';
import { mockProperties } from '@/mocks/properties';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';

export default function MatchesScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  if (!user) {
    return (
      <View
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <Text style={[styles.message, { color: Colors.text }]}>Effettua l&apos;accesso per vedere i match</Text>
      </View>
    );
  }

  const renderMatch = ({ item }: { item: any }) => {
    const property = mockProperties.find(p => p.id === item.property_id);
    
    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => console.log('Open chat:', item.id)}
      >
        <Image
          source={{ uri: property?.photos[0] }}
          style={styles.matchImage}
        />
        <View style={styles.matchContent}>
          <Text style={styles.matchTitle}>{property?.title}</Text>
          <Text style={styles.matchLocation}>{property?.location}</Text>
          <View style={styles.compatibilityContainer}>
            <Heart size={16} color={Colors.primary} />
            <Text style={styles.compatibilityText}>
              {item.compatibility_score}% compatibile
            </Text>
          </View>
        </View>
        <View style={styles.matchStatus}>
          <View style={[
            styles.statusDot,
            { backgroundColor: item.status === 'chatting' ? Colors.success : Colors.primary }
          ]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Stack.Screen options={{ title: 'I tuoi Match' }} />
      
      {mockMatches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Nessun match ancora</Text>
          <Text style={styles.emptyText}>
            Inizia a sfogliare gli immobili per trovare il tuo match perfetto!
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/browse')}
          >
            <Text style={styles.browseButtonText}>Inizia a sfogliare</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={mockMatches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    padding: Spacing.md,
  },
  matchCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  matchContent: {
    flex: 1,
    padding: Spacing.md,
  },
  matchTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  matchLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  compatibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  compatibilityText: {
    ...Typography.small,
    color: Colors.text,
    fontWeight: '600',
  },
  matchStatus: {
    justifyContent: 'center',
    paddingRight: Spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  browseButtonText: {
    ...Typography.body,
    color: Colors.textLight,
    fontWeight: '600',
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.text,
    margin: Spacing.lg,
  },
});