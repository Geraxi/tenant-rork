import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { X, MapPin, Home, Bed, Bath, Square, Heart, MessageCircle } from 'lucide-react-native';
import { mockProperties } from '@/mocks/properties';
import { mockTenants, mockRoommates } from '@/mocks/users';
import type { Property, User } from '@/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CardDetailScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: 'property' | 'user' }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);

  const allUsers = [...mockTenants, ...mockRoommates];
  const item = type === 'property' 
    ? mockProperties.find((p: Property) => p.id === id) as Property | undefined
    : allUsers.find((u: User) => u.id === id) as User | undefined;

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Item not found</Text>
      </SafeAreaView>
    );
  }

  const images: string[] = 'photos' in item ? ((item as Property).photos || []) : ((item as User).profile_photos || []);

  const renderImageIndicators = () => (
    <View style={styles.indicatorContainer}>
      {images.map((_: string, index: number) => (
        <View
          key={index}
          style={[
            styles.indicator,
            index === currentImageIndex && styles.activeIndicator,
          ]}
        />
      ))}
    </View>
  );

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / screenWidth);
    setCurrentImageIndex(index);
  };

  const renderPropertyDetails = (property: Property) => (
    <>
      <View style={styles.propertyInfo}>
        <Text style={styles.price}>€{property.rent}/mese</Text>
        <View style={styles.locationRow}>
          <MapPin size={16} color="#666" />
          <Text style={styles.location}>{property.location}</Text>
        </View>
      </View>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Home size={20} color="#666" />
          <Text style={styles.featureText}>{property.property_type}</Text>
        </View>
        <View style={styles.feature}>
          <Bed size={20} color="#666" />
          <Text style={styles.featureText}>{property.bedrooms} camere</Text>
        </View>
        <View style={styles.feature}>
          <Bath size={20} color="#666" />
          <Text style={styles.featureText}>{property.bathrooms} bagni</Text>
        </View>
        <View style={styles.feature}>
          <Square size={20} color="#666" />
          <Text style={styles.featureText}>Monolocale</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descrizione</Text>
        <Text style={styles.description}>{property.description}</Text>
      </View>

      {property.amenities && property.amenities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servizi</Text>
          <View style={styles.amenities}>
            {property.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );

  const renderUserDetails = (user: User) => (
    <>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.full_name}, {user.age}</Text>
        <View style={styles.locationRow}>
          <MapPin size={16} color="#666" />
          <Text style={styles.location}>{user.preferred_location}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.description}>{user.bio}</Text>
      </View>

      {user.interests && user.interests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interessi</Text>
          <View style={styles.amenities}>
            {user.interests.map((interest, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferenze abitative</Text>
        <View style={styles.preferences}>
          <Text style={styles.preferenceItem}>Budget: €{user.budget_min} - €{user.budget_max}/mese</Text>
          <Text style={styles.preferenceItem}>Zona preferita: {user.preferred_location}</Text>
          {user.wants_roommate && <Text style={styles.preferenceItem}>Cerca coinquilino</Text>}
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.imageContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item: image }) => (
              <Image source={{ uri: image }} style={styles.image} />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          {renderImageIndicators()}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {type === 'property' ? renderPropertyDetails(item as Property) : renderUserDetails(item as User)}
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => router.back()}
        >
          <X size={28} color="#FF4458" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => console.log('Message')}
        >
          <MessageCircle size={24} color="#44D884" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton, isLiked && styles.likedButton]}
          onPress={() => setIsLiked(!isLiked)}
        >
          <Heart size={28} color={isLiked ? "#fff" : "#44D884"} fill={isLiked ? "#44D884" : "none"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight * 0.65,
    position: 'relative',
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.65,
    resizeMode: 'cover',
  },
  indicatorContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  indicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 1.5,
    maxWidth: 60,
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  propertyInfo: {
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
  },
  preferences: {
    gap: 8,
  },
  preferenceItem: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 30,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectButton: {
    borderWidth: 2,
    borderColor: '#FF4458',
  },
  messageButton: {
    borderWidth: 2,
    borderColor: '#44D884',
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#44D884',
  },
  likedButton: {
    backgroundColor: '#44D884',
    borderColor: '#44D884',
  },
});