import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '../types';
import VerificationBadge from './VerificationBadge';
import { t } from '../utils/translations';

const { width } = Dimensions.get('window');

interface CardDetailModalProps {
  visible: boolean;
  user: User;
  onClose: () => void;
}

export default function CardDetailModal({ visible, user, onClose }: CardDetailModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('viewProfile')}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.photosContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentPhotoIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {user.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            <View style={styles.photoIndicators}>
              {user.photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentPhotoIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.name}, {user.age}</Text>
              <VerificationBadge
                status={user.verified}
                idVerified={user.idVerified}
                backgroundCheck={user.backgroundCheckPassed}
                size="large"
              />
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.infoText}>{user.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons
                name={user.userType === 'homeowner' ? 'home' : user.userType === 'tenant' ? 'person' : 'people'}
                size={20}
                color="#666"
              />
              <Text style={styles.infoText}>
                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
              </Text>
            </View>

            {user.employmentStatus && (
              <View style={styles.infoRow}>
                <MaterialIcons name="work" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {t(user.employmentStatus as any)}
                  {user.jobType && ` - ${t(user.jobType as any)}`}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('about')}</Text>
              <Text style={styles.bio}>{user.bio}</Text>
            </View>

            {user.userType === 'homeowner' && user.preferences.rent && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('propertyInfo')}</Text>
                <View style={styles.propertyGrid}>
                  <View style={styles.propertyItem}>
                    <MaterialIcons name="attach-money" size={24} color="#4ECDC4" />
                    <Text style={styles.propertyValue}>€{user.preferences.rent}</Text>
                    <Text style={styles.propertyLabel}>{t('perMonth')}</Text>
                  </View>
                  {user.preferences.bedrooms && (
                    <View style={styles.propertyItem}>
                      <MaterialIcons name="bed" size={24} color="#4ECDC4" />
                      <Text style={styles.propertyValue}>{user.preferences.bedrooms}</Text>
                      <Text style={styles.propertyLabel}>{t('bedrooms')}</Text>
                    </View>
                  )}
                  {user.preferences.bathrooms && (
                    <View style={styles.propertyItem}>
                      <MaterialIcons name="bathtub" size={24} color="#4ECDC4" />
                      <Text style={styles.propertyValue}>{user.preferences.bathrooms}</Text>
                      <Text style={styles.propertyLabel}>{t('bathrooms')}</Text>
                    </View>
                  )}
                  {user.preferences.squareMeters && (
                    <View style={styles.propertyItem}>
                      <MaterialIcons name="square-foot" size={24} color="#4ECDC4" />
                      <Text style={styles.propertyValue}>{user.preferences.squareMeters}</Text>
                      <Text style={styles.propertyLabel}>{t('squareMeters')}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {user.preferences.amenities && user.preferences.amenities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('amenities')}</Text>
                <View style={styles.amenitiesContainer}>
                  {user.preferences.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityChip}>
                      <MaterialIcons name="check-circle" size={16} color="#4ECDC4" />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  photosContainer: {
    height: 400,
    position: 'relative',
  },
  photo: {
    width: width,
    height: 400,
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  content: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  propertyItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  propertyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  propertyLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F9F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  amenityText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
  },
});