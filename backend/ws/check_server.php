<?php
/**
 * Скрипт для проверки состояния WebSocket сервера
 */

// Включаем отображение всех ошибок для отладки
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Функция для проверки, запущен ли процесс
function isProcessRunning($processName) {
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        // Для Windows
        $output = [];
        exec('tasklist /FI "IMAGENAME eq ' . $processName . '" /NH', $output);
        return count($output) > 0 && !preg_match('/Информация: Нет задач, отвечающих данному критерию/', implode('', $output));
    } else {
        // Для Linux/Unix
        $output = [];
        exec('pgrep -f ' . $processName, $output);
        return count($output) > 0;
    }
}

// Функция для проверки, доступен ли порт
function isPortOpen($host, $port) {
    $connection = @fsockopen($host, $port, $errno, $errstr, 1);
    
    if (is_resource($connection)) {
        fclose($connection);
        return true;
    }
    
    return false;
}

// Проверяем, запущен ли сервер PHP
$phpRunning = isProcessRunning('php.exe');

// Проверяем, доступен ли порт 8080
$portOpen = isPortOpen('localhost', 8080);

// Проверяем статус сервиса Windows (если есть)
$serviceStatus = 'Неизвестно';
if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    exec('sc query WanderisChat', $serviceOutput);
    $serviceOutput = implode("\n", $serviceOutput);
    
    if (strpos($serviceOutput, 'RUNNING') !== false) {
        $serviceStatus = 'Работает';
    } elseif (strpos($serviceOutput, 'STOPPED') !== false) {
        $serviceStatus = 'Остановлен';
    } elseif (strpos($serviceOutput, 'не существует') !== false) {
        $serviceStatus = 'Не установлен';
    }
}

// Определяем общий статус
if ($portOpen) {
    $status = 'Работает';
    $statusClass = 'status-ok';
} else {
    $status = 'Не запущен';
    $statusClass = 'status-error';
}

// Отображаем HTML страницу с результатами
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Статус WebSocket сервера</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
        }
        .status-container {
            background-color: white;
            border-radius: 5px;
            padding: 20px;
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .status-item {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 4px;
            background-color: #f9f9f9;
        }
        .status-item span {
            font-weight: bold;
            margin-right: 10px;
        }
        .status-ok {
            color: green;
        }
        .status-error {
            color: red;
        }
        .status-warning {
            color: orange;
        }
        .actions {
            margin-top: 20px;
        }
        button {
            padding: 8px 15px;
            margin-right: 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background-color: #4CAF50;
            color: white;
        }
        button.stop {
            background-color: #f44336;
        }
        code {
            display: block;
            background-color: #f1f1f1;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-family: monospace;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <h1>Статус WebSocket сервера</h1>
    
    <div class="status-container">
        <div class="status-item">
            <span>Общий статус:</span> <span class="<?php echo $statusClass; ?>"><?php echo $status; ?></span>
        </div>
        
        <div class="status-item">
            <span>PHP процесс:</span> <span class="<?php echo $phpRunning ? 'status-ok' : 'status-warning'; ?>">
                <?php echo $phpRunning ? 'Запущен' : 'Не обнаружен'; ?>
            </span>
        </div>
        
        <div class="status-item">
            <span>Порт 8080:</span> <span class="<?php echo $portOpen ? 'status-ok' : 'status-error'; ?>">
                <?php echo $portOpen ? 'Открыт' : 'Закрыт'; ?>
            </span>
        </div>
        
        <?php if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN'): ?>
        <div class="status-item">
            <span>Статус службы Windows:</span> <span class="<?php echo $serviceStatus === 'Работает' ? 'status-ok' : 'status-warning'; ?>">
                <?php echo $serviceStatus; ?>
            </span>
        </div>
        <?php endif; ?>
    </div>
    
    <div class="status-container">
        <h2>Запуск сервера</h2>
        <p>Для ручного запуска сервера используйте команду:</p>
        <code>D:\xampp\php\php.exe server.php</code>
        
        <p>Или запустите batch-файл:</p>
        <code>start_chat_server.bat</code>
        
        <div class="actions">
            <button onclick="window.location.reload()">Обновить статус</button>
        </div>
    </div>
</body>
</html> 