import apiClient from './apiClient';
import { Friend, FriendRequest, SearchedUser } from '../types/friends';

export const friendsApi = {
  // Получить список друзей
  getFriends: async (userId: string): Promise<Friend[]> => {
    const response = await apiClient.get(`/friends?userId=${userId}`);
    return response.data;
  },

  // Получить входящие заявки в друзья
  getIncomingRequests: async (userId: string): Promise<FriendRequest[]> => {
    const response = await apiClient.get(`/friends/requests/incoming?userId=${userId}`);
    return response.data;
  },

  // Получить исходящие заявки в друзья
  getOutgoingRequests: async (userId: string): Promise<FriendRequest[]> => {
    const response = await apiClient.get(`/friends/requests/outgoing?userId=${userId}`);
    return response.data;
  },

  // Отправить заявку в друзья
  sendFriendRequest: async (fromUserId: string, toUserId: string, message?: string): Promise<any> => {
    const response = await apiClient.post('/friends/request', {
      fromUserId,
      toUserId,
      message
    });
    return response.data;
  },

  // Принять заявку в друзья
  acceptFriendRequest: async (requestId: string, userId: string): Promise<any> => {
    const response = await apiClient.post(`/friends/accept/${requestId}`, { userId });
    return response.data;
  },

  // Отклонить заявку в друзья
  rejectFriendRequest: async (requestId: string, userId: string): Promise<any> => {
    const response = await apiClient.post(`/friends/reject/${requestId}`, { userId });
    return response.data;
  },

  // Удалить из друзей
  removeFriend: async (friendshipId: string, userId: string): Promise<any> => {
    const response = await apiClient.delete(`/friends/${friendshipId}`, { 
      data: { userId } 
    });
    return response.data;
  },

  // Поиск пользователей для добавления в друзья
  searchUsers: async (userId: string, query: string): Promise<SearchedUser[]> => {
    const response = await apiClient.get(`/friends/search?userId=${userId}&query=${encodeURIComponent(query)}`);
    return response.data;
  }
};


