import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import Deck, { DeckRef } from "./Deck";
import ActionButtons from "./ActionButtons";
import { Property, User } from '@/types';
import { Spacing } from '@/constants/theme';

interface DeckWithButtonsProps {
  initialCards: (Property | User)[];
  onOpenItem?: (item: Property | User) => void;
  type: 'property' | 'user';
  onSwipe?: (liked: boolean) => void;
  onPreferences?: () => void;
}

export interface DeckWithButtonsRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

const DeckWithButtons = React.forwardRef<DeckWithButtonsRef, DeckWithButtonsProps>(
  ({ initialCards, onOpenItem, type, onSwipe, onPreferences }, ref) => {
    const deckRef = useRef<DeckRef>(null);
    
    console.log('DeckWithButtons: Rendering with', initialCards.length, 'cards, type:', type);

    const handleLike = () => {
      if (deckRef.current) {
        deckRef.current.forceSwipe('right');
      }
      onSwipe?.(true);
    };

    const handleNope = () => {
      if (deckRef.current) {
        deckRef.current.forceSwipe('left');
      }
      onSwipe?.(false);
    };

    React.useImperativeHandle(ref, () => ({
      swipeLeft: handleNope,
      swipeRight: handleLike,
    }));

    return (
      <View style={styles.container}>
        <View style={styles.deckContainer}>
          <Deck
            ref={deckRef}
            initialCards={initialCards}
            onOpenItem={onOpenItem}
            type={type}
            onPreferences={onPreferences}
          />
        </View>
        
        {initialCards.length > 0 && (
          <View style={styles.buttonsContainer}>
            <ActionButtons onNope={handleNope} onLike={handleLike} />
          </View>
        )}
      </View>
    );
  }
);

DeckWithButtons.displayName = 'DeckWithButtons';

export default DeckWithButtons;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deckContainer: {
    flex: 1,
  },
  buttonsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
});