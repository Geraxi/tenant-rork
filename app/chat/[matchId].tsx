import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, ArrowLeft, MoreVertical, Trash2, UserX, Check, CheckCheck, Circle } from 'lucide-react-native';
import { useUser } from '@/store/user-store';
import { mockMatches } from '@/mocks/matches';
import { mockProperties } from '@/mocks/properties';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import { Message } from '@/types';

const mockMessages: Message[] = [
  {
    id: '1',
    match_id: '2',
    sender_id: 'landlord2@example.com',
    content: 'Ciao! Grazie per l\'interesse nel mio appartamento. Quando saresti disponibile per una visita?',
    read: true,
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    match_id: '2',
    sender_id: 'current_user',
    content: 'Ciao! Sono molto interessato. Sarei disponibile questo weekend, va bene per lei?',
    read: true,
    created_at: '2024-01-10T10:15:00Z',
  },
  {
    id: '3',
    match_id: '2',
    sender_id: 'landlord2@example.com',
    content: 'Perfetto! Sabato alle 15:00 va bene? L\'indirizzo è Via Roma 123.',
    read: true,
    created_at: '2024-01-10T10:30:00Z',
  },
  {
    id: '4',
    match_id: '2',
    sender_id: 'current_user',
    content: 'Perfetto, ci vediamo sabato alle 15:00. Grazie!',
    read: true,
    created_at: '2024-01-10T10:35:00Z',
  },
];

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [newMessage, setNewMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(mockMessages.filter(m => m.match_id === matchId));
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastSeen, setLastSeen] = useState<string>('2 minuti fa');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  const match = mockMatches.find(m => m.id === matchId);
  const property = match ? mockProperties.find(p => p.id === match.property_id) : null;

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !matchId) return;

    const message: Message = {
      id: Date.now().toString(),
      match_id: matchId,
      sender_id: user.id,
      content: newMessage.trim(),
      read: false,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleDeleteChat = () => {
    Alert.alert(
      'Elimina conversazione',
      'Sei sicuro di voler eliminare questa conversazione? Tutti i messaggi verranno persi.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
    setShowMenu(false);
  };

  const handleUnmatch = () => {
    Alert.alert(
      'Rimuovi match',
      'Sei sicuro di voler rimuovere questo match? Non potrai più chattare con questa persona.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
    setShowMenu(false);
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender_id !== user?.id) return null;
    
    // Simulate message status based on time
    const messageAge = Date.now() - new Date(message.created_at).getTime();
    if (messageAge < 5000) return 'sent'; // Less than 5 seconds = sent
    if (messageAge < 30000) return 'delivered'; // Less than 30 seconds = delivered
    return 'read'; // Older = read
  };

  const renderMessageStatus = (status: string | null) => {
    if (!status) return null;
    
    const iconColor = status === 'read' ? Colors.primary : Colors.textSecondary;
    const IconComponent = status === 'sent' ? Check : CheckCheck;
    
    return (
      <View style={styles.messageStatus}>
        <IconComponent size={12} color={iconColor} />
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    const messageTime = new Date(item.created_at).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const messageStatus = getMessageStatus(item);

    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.otherMessageTime]}>
              {messageTime}
            </Text>
            {renderMessageStatus(messageStatus)}
          </View>
        </View>
      </View>
    );
  };

  if (!match || !property) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Chat non trovata</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Stack.Screen
        options={{
          title: property.title,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: property.photos[0] }}
                    style={styles.headerImage}
                  />
                  <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? Colors.success : Colors.border }]} />
                </View>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>
                    {isOnline ? 'Online' : `Visto ${lastSeen}`}
                  </Text>
                  {isTyping && (
                    <Text style={styles.typingText}>Sta scrivendo...</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowMenu(!showMenu)}
                style={styles.menuButton}
              >
                <MoreVertical size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {showMenu && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.menuOverlayBackground}
            onPress={() => setShowMenu(false)}
          />
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteChat}
            >
              <Trash2 size={20} color={Colors.error || '#FF3B30'} />
              <Text style={[styles.menuText, { color: Colors.error || '#FF3B30' }]}>
                Elimina conversazione
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleUnmatch}
            >
              <UserX size={20} color={Colors.error || '#FF3B30'} />
              <Text style={[styles.menuText, { color: Colors.error || '#FF3B30' }]}>
                Rimuovi match
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {isTyping && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingDots}>
            <Circle size={6} color={Colors.textSecondary} />
            <Circle size={6} color={Colors.textSecondary} />
            <Circle size={6} color={Colors.textSecondary} />
          </View>
        </View>
      )}

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Scrivi un messaggio..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Send size={20} color={newMessage.trim() ? Colors.background : Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.sm,
  },
  headerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  typingText: {
    ...Typography.small,
    color: Colors.primary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  menuButton: {
    padding: Spacing.xs,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuOverlayBackground: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    top: 100,
    right: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  menuText: {
    ...Typography.body,
    marginLeft: Spacing.sm,
  },
  messagesContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  messageContainer: {
    marginBottom: Spacing.md,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Spacing.xs,
  },
  otherBubble: {
    backgroundColor: Colors.background,
    borderBottomLeftRadius: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    ...Typography.body,
    lineHeight: 20,
  },
  myMessageText: {
    color: Colors.background,
  },
  otherMessageText: {
    color: Colors.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
  },
  messageTime: {
    ...Typography.small,
  },
  messageStatus: {
    marginLeft: Spacing.xs,
  },
  myMessageTime: {
    color: Colors.background,
    opacity: 0.8,
  },
  otherMessageTime: {
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.backgroundSecondary,
  },
  typingIndicator: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    alignSelf: 'flex-start',
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    margin: Spacing.lg,
  },
});