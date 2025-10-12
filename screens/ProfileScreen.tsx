import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '../types';
import VerificationBadge from '../components/VerificationBadge';

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onVerification: () => void;
}

export default function ProfileScreen({ user, onBack, onVerification }: ProfileScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <MaterialIcons name="settings" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: user.photos[0] }} 
            style={styles.profileImage}
          />
          <Text style={styles.name}>{user.name}, {user.age}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          <View style={styles.verificationContainer}>
            <VerificationBadge 
              status={user.verified}
              idVerified={user.idVerified}
              backgroundCheck={user.backgroundCheckPassed}
              size="large"
            />
          </View>
        </View>

        {user.verified !== 'verified' && (
          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={onVerification}
          >
            <MaterialIcons name="verified-user" size={24} color="#fff" />
            <Text style={styles.verifyButtonText}>Complete Verification</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={20} color="#4ECDC4" />
              <Text style={styles.infoLabel}>User Type:</Text>
              <Text style={styles.infoValue}>
                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color="#4ECDC4" />
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{user.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <View style={styles.infoCard}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        </View>

        {user.userType === 'homeowner' && user.preferences.rent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="attach-money" size={20} color="#4ECDC4" />
                <Text style={styles.infoLabel}>Rent:</Text>
                <Text style={styles.infoValue}>${user.preferences.rent}/month</Text>
              </View>
              {user.preferences.bedrooms && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="bed" size={20} color="#4ECDC4" />
                  <Text style={styles.infoLabel}>Bedrooms:</Text>
                  <Text style={styles.infoValue}>{user.preferences.bedrooms}</Text>
                </View>
              )}
              {user.preferences.nearAirport && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="flight" size={20} color="#4ECDC4" />
                  <Text style={styles.infoLabel}>Near Airport:</Text>
                  <Text style={styles.infoValue}>Yes</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#F44336" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  verificationContainer: {
    marginTop: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
});