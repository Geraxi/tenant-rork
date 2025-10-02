import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { MapPin, User as UserIcon, Heart, CheckCircle } from 'lucide-react-native';
import { User } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface UserCardProps {
  user: User;
  testID?: string;
}

export default function UserCard({ user, testID }: UserCardProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const cardWidth = screenWidth - 80; // Make cards smaller with more padding
  const cardHeight = Math.min(screenHeight * 0.65, 620); // Increase height for better text display
  
  const imageHeight = cardWidth * 0.7; // Adjust aspect ratio for more content space
  const formatBudget = (min: number, max: number) => {
    return `€${min} - €${max}/mese`;
  };

  const getAgeText = (age: number) => {
    return `${age} anni`;
  };

  return (
    <View 
      style={[styles.container, { width: cardWidth, height: cardHeight }]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Profilo: ${user.full_name}, ${getAgeText(user.age)}, ${user.profession}, ${user.preferred_location}`}
    >
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        <Image 
          source={{ uri: user.profile_photos[0] }} 
          style={styles.image}
          accessibilityLabel={`Foto di ${user.full_name}`}
        />
        
        {/* Budget tag overlay */}
        <View style={styles.budgetTag}>
          <Text style={styles.budgetText}>{formatBudget(user.budget_min, user.budget_max)}</Text>
        </View>
        
        {/* Photo count indicator */}
        <View style={styles.photoCount}>
          <Text style={styles.photoCountText}>{user.profile_photos.length}</Text>
        </View>
        
        {/* Verified badge */}
        {(user as any).verified && (
          <View style={styles.verifiedBadge}>
            <CheckCircle size={16} color={Colors.textLight} />
          </View>
        )}
      </View>
      
      {/* Content section below image */}
      <View style={styles.content}>
        <Text 
          style={styles.title} 
          numberOfLines={2}
          ellipsizeMode="tail"
          accessibilityRole="header"
        >
          {user.full_name}, {getAgeText(user.age)}
        </Text>
        
        <View style={styles.location}>
          <MapPin size={14} color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.locationText}>{user.preferred_location}</Text>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <UserIcon size={14} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.detailText}>{user.profession}</Text>
          </View>
          <View style={styles.detailItem}>
            <Heart size={14} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.detailText}>{user.interests.slice(0, 2).join(', ')}</Text>
          </View>
        </View>
        
        {user.lifestyle_tags && user.lifestyle_tags.length > 0 && (
          <View style={styles.amenities}>
            {user.lifestyle_tags.slice(0, 3).map((tag, index) => (
              <View key={`${user.id}-tag-${index}`} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{tag}</Text>
              </View>
            ))}
            {user.lifestyle_tags.length > 3 && (
              <View style={styles.moreTag}>
                <Text style={styles.moreText}>+{user.lifestyle_tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Description */}
        <Text 
          style={styles.description} 
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {user.bio}
        </Text>
        
        {/* Footer with availability */}
        <View style={styles.footer}>
          <View style={styles.propertyTypeContainer}>
            <Text style={styles.propertyTypeText}>
              {(user as any).looking_for_roommate ? 'Cerca coinquilino' : 'Cerca casa'}
            </Text>
          </View>
          
          <View style={styles.availability}>
            <View style={[styles.availabilityDot, { 
              backgroundColor: (user as any).active !== false ? Colors.success : Colors.error 
            }]} />
            <Text style={styles.availabilityText}>
              {(user as any).active !== false ? 'Attivo' : 'Non attivo'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    backgroundColor: '#2563eb', // Blue background
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  budgetTag: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  budgetText: {
    ...Typography.body,
    color: Colors.textLight,
    fontWeight: '700',
  },
  photoCount: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    minWidth: 24,
    alignItems: 'center',
  },
  photoCountText: {
    ...Typography.small,
    color: Colors.textLight,
    fontWeight: '600',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.success,
    padding: 4,
    borderRadius: 12,
  },
  content: {
    padding: Spacing.lg,
    backgroundColor: '#2563eb', // Blue background
    flex: 1,
    minHeight: 200, // Ensure minimum content height
  },
  title: {
    ...Typography.h3,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationText: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
    flex: 1,
    flexWrap: 'wrap',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  detailText: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    flex: 1,
    flexShrink: 1,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  amenityTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  amenityText: {
    ...Typography.small,
    color: Colors.textLight,
    fontSize: 11,
  },
  moreTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    minWidth: 24,
    alignItems: 'center',
  },
  moreText: {
    ...Typography.small,
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 11,
  },
  description: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20, // Optimized line height
    marginBottom: Spacing.sm,
    fontSize: 14,
    flexWrap: 'wrap',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  propertyTypeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  propertyTypeText: {
    ...Typography.small,
    color: Colors.textLight,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  availabilityText: {
    ...Typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});