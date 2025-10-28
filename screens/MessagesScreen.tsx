import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  senderName: string;
  receiverName: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

interface MessagesScreenProps {
  onNavigateBack: () => void;
}

export default function MessagesScreen({ onNavigateBack }: MessagesScreenProps) {
  const { user } = useSupabaseAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock conversations data
  const MOCK_CONVERSATIONS: Conversation[] = [
    {
      id: 'conv1',
      participantId: 'user1',
      participantName: 'Marco Rossi',
      participantAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      lastMessage: 'Ciao! Sono interessato all\'appartamento che hai pubblicato.',
      lastMessageTime: '2 ore fa',
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 'conv2',
      participantId: 'user2',
      participantName: 'Sofia Bianchi',
      participantAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      lastMessage: 'Perfetto! Quando possiamo vederci?',
      lastMessageTime: '1 giorno fa',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 'conv3',
      participantId: 'user3',
      participantName: 'Alessandro Verdi',
      participantAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      lastMessage: 'Grazie per la disponibilità!',
      lastMessageTime: '3 giorni fa',
      unreadCount: 1,
      isOnline: true,
    },
  ];

  // Mock messages data
  const MOCK_MESSAGES: Message[] = [
    {
      id: 'msg1',
      senderId: 'user1',
      receiverId: user?.id || 'current_user',
      content: 'Ciao! Sono interessato all\'appartamento che hai pubblicato.',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      senderName: 'Marco Rossi',
      receiverName: user?.nome || 'Tu',
    },
    {
      id: 'msg2',
      senderId: user?.id || 'current_user',
      receiverId: 'user1',
      content: 'Ciao Marco! Grazie per l\'interesse. L\'appartamento è ancora disponibile.',
      timestamp: '2024-01-15T10:35:00Z',
      isRead: true,
      senderName: user?.nome || 'Tu',
      receiverName: 'Marco Rossi',
    },
    {
      id: 'msg3',
      senderId: 'user1',
      receiverId: user?.id || 'current_user',
      content: 'Perfetto! Quando possiamo vederci per una visita?',
      timestamp: '2024-01-15T10:40:00Z',
      isRead: false,
      senderName: 'Marco Rossi',
      receiverName: user?.nome || 'Tu',
    },
  ];

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setConversations(MOCK_CONVERSATIONS);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // Simulate API call
      setTimeout(() => {
        setMessages(MOCK_MESSAGES);
        setSelectedConversation(conversationId);
      }, 500);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'current_user',
      receiverId: selectedConversation,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      senderName: user?.nome || 'Tu',
      receiverName: 'Destinatario',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Ora';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h fa`;
    } else {
      return date.toLocaleDateString('it-IT');
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => loadMessages(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationAvatar}>
        <MaterialIcons name="person" size={24} color="#666" />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.participantName} numberOfLines={1}>
            {item.participantName}
          </Text>
          <Text style={styles.lastMessageTime}>{item.lastMessageTime}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {item.content}
        </Text>
        <Text style={[
          styles.messageTime,
          isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
        ]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messaggi</Text>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Caricamento conversazioni...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedConversation) {
    const conversation = conversations.find(c => c.id === selectedConversation);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setSelectedConversation(null)} 
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{conversation?.participantName}</Text>
            <Text style={styles.headerSubtitle}>
              {conversation?.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="more-vert" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
        />

        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Scrivi un messaggio..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <MaterialIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messaggi</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  conversationAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownMessageText: {
    backgroundColor: '#2196F3',
    color: '#fff',
  },
  otherMessageText: {
    backgroundColor: '#e0e0e0',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    textAlign: 'right',
    color: '#666',
  },
  otherMessageTime: {
    textAlign: 'left',
    color: '#666',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});