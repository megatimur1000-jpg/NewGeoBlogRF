import express from 'express';
import friendsController from '../controllers/friendsController.js';

const router = express.Router();

// Получить список друзей
router.get('/friends', friendsController.getFriends);

// Получить входящие заявки в друзья
router.get('/friends/requests/incoming', friendsController.getIncomingRequests);

// Получить исходящие заявки в друзья
router.get('/friends/requests/outgoing', friendsController.getOutgoingRequests);

// Отправить заявку в друзья
router.post('/friends/request', friendsController.sendFriendRequest);

// Принять заявку в друзья
router.post('/friends/accept/:requestId', friendsController.acceptFriendRequest);

// Отклонить заявку в друзья
router.post('/friends/reject/:requestId', friendsController.rejectFriendRequest);

// Удалить из друзей
router.delete('/friends/:friendshipId', friendsController.removeFriend);

// Поиск пользователей для добавления в друзья
router.get('/friends/search', friendsController.searchUsers);

export default router;


