<?php
/**
 * Скрипт для создания таблиц чата напрямую без ввода из файла
 */

// Включаем отображение всех ошибок для отладки
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Подключаем базу данных
require_once '../db.php';

echo "<h1>Создание таблиц чата</h1>";

// Проверяем подключение к базе данных
if (isset($db)) {
    echo "<p>Подключение к базе данных успешно.</p>";
    
    try {
        // Создаем таблицу chat_rooms
        $db->exec("
            CREATE TABLE IF NOT EXISTS `chat_rooms` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `hashtag` varchar(100) NOT NULL,
              `title` varchar(255) NOT NULL,
              `description` text,
              `online_users` int(11) NOT NULL DEFAULT '0',
              `last_activity` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `is_private` tinyint(1) NOT NULL DEFAULT '0',
              PRIMARY KEY (`id`),
              UNIQUE KEY `hashtag` (`hashtag`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
        echo "<p style='color: green;'>Таблица chat_rooms успешно создана.</p>";
        
        // Создаем таблицу chat_messages
        $db->exec("
            CREATE TABLE IF NOT EXISTS `chat_messages` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `user_id` int(11) NOT NULL,
              `hashtag` varchar(100) NOT NULL,
              `message` text NOT NULL,
              `image_url` varchar(255) DEFAULT NULL,
              `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `reactions` json DEFAULT NULL,
              `last_read` datetime DEFAULT NULL,
              PRIMARY KEY (`id`),
              KEY `hashtag` (`hashtag`),
              KEY `user_id` (`user_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
        echo "<p style='color: green;'>Таблица chat_messages успешно создана.</p>";
        
        // Создаем таблицу для участников приватных чатов
        $db->exec("
            CREATE TABLE IF NOT EXISTS `chat_room_members` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `room_id` int(11) NOT NULL,
                `user_id` int(11) NOT NULL,
                `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `is_admin` tinyint(1) NOT NULL DEFAULT '0',
                PRIMARY KEY (`id`),
                UNIQUE KEY `room_user` (`room_id`, `user_id`),
                KEY `user_id` (`user_id`),
                CONSTRAINT `fk_room_members_room` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_room_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
        echo "<p style='color: green;'>Таблица chat_room_members успешно создана.</p>";
        
    } catch (PDOException $e) {
        echo "<p style='color: red;'>Ошибка при создании таблиц: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p style='color: red;'>Не удалось подключиться к базе данных.</p>";
}