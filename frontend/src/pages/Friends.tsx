import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Users, 
  UserCheck, 
  Search, 
  MessageCircle,
  Trash2,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { friendsApi } from '../api/friendsApi';
import { Friend, FriendRequest, SearchedUser } from '../types/friends';
import { useAuth } from '../contexts/AuthContext';

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем ID текущего пользователя из контекста аутентификации
  const authContext = useAuth();
  const user = authContext?.user;
  const currentUserId = user?.id;

  // Загружаем данные при монтировании
  useEffect(() => {
    if (currentUserId) {
      loadFriendsData();
    }
  }, [currentUserId]);

  const loadFriendsData = async () => {
    if (!currentUserId) {
      setError('Пользователь не авторизован');
      return;
    }

    setLoading(true);
    try {
      const [friendsData, incomingData, outgoingData] = await Promise.all([
        friendsApi.getFriends(currentUserId),
        friendsApi.getIncomingRequests(currentUserId),
        friendsApi.getOutgoingRequests(currentUserId)
      ]);

      // Защита от null: используем пустые массивы, если API вернул null
      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setIncomingRequests(Array.isArray(incomingData) ? incomingData : []);
      setOutgoingRequests(Array.isArray(outgoingData) ? outgoingData : []);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки данных');
      // Устанавливаем пустые массивы при ошибке
      setFriends([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
      } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !currentUserId) return;
    
    setLoading(true);
    try {
      const users = await friendsApi.searchUsers(currentUserId, searchQuery);
      // Защита от null: используем пустой массив, если API вернул null
      setSearchedUsers(Array.isArray(users) ? users : []);
      setError(null);
    } catch (err) {
      setError('Ошибка поиска пользователей');
      setSearchedUsers([]);
      } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (toUserId: string) => {
    if (!currentUserId) return;

    try {
      await friendsApi.sendFriendRequest(currentUserId, toUserId);
      // Обновляем список найденных пользователей
      const updatedUsers = searchedUsers.map(user => 
        user.id === toUserId 
          ? { ...user, relationship_status: 'request_sent' as const }
          : user
      );
      setSearchedUsers(updatedUsers);
    } catch (err) {
      }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!currentUserId) return;

    try {
      await friendsApi.acceptFriendRequest(requestId, currentUserId);
      // Убираем заявку из списка и обновляем друзей
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
      await loadFriendsData();
    } catch (err) {
      }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!currentUserId) return;

    try {
      await friendsApi.rejectFriendRequest(requestId, currentUserId);
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!currentUserId) return;

    try {
      await friendsApi.removeFriend(friendshipId, currentUserId);
      setFriends(prev => prev.filter(friend => friend.friendship_id !== friendshipId));
    } catch (err) {
      }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'recently':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Онлайн';
      case 'recently':
        return 'Недавно';
      default:
        return 'Оффлайн';
    }
  };

  return (
    <div className="h-full w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <h1 className="text-2xl font-bold text-center">
            👥 Друзья
          </h1>
          <p className="text-center text-blue-100 text-sm mt-1">
            Управляйте своими друзьями и находите новых
          </p>
        </div>

        {/* Табы */}
        <div className="flex justify-center p-4 border-b">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                activeTab === 'friends'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Друзья ({friends?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                activeTab === 'requests'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserCheck className="w-4 h-4 inline mr-2" />
              Заявки ({incomingRequests?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                activeTab === 'search'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Поиск
            </button>
          </div>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          )}

          {/* Таб: Друзья */}
          {activeTab === 'friends' && !loading && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Мои друзья</h2>
              {(friends?.length || 0) === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>У вас пока нет друзей</p>
                  <p className="text-sm">Используйте поиск, чтобы найти новых друзей</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.friendship_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {friend.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{friend.username}</h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(friend.status || 'offline')}
                            <span className="text-sm text-gray-600">{getStatusText(friend.status || 'offline')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {/* Мессенджер отключен */}
                        <button
                          onClick={() => handleRemoveFriend(friend.friendship_id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Удалить из друзей"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Таб: Заявки */}
          {activeTab === 'requests' && !loading && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Заявки в друзья</h2>
              
              {/* Входящие заявки */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-green-600">Входящие заявки</h3>
                {(incomingRequests?.length || 0) === 0 ? (
                  <p className="text-gray-500 text-center py-4">Нет входящих заявок</p>
                ) : (
                  <div className="space-y-3">
                    {incomingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-green-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {request.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{request.username}</h4>
                            <p className="text-sm text-gray-600">Хочет добавить вас в друзья</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Принять</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-1"
                          >
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">Отклонить</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Исходящие заявки */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-blue-600">Исходящие заявки</h3>
                {(outgoingRequests?.length || 0) === 0 ? (
                  <p className="text-gray-500 text-center py-4">Нет исходящих заявок</p>
                ) : (
                  <div className="space-y-3">
                    {outgoingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-blue-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {request.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{request.username}</h4>
                            <p className="text-sm text-gray-600">Ожидает ответа</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Ожидание</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Таб: Поиск */}
          {activeTab === 'search' && !loading && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Найти друзей</h2>
              
              {/* Поиск */}
              <div className="flex space-x-2 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите имя пользователя или email..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2 text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Найти</span>
                </button>
              </div>

              {/* Результаты поиска */}
              {(searchedUsers?.length || 0) > 0 && (
                <div className="space-y-3">
                  {searchedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{user.username}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div>
                        {user.relationship_status === 'friend' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            Уже друзья
                          </span>
                        )}
                        {user.relationship_status === 'request_sent' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Заявка отправлена
                          </span>
                        )}
                        {user.relationship_status === 'request_received' && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            Заявка получена
                          </span>
                        )}
                        {user.relationship_status === 'none' && (
                          <button
                            onClick={() => handleSendFriendRequest(user.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2 text-sm"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Добавить</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && (searchedUsers?.length || 0) === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Пользователи не найдены</p>
                  <p className="text-sm">Попробуйте изменить поисковый запрос</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;

