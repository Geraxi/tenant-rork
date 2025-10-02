import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import TopCard from "./TopCard";
import StaticCard from "./StaticCard";
import EmptyState from "./EmptyState";
import { Property, User } from '@/types';
import { Colors, Typography } from '@/constants/theme';

interface DeckProps {
  initialCards: (Property | User)[];
  onOpenItem?: (item: Property | User) => void;
  type: 'property' | 'user';
  onPreferences?: () => void;
}

export interface DeckRef {
  forceSwipe: (direction: 'left' | 'right') => void;
}

const Deck = React.forwardRef<DeckRef, DeckProps>(({ initialCards = [], onOpenItem, type, onPreferences }, ref) => {
  const [cards, setCards] = useState<(Property | User)[]>(initialCards);
  const topCardRef = React.useRef<any>(null);
  const isSwipingRef = React.useRef(false);

  // Update cards when initialCards change
  React.useEffect(() => {
    console.log('Deck: initialCards changed, length:', initialCards.length);
    setCards(initialCards);
  }, [initialCards]);

  const reloadListings = () => {
    console.log('Deck: reloading listings, initialCards length:', initialCards.length);
    setCards(initialCards);
  };

  const handleSwipeComplete = (direction: 'left' | 'right', itemId: string) => {
    console.log(`Swipe ${direction} completed for item ${itemId}`);
    
    // Remove the card immediately after swipe animation completes
    // This ensures the next card doesn't have time to glitch
    setCards(prev => {
      const filtered = prev.filter(c => c.id !== itemId);
      console.log(`Cards remaining: ${filtered.length}`);
      return filtered;
    });
    
    // Optionally persist like/dislike
    // if (direction === 'right') saveLike(itemId);
  };

  React.useImperativeHandle(ref, () => ({
    forceSwipe: (direction: 'left' | 'right') => {
      if (topCardRef.current) {
        topCardRef.current.forceSwipe(direction);
      }
    },
  }));

  if (!cards || cards.length === 0) {
    return (
      <EmptyState
        message="🎉 No more listings! Check back later."
        onReload={reloadListings}
        onPreferences={onPreferences}
      />
    );
  }

  // Render top 3 cards: index 0 is interactive
  return (
    <View style={styles.container}>
      {cards.slice(0, 3).map((item, idx) => {
        const isTop = idx === 0;
        return (
          <View
            key={item.id} // Use just the item ID for stable keys
            style={[styles.cardWrapper, { zIndex: 100 - idx }]}
            pointerEvents={isTop ? "auto" : "none"} // only top card receives touches
          >
            {isTop ? (
              <TopCard
                key={`top-${item.id}`} // Ensure TopCard gets a fresh instance
                ref={topCardRef}
                item={item}
                type={type}
                onSwipeComplete={(dir: 'left' | 'right') => handleSwipeComplete(dir, item.id)}
                onPress={() => onOpenItem && onOpenItem(item)}
              />
            ) : (
              <StaticCard 
                key={`static-${item.id}`}
                item={item} 
                type={type} 
                index={idx} 
              />
            )}
          </View>
        );
      })}
      <View style={styles.counter}>
        <Text style={styles.counterText}>{`${initialCards.length - cards.length} / ${initialCards.length}`}</Text>
      </View>
    </View>
  );
});

Deck.displayName = 'Deck';

export default Deck;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  cardWrapper: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  counter: { 
    position: "absolute", 
    top: 40, 
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  counterText: {
    ...Typography.caption,
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 12,
  },
});