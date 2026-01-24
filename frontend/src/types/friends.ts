export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  last_seen?: string;
  status?: 'online' | 'recently' | 'offline';
}

export interface Friend extends User {
  friendship_id: string;
  created_at: string;
  accepted_at?: string;
}

export interface FriendRequest {
  id: string;
  message?: string;
  created_at: string;
  from_user_id?: string;
  to_user_id?: string;
  username: string;
  email: string;
  avatar_url?: string;
}

export interface SearchedUser extends User {
  relationship_status: 'friend' | 'request_sent' | 'request_received' | 'none';
}

export interface FriendsState {
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  searchedUsers: SearchedUser[];
  loading: boolean;
  error: string | null;
}

export type FriendRequestAction = 'accept' | 'reject';
export type FriendAction = 'remove' | 'block';









