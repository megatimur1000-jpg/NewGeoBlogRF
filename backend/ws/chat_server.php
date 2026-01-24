<?php
/**
 * WebSocket-сервер для чата по хэштегам
 */

// Включаем автозагрузку Composer
require __DIR__ . '/vendor/autoload.php';
header('Access-Control-Allow-Origin: *'); // Для тестов! В продакшене укажите конкретный домен.

// Импортируем необходимые классы Ratchet
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

/**
 * Класс, реализующий серверную часть чата
 */
class ChatServer implements MessageComponentInterface
{
    protected $clients;
    protected $rooms;
    protected $userResourceMap;
    
    public function __construct()
    {
        // SplObjectStorage хранит соединения клиентов
        $this->clients = new \SplObjectStorage;
        // Массив комнат чата, где ключ - название комнаты (хэштег)
        $this->rooms = [];
        // Маппинг ID пользователей к ресурсам соединений
        $this->userResourceMap = [];
        
        echo "Сервер чата по хэштегам запущен\n";
    }
    
    /**
     * Когда новый клиент подключается к серверу
     */
    public function onOpen(ConnectionInterface $conn)
    {
        // Сохраняем новое соединение
        $this->clients->attach($conn);
        
        $conn->roomSubscriptions = [];
        
        echo "Новое соединение! ({$conn->resourceId})\n";
    }
    
    /**
     * Когда клиент отправляет сообщение серверу
     */
    public function onMessage(ConnectionInterface $from, $msg)
    {
        $data = json_decode($msg, true);
        
        if (!$data || !isset($data['type'])) {
            echo "Получено неверное сообщение\n";
            return;
        }
        
        echo "Получено сообщение типа {$data['type']} от {$from->resourceId}\n";
        
        switch ($data['type']) {
            case 'join':
                $this->handleJoinRoom($from, $data);
                break;
                
            case 'message':
                $this->handleMessage($from, $data);
                break;
                
            case 'typing':
                $this->handleTyping($from, $data);
                break;
                
            case 'leave':
                $this->handleLeaveRoom($from, $data);
                break;
        }
    }
    
    /**
     * Обработка входа пользователя в комнату чата
     */
    private function handleJoinRoom(ConnectionInterface $client, $data)
    {
        if (!isset($data['room']) || !isset($data['user_id']) || !isset($data['username'])) {
            return;
        }
        
        $room = $data['room'];
        $userId = $data['user_id'];
        $username = $data['username'];
        $avatar = $data['avatar'] ?? 'assets/images/default-avatar.svg';
        
        // Создаем комнату, если она не существует
        if (!isset($this->rooms[$room])) {
            $this->rooms[$room] = [
                'clients' => new \SplObjectStorage,
                'users' => []
            ];
        }
        
        // Добавляем клиента в комнату
        $this->rooms[$room]['clients']->attach($client);
        $client->roomSubscriptions[] = $room;
        
        // Сохраняем информацию о пользователе
        $client->userId = $userId;
        $client->username = $username;
        $client->avatar = $avatar;
        
        // Добавляем пользователя в список активных пользователей комнаты
        $this->rooms[$room]['users'][$userId] = [
            'username' => $username,
            'avatar' => $avatar,
            'resourceId' => $client->resourceId
        ];
        
        // Сохраняем связь ID пользователя с ресурсом соединения
        $this->userResourceMap[$userId] = $client->resourceId;
        
        // Отправляем уведомление всем в комнате о новом пользователе
        $this->broadcastToRoom($room, [
            'type' => 'user_joined',
            'room' => $room,
            'user_id' => $userId,
            'username' => $username,
            'avatar' => $avatar,
            'online_users' => count($this->rooms[$room]['users'])
        ]);
        
        // Отправляем клиенту список активных пользователей
        $client->send(json_encode([
            'type' => 'room_users',
            'room' => $room,
            'users' => array_values($this->rooms[$room]['users']),
            'online_count' => count($this->rooms[$room]['users'])
        ]));
        
        echo "Пользователь {$username} (ID: {$userId}) присоединился к комнате {$room}\n";
    }
    
    /**
     * Обработка сообщения в чате
     */
    private function handleMessage(ConnectionInterface $client, $data)
    {
        if (!isset($data['room']) || !isset($data['message'])) {
            return;
        }
        
        $room = $data['room'];
        $message = $data['message'];
        
        // Проверяем, подписан ли клиент на эту комнату
        if (!in_array($room, $client->roomSubscriptions)) {
            echo "Клиент не подписан на комнату {$room}\n";
            return;
        }
        
        // Создаем данные сообщения
        $messageData = [
            'type' => 'chat_message',
            'room' => $room,
            'user_id' => $client->userId,
            'username' => $client->username,
            'avatar' => $client->avatar,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Отправляем сообщение всем в комнате
        $this->broadcastToRoom($room, $messageData, $client);
        
        echo "Сообщение от {$client->username} в комнате {$room}: {$message}\n";
    }
    
    /**
     * Обработка уведомления о наборе текста
     */
    private function handleTyping(ConnectionInterface $client, $data)
    {
        if (!isset($data['room']) || !isset($data['isTyping'])) {
            return;
        }
        
        $room = $data['room'];
        $isTyping = $data['isTyping'];
        
        // Проверяем, подписан ли клиент на эту комнату
        if (!in_array($room, $client->roomSubscriptions)) {
            return;
        }
        
        // Отправляем уведомление всем в комнате, кроме отправителя
        $this->broadcastToRoom($room, [
            'type' => 'user_typing',
            'room' => $room,
            'user_id' => $client->userId,
            'username' => $client->username,
            'is_typing' => $isTyping
        ], $client);
    }
    
    /**
     * Обработка выхода пользователя из комнаты
     */
    private function handleLeaveRoom(ConnectionInterface $client, $data)
    {
        if (!isset($data['room'])) {
            return;
        }
        
        $room = $data['room'];
        
        // Проверяем, подписан ли клиент на эту комнату
        if (!in_array($room, $client->roomSubscriptions)) {
            return;
        }
        
        $this->removeClientFromRoom($client, $room);
    }
    
    /**
     * Удаление клиента из комнаты
     */
    private function removeClientFromRoom(ConnectionInterface $client, $room)
    {
        // Проверяем существование комнаты
        if (!isset($this->rooms[$room])) {
            return;
        }
        
        // Удаляем клиента из комнаты
        $this->rooms[$room]['clients']->detach($client);
        
        // Удаляем комнату из подписок клиента
        $roomIndex = array_search($room, $client->roomSubscriptions);
        if ($roomIndex !== false) {
            unset($client->roomSubscriptions[$roomIndex]);
        }
        
        // Удаляем пользователя из списка активных пользователей комнаты
        if (isset($client->userId) && isset($this->rooms[$room]['users'][$client->userId])) {
            unset($this->rooms[$room]['users'][$client->userId]);
            
            // Отправляем уведомление всем в комнате о выходе пользователя
            $this->broadcastToRoom($room, [
                'type' => 'user_left',
                'room' => $room,
                'user_id' => $client->userId,
                'username' => $client->username,
                'online_users' => count($this->rooms[$room]['users'])
            ]);
            
            echo "Пользователь {$client->username} (ID: {$client->userId}) покинул комнату {$room}\n";
        }
        
        // Удаляем комнату, если она пуста
        if (count($this->rooms[$room]['users']) === 0) {
            unset($this->rooms[$room]);
            echo "Комната {$room} удалена, так как стала пустой\n";
        }
    }
    
    /**
     * Отправка сообщения всем клиентам в комнате
     */
    private function broadcastToRoom($room, $data, $exclude = null)
    {
        if (!isset($this->rooms[$room])) {
            return;
        }
        
        $message = json_encode($data);
        
        foreach ($this->rooms[$room]['clients'] as $client) {
            // Исключаем отправителя, если задан
            if ($exclude !== null && $client == $exclude) {
                continue;
            }
            
            $client->send($message);
        }
    }
    
    /**
     * Когда клиент отключается от сервера
     */
    public function onClose(ConnectionInterface $conn)
    {
        // Удаляем клиента из всех комнат, на которые он подписан
        if (isset($conn->roomSubscriptions)) {
            foreach ($conn->roomSubscriptions as $room) {
                $this->removeClientFromRoom($conn, $room);
            }
        }
        
        // Удаляем связь ID пользователя с ресурсом соединения
        if (isset($conn->userId)) {
            unset($this->userResourceMap[$conn->userId]);
        }
        
        // Удаляем соединение из списка клиентов
        $this->clients->detach($conn);
        
        echo "Соединение {$conn->resourceId} закрыто\n";
    }
    
    /**
     * Обработка ошибок
     */
    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "Ошибка: {$e->getMessage()}\n";
        
        $conn->close();
    }
}

// Создаем и запускаем сервер
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new ChatServer()
        )
    ),
    8080 // Порт для WebSocket
);

echo "Сервер запущен на порту 8080\n";
$server->run(); 