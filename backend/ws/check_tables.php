<?php
/**
 * Скрипт для проверки и создания таблиц чата
 */

// Включаем отображение всех ошибок для отладки
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Подключаем базу данных
require_once '../db.php';

// Функция для проверки существования таблицы
function tableExists($tableName) {
    global $db;
    try {
        $result = $db->query("SHOW TABLES LIKE '{$tableName}'");
        return $result->rowCount() > 0;
    } catch (Exception $e) {
        return false;
    }
}

// Функция для выполнения SQL-запросов из файла
function executeSqlFile($filename) {
    global $db;
    try {
        $sql = file_get_contents($filename);
        $queries = explode(';', $sql);
        
        foreach($queries as $query) {
            $query = trim($query);
            if (!empty($query)) {
                $db->exec($query);
            }
        }
        return true;
    } catch (Exception $e) {
        echo "Ошибка выполнения SQL: " . $e->getMessage() . "<br>";
        return false;
    }
}

echo "<h1>Проверка и создание таблиц чата</h1>";

// Проверяем подключение к базе данных
if (isset($db)) {
    echo "<p>Подключение к базе данных успешно.</p>";
    
    // Проверяем существование таблиц
    $chatTablesExist = tableExists('chat_rooms') && tableExists('chat_messages');
    
    if ($chatTablesExist) {
        echo "<p>Таблицы чата уже существуют.</p>";
        
        // Выводим структуру таблицы chat_messages
        echo "<h2>Структура таблицы chat_messages:</h2>";
        $stmt = $db->query("SHOW COLUMNS FROM chat_messages");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        
        foreach ($columns as $column) {
            echo "<tr>";
            foreach ($column as $key => $value) {
                echo "<td>" . ($value === null ? 'NULL' : htmlspecialchars($value)) . "</td>";
            }
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Проверяем наличие столбца hashtag
        $hasHashtagColumn = false;
        foreach ($columns as $column) {
            if ($column['Field'] === 'hashtag') {
                $hasHashtagColumn = true;
                break;
            }
        }
        
        if (!$hasHashtagColumn) {
            echo "<p style='color: red;'>Столбец 'hashtag' отсутствует в таблице chat_messages!</p>";
            echo "<p>Добавляем столбец 'hashtag'...</p>";
            
            try {
                $db->exec("ALTER TABLE chat_messages ADD COLUMN hashtag VARCHAR(100) NOT NULL AFTER user_id");
                echo "<p style='color: green;'>Столбец 'hashtag' успешно добавлен.</p>";
            } catch (Exception $e) {
                echo "<p style='color: red;'>Ошибка добавления столбца: " . $e->getMessage() . "</p>";
            }
        }
    } else {
        echo "<p>Таблицы чата не найдены. Создаем таблицы...</p>";
        
        // Создаем таблицы из SQL-файла
        if (executeSqlFile('chat_tables.sql')) {
            echo "<p style='color: green;'>Таблицы успешно созданы.</p>";
        } else {
            echo "<p style='color: red;'>Ошибка создания таблиц.</p>";
        }
    }
} else {
    echo "<p style='color: red;'>Ошибка подключения к базе данных.</p>";
}
?> 