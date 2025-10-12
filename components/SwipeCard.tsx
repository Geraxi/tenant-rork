import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '../types';
import VerificationBadge from './VerificationBadge';
import { t } from '../utils/translations';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface SwipeCardProps {
  user: User;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onPress: () => void;
  isFirst: boolean;
}

export default function SwipeCard({ user, onSwipeLeft, onSwipeRight, onPress, isFirst }: SwipeCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.spring(pan, {
            toValue: { x: width + 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => {
            onSwipeRight();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.spring(pan, {
            toValue: { x: -width - 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => {
            onSwipeLeft();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!isFirst) {
    return (
      <View style={[styles.card, styles.nextCard]} pointerEvents="none">
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: user.photos[0] }} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}, {user.age}</Text>
            <VerificationBadge 
              status={user.verified}
              idVerified={user.idVerified}
              backgroundCheck={user.backgroundCheckPassed}
            />
          </View>
          
          <View style={styles.typeRow}>
            <MaterialIcons 
              name={user.userType === 'homeowner' ? 'home' : user.userType === 'tenant' ? 'person' : 'people'} 
              size={16} 
              color="#666" 
            />
            <Text style={styles.userType}>
              {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
            </Text>
          </View>

          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.location}>{user.location}</Text>
          </View>

          <Text style={styles.bio} numberOfLines={3}>{user.bio}</Text>

          {user.userType === 'homeowner' && user.preferences.rent && (
            <View style={styles.rentRow}>
              <MaterialIcons name="attach-money" size={20} color="#4ECDC4" />
              <Text style={styles.rent}>€{user.preferences.rent}/mese</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: user.photos[0] }} 
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
      
      <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
        <Text style={styles.labelText}>{t('like')}</Text>
      </Animated.View>
      
      <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
        <Text style={styles.labelText}>{t('nope')}</Text>
      </Animated.View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}, {user.age}</Text>
          <VerificationBadge 
            status={user.verified}
            idVerified={user.idVerified}
            backgroundCheck={user.backgroundCheckPassed}
          />
        </View>
        
        <View style={styles.typeRow}>
          <MaterialIcons 
            name={user.userType === 'homeowner' ? 'home' : user.userType === 'tenant' ? 'person' : 'people'} 
            size={16} 
            color="#666" 
          />
          <Text style={styles.userType}>
            {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.location}>{user.location}</Text>
        </View>

        <Text style={styles.bio} numberOfLines={3}>{user.bio}</Text>

        {user.userType === 'homeowner' && user.preferences.rent && (
          <View style={styles.rentRow}>
            <MaterialIcons name="attach-money" size={20} color="#4ECDC4" />
            <Text style={styles.rent}>€{user.preferences.rent}/mese</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: width - 40,
    height: height * 0.7,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  nextCard: {
    transform: [{ scale: 0.95 }, { translateY: 10 }],
    opacity: 1,
    zIndex: -1,
  },
  imageContainer: {
    width: '100%',
    height: '70%',
    overflow: 'hidden',
  },
  infoContainer: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F9F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    right: 40,
    borderWidth: 4,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
    transform: [{ rotate: '20deg' }],
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    left: 40,
    borderWidth: 4,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 10,
    transform: [{ rotate: '-20deg' }],
  },
  labelText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
