import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface TenantLogoProps {
  size?: number;
  backgroundColor?: string;
}

export default function TenantLogo({ 
  size = 110, 
  backgroundColor = 'transparent'
}: TenantLogoProps) {
  const logoSize = size;
  
  const dynamicStyles = StyleSheet.create({
    container: {
      width: logoSize,
      height: logoSize,
      backgroundColor,
    },
    image: {
      width: logoSize,
      height: logoSize,
      resizeMode: 'contain' as const,
    }
  });
  
  return (
    <View style={[styles.logoContainer, dynamicStyles.container]}>
      <Image 
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/qaw02gpjji7owgede2e4o' }}
        style={dynamicStyles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});