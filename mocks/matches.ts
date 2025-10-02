import { Match } from '@/types';

export const mockMatches: Match[] = [
  {
    id: '1',
    user1_id: 'current_user',
    user2_id: 'landlord1@example.com',
    property_id: '1',
    match_type: 'property_interest',
    compatibility_score: 95,
    status: 'active',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    user1_id: 'current_user',
    user2_id: 'landlord2@example.com',
    property_id: '2',
    match_type: 'property_interest',
    compatibility_score: 87,
    status: 'chatting',
    created_at: '2024-01-09T15:30:00Z',
  },
  {
    id: '3',
    user1_id: 'current_user',
    user2_id: 'landlord3@example.com',
    property_id: '3',
    match_type: 'property_interest',
    compatibility_score: 92,
    status: 'active',
    created_at: '2024-01-08T09:15:00Z',
  },
];