import React from "react";
import { View, StyleSheet } from "react-native";
import PropertyCard from './PropertyCard';
import UserCard from './UserCard';
import { Property, User } from '@/types';
import { Colors } from '@/constants/theme';

interface StaticCardProps {
  item: Property | User;
  type: 'property' | 'user';
  index?: number;
}

export default function StaticCard({ item, type, index = 1 }: StaticCardProps) {
  const scale = 1 - index * 0.04;
  const translateY = index * 10;
  
  return (
    <View style={[styles.card, { transform: [{ scale }, { translateY }] }]}>
      <View style={styles.inner}>
        {type === 'property' ? (
          <PropertyCard property={item as Property} />
        ) : (
          <UserCard user={item as User} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  inner: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },
});