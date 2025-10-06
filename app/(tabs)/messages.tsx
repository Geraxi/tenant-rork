import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Animated, PanResponder, ScrollView, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Trash2, Search, Archive, Clock, Users, Star, Filter } from 'lucide-react-native';
import { useUser } from '@/store/user-store';
import { mockMatches } from '@/mocks/matches';
import { mockProperties } from '@/mocks/properties';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import { Match, Message } from '@/types';

// Mock messages data with more realistic conversation data
const mockMessages: Message[] = [
  {
    id: '1',
    match_id: '2',
    sender_id: 'landlord2@example.com',
    content: 'Ciao! L&apos;appartamento è ancora disponibile?',
    read: false,
    created_at: '2024-01-10T14:30:00Z',
  },
  {
    id: '2',
    match_id: '1',
    sender_id: 'current_user',
    content: 'Perfetto, grazie per la disponibilità!',
    read: true,
    created_at: '2024-01-10T12:15:00Z',
  },
  {
    id: '3',
    match_id: '3',
    sender_id: 'landlord3@example.com',
    content: 'Quando potresti venire a vedere l\'appartamento?',
    read: false,
    created_at: '2024-01-09T18:45:00Z',
  },
  {
    id: '4',
    match_id: '2',
    sender_id: 'current_user',
    content: 'Sì, sono ancora interessato. Possiamo fissare un appuntamento?',
    read: true,
    created_at: '2024-01-10T14:35:00Z',
  },
  {
    id: '5',
    match_id: '1',
    sender_id: 'landlord1@example.com',
    content: 'Ottimo! Ti aspetto domani alle 15:00',
    read: false,
    created_at: '2024-01-10T16:20:00Z',
  },
];

type MessageSection = 'all' | 'unread' | 'recent' | 'archived';

interface ConversationData extends Match {
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isFavorite: boolean;
  lastActivity: string;
}

export default function MessagesScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [activeSection, setActiveSection] = useState<MessageSection>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);

  // Create conversation data with additional metadata
  const conversationsData: ConversationData[] = useMemo(() => {
    if (!user) return [];
    
    return matches
      .filter(match => match.status === 'chatting')
      .map(match => {
        const matchMessages = mockMessages.filter(msg => msg.match_id === match.id);
        const lastMessage = matchMessages
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        const unreadCount = matchMessages
          .filter(msg => !msg.read && msg.sender_id !== user.id)
          .length;

        return {
          ...match,
          lastMessage,
          unreadCount,
          isArchived: Math.random() > 0.8, // Random archived status for demo
          isFavorite: Math.random() > 0.7, // Random favorite status for demo
          lastActivity: lastMessage?.created_at || match.created_at,
        };
      })
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }, [matches, user]);

  // Filter conversations based on active section and search
  const filteredConversations = useMemo(() => {
    let filtered = conversationsData;

    // Filter by section
    switch (activeSection) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case 'recent':
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(conv => new Date(conv.lastActivity) > oneDayAgo);
        break;
      case 'archived':
        filtered = filtered.filter(conv => conv.isArchived);
        break;

      default:
        filtered = filtered.filter(conv => !conv.isArchived);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => {
        const property = mockProperties.find(p => p.id === conv.property_id);
        return (
          property?.title.toLowerCase().includes(query) ||
          property?.location.toLowerCase().includes(query) ||
          conv.lastMessage?.content.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [conversationsData, activeSection, searchQuery]);

  if (!user) {
    return (
      <View
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <Text style={[styles.message, { color: Colors.text }]}>Effettua l&apos;accesso per vedere i messaggi</Text>
      </View>
    );
  }

  const conversations = filteredConversations;

  const handleDeleteMatch = (matchId: string) => {
    Alert.alert(
      'Elimina conversazione',
      'Sei sicuro di voler eliminare questa conversazione? Questa azione non può essere annullata.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            setMatches(prev => prev.filter(match => match.id !== matchId));
          },
        },
      ]
    );
  };

  const handleArchiveMatch = (matchId: string) => {
    // In a real app, this would update the backend
    console.log('Archive match:', matchId);
  };

  const handleFavoriteMatch = (matchId: string) => {
    // In a real app, this would update the backend
    console.log('Favorite match:', matchId);
  };

  const getSectionCount = (section: MessageSection): number => {
    if (!section?.trim() || section.length > 20) return 0;
    
    switch (section) {
      case 'unread':
        return conversationsData.filter(conv => conv.unreadCount > 0).length;
      case 'recent':
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return conversationsData.filter(conv => new Date(conv.lastActivity) > oneDayAgo).length;
      case 'archived':
        return conversationsData.filter(conv => conv.isArchived).length;

      default:
        return conversationsData.filter(conv => !conv.isArchived).length;
    }
  };

  const totalUnreadCount = conversationsData.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const renderSectionTab = (section: MessageSection, icon: any, label: string) => {
    if (!section?.trim() || section.length > 20) return null;
    
    const count = getSectionCount(section);
    const isActive = activeSection === section;
    
    return (
      <TouchableOpacity
        key={section}
        style={[styles.sectionTab, isActive && styles.activeSectionTab]}
        onPress={() => setActiveSection(section)}
      >
        <View style={styles.sectionTabContent}>
          {React.createElement(icon, {
            size: 16,
            color: isActive ? Colors.primary : Colors.textSecondary
          })}
          <Text style={[styles.sectionTabText, isActive && styles.activeSectionTabText]}>
            {label}
          </Text>
          {count > 0 && (
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{count}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Stack.Screen 
        options={{ 
          title: 'Messaggi',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowSearch(!showSearch)}
                accessibilityRole="button"
                accessibilityLabel="Cerca conversazioni"
                accessibilityHint="Tocca per aprire la barra di ricerca"
              >
                <Search size={24} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {}}
                accessibilityRole="button"
                accessibilityLabel="Filtra conversazioni"
                accessibilityHint="Tocca per aprire i filtri"
              >
                <Filter size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      
      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cerca conversazioni..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Cancella ricerca"
              >
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Section Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sectionTabs}
        contentContainerStyle={styles.sectionTabsContent}
      >
        {renderSectionTab('all', MessageCircle, 'Tutte')}
        {renderSectionTab('unread', Users, 'Non lette')}
        {renderSectionTab('recent', Clock, 'Recenti')}
        {renderSectionTab('archived', Archive, 'Archiviate')}
      </ScrollView>

      {/* Unread Messages Summary */}
      {totalUnreadCount > 0 && activeSection === 'all' && (
        <View style={styles.unreadSummary}>
          <View style={styles.unreadSummaryContent}>
            <View style={styles.unreadIcon}>
              <MessageCircle size={16} color={Colors.primary} />
            </View>
            <Text style={styles.unreadSummaryText}>
              Hai {totalUnreadCount} messaggio{totalUnreadCount > 1 ? 'i' : ''} non lett{totalUnreadCount > 1 ? 'i' : 'o'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewUnreadButton}
            onPress={() => setActiveSection('unread')}
            accessibilityRole="button"
            accessibilityLabel="Visualizza messaggi non letti"
            accessibilityHint="Tocca per vedere solo i messaggi non letti"
          >
            <Text style={styles.viewUnreadButtonText}>Visualizza</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          {activeSection === 'unread' ? (
            <View style={styles.emptyStateContent}>
              <Users size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nessun messaggio non letto</Text>
              <Text style={styles.emptyText}>
                Tutti i tuoi messaggi sono stati letti!
              </Text>
            </View>
          ) : activeSection === 'recent' ? (
            <View style={styles.emptyStateContent}>
              <Clock size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nessuna conversazione recente</Text>
              <Text style={styles.emptyText}>
                Non ci sono state conversazioni nelle ultime 24 ore.
              </Text>
            </View>
          ) : activeSection === 'archived' ? (
            <View style={styles.emptyStateContent}>
              <Archive size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nessuna conversazione archiviata</Text>
              <Text style={styles.emptyText}>
                Le conversazioni archiviate appariranno qui.
              </Text>
            </View>
          ) : searchQuery ? (
            <View style={styles.emptyStateContent}>
              <Search size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nessun risultato</Text>
              <Text style={styles.emptyText}>
                Nessuna conversazione corrisponde alla tua ricerca &quot;{searchQuery}&quot;.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyStateContent}>
              <MessageCircle size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nessun messaggio</Text>
              <Text style={styles.emptyText}>
                Quando avrai dei match, potrai iniziare a chattare qui!
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/browse')}
                accessibilityRole="button"
                accessibilityLabel="Trova match"
                accessibilityHint="Tocca per iniziare a cercare nuovi match"
              >
                <Text style={styles.browseButtonText}>Trova match</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={({ item }) => (
            <SwipeableConversation
              conversation={item}
              property={mockProperties.find(p => p.id === item.property_id)}
              onDelete={() => handleDeleteMatch(item.id)}
              onArchive={() => handleArchiveMatch(item.id)}
              onFavorite={() => handleFavoriteMatch(item.id)}
              onPress={() => router.push(`/chat/${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

interface SwipeableConversationProps {
  conversation: ConversationData;
  property: any;
  onDelete: () => void;
  onArchive: () => void;
  onFavorite: () => void;
  onPress: () => void;
}

function SwipeableConversation({ conversation, property, onDelete, onArchive, onFavorite, onPress }: SwipeableConversationProps) {
  const translateX = new Animated.Value(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 50;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        translateX.setValue(Math.max(gestureState.dx, -180));
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -60) {
        Animated.timing(translateX, {
          toValue: -180,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    Animated.timing(translateX, {
      toValue: -400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Ora';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h fa`;
    } else if (diffInHours < 48) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    }
  };

  if (!property) return null;

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.favoriteButton]}
          onPress={() => {
            onFavorite();
            Animated.timing(translateX, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }}
          disabled={isDeleting}
        >
          <Star size={20} color={Colors.background} fill={conversation.isFavorite ? Colors.background : 'transparent'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.archiveButton]}
          onPress={() => {
            onArchive();
            Animated.timing(translateX, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }}
          disabled={isDeleting}
        >
          <Archive size={20} color={Colors.background} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 size={20} color={Colors.background} />
        </TouchableOpacity>
      </View>
      
      <Animated.View
        style={[styles.conversationWrapper, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.conversationCard}
          onPress={onPress}
          disabled={isDeleting}
          accessibilityRole="button"
          accessibilityLabel={`Conversazione con ${property.title}, ${conversation.unreadCount > 0 ? `${conversation.unreadCount} messaggi non letti` : 'nessun messaggio non letto'}`}
          accessibilityHint="Tocca per aprire la conversazione. Scorri verso sinistra per vedere le azioni"
          accessibilityActions={[
            { name: 'favorite', label: 'Aggiungi ai preferiti' },
            { name: 'archive', label: 'Archivia' },
            { name: 'delete', label: 'Elimina' }
          ]}
        >
          <Image
            source={{ uri: property.photos[0] }}
            style={styles.avatar}
          />
          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <Text style={styles.conversationTitle}>{property.title}</Text>
              <View style={styles.conversationIcons}>
                {conversation.isFavorite && (
                  <Star size={14} color={Colors.warning} fill={Colors.warning} />
                )}
                {conversation.isArchived && (
                  <Archive size={14} color={Colors.textSecondary} />
                )}
              </View>
            </View>
            <Text style={[styles.lastMessage, conversation.unreadCount > 0 && styles.unreadLastMessage]}>
              {conversation.lastMessage?.content || 'Nessun messaggio'}
            </Text>
            <Text style={styles.locationText}>{property.location}</Text>
          </View>
          <View style={styles.conversationMeta}>
            <Text style={styles.timestamp}>{formatLastActivity(conversation.lastActivity)}</Text>
            {conversation.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.xs,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  clearSearch: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  sectionTabs: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    maxHeight: 50,
  },
  sectionTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    alignItems: 'center',
  },
  sectionTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  activeSectionTab: {
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  sectionTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionTabText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0,
  },
  activeSectionTabText: {
    color: Colors.text,
    fontWeight: '600',
  },
  sectionBadge: {
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionBadgeText: {
    ...Typography.small,
    color: Colors.background,
    fontSize: 9,
    fontWeight: '600',
  },
  unreadSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary + '10',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  unreadSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unreadIcon: {
    marginRight: Spacing.sm,
  },
  unreadSummaryText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '500',
  },
  viewUnreadButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  viewUnreadButtonText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  conversationCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    padding: Spacing.md,
    alignItems: 'flex-start',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: Spacing.md,
  },
  conversationContent: {
    flex: 1,
    gap: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
  },
  conversationIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  lastMessage: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
    fontSize: 14,
  },
  unreadLastMessage: {
    color: Colors.text,
    fontWeight: '500',
  },
  locationText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  conversationMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  timestamp: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  unreadCount: {
    ...Typography.small,
    color: Colors.background,
    fontWeight: '600',
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
    minHeight: 44,
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
  swipeContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  conversationWrapper: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
  },
  swipeActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    backgroundColor: Colors.warning,
  },
  archiveButton: {
    backgroundColor: Colors.textSecondary,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderTopRightRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },
  emptyStateContent: {
    alignItems: 'center',
  },
});