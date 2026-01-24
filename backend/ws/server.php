<?php
/**
 * Запуск WebSocket сервера
 * 
 * Запускает чат-сервер на указанном порту
 * Использование: php server.php
 */

// Загружаем автозагрузчик Composer
require __DIR__ . '/vendor/autoload.php';

// Подключаем файл с классом сервера
require_once 'chat_server.php';

// Импортируем необходимые классы
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

// Порт для WebSocket сервера (по умолчанию 8080)
$port = 8080;

// Адрес для привязки (0.0.0.0 означает прослушивание на всех интерфейсах)
$host = '0.0.0.0';

// Создаем экземпляр сервера чата
$chatServer = new ChatServer();

// Создаем WebSocket сервер
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            $chatServer
        )
    ),
    $port,
    $host
);

echo "Сервер запущен на $host:$port\n";

// Запускаем сервер
$server->run(); 