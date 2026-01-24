<?php
/**
 * Скрипт для добавления тестовых сообщений в чат
 */

// Включаем отображение всех ошибок для отладки
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Подключаем базу данных
require_once __DIR__ . '/../db.php';

echo "<h1>Добавление тестовых сообщений в чат</h1>";

// Проверяем подключение к базе данных
if (isset($db)) {
    echo "<p>Подключение к базе данных успешно.</p>";
    
    try {
        // Проверяем, есть ли уже сообщения в базе
        $stmt = $db->query("SELECT COUNT(*) FROM chat_messages");
        $messageCount = $stmt->fetchColumn();
        
        if ($messageCount == 0) {
            // Добавляем тестовые сообщения
            $testMessages = [
                [1, 'Походы', 'Привет всем! Кто-нибудь ходил в поход на Алтай?'],
                [2, 'Походы', 'Да, я был там в прошлом году. Очень красивые места!'],
                [1, 'Походы', 'Какой маршрут можешь порекомендовать для начинающих?'],
                [3, 'Еда', 'Подскажите хорошие рестораны в Питере с аутентичной русской кухней'],
                [4, 'Еда', 'Обязательно попробуйте "Русскую рюмочную №1" на Конюшенной площади'],
                [5, 'Города', 'Планирую поездку в Казань на 3 дня. Что обязательно стоит посмотреть?'],
                [6, 'Природа', 'Кто-нибудь был на Байкале? Какое лучшее время для посещения?'],
                [7, 'Культура', 'Подскажите интересные музеи в Москве, кроме стандартных туристических'],
                [8, 'Культура', 'Рекомендую Музей советских игровых автоматов и Музей ретро-автомобилей']
            ];
            
            $stmt = $db->prepare("
                INSERT INTO chat_messages (user_id, hashtag, message)
                VALUES (?, ?, ?)
            ");
            
            foreach ($testMessages as $message) {
                $stmt->execute($message);
            }
            
            echo "<p style='color: green;'>Добавлено " . count($testMessages) . " тестовых сообщений.</p>";
        } else {
            echo "<p>В базе уже есть " . $messageCount . " сообщений.</p>";
            
            // Выводим последние 5 сообщений
            echo "<h2>Последние сообщения:</h2>";
            $stmt = $db->query("
                SELECT 
                    cm.id, 
                    cm.user_id, 
                    cm.hashtag, 
                    cm.message, 
                    cm.created_at
                FROM 
                    chat_messages cm
                ORDER BY 
                    cm.created_at DESC
                LIMIT 5
            ");
            
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($messages) > 0) {
                echo "<table border='1' cellpadding='5'>";
                echo "<tr><th>ID</th><th>User ID</th><th>Hashtag</th><th>Message</th><th>Created At</th></tr>";
                
                foreach ($messages as $message) {
                    echo "<tr>";
                    echo "<td>" . htmlspecialchars($message['id']) . "</td>";
                    echo "<td>" . htmlspecialchars($message['user_id']) . "</td>";
                    echo "<td>" . htmlspecialchars($message['hashtag']) . "</td>";
                    echo "<td>" . htmlspecialchars($message['message']) . "</td>";
                    echo "<td>" . htmlspecialchars($message['created_at']) . "</td>";
                    echo "</tr>";
                }
                
                echo "</table>";
            } else {
                echo "<p>Сообщения не найдены.</p>";
            }
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'>Ошибка: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p style='color: red;'>Ошибка подключения к базе данных.</p>";
}
?> 