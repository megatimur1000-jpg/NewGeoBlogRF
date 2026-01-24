# Решение проблем с бэкендом

## Проблема: npm start не дает быстрой и полной загрузки компонентов

### Текущая конфигурация
- **Node.js**: v20.19.0 ✅ (требуется >=18.0.0)
- **npm**: 10.8.2 ✅ (требуется >=9.0.0)
- **Версия в package.json**: указана как >=18.0.0

### Шаги по исправлению

#### 1. Проверка версии Node.js
```bash
node --version
```
Должно быть >=18.0.0. У вас 20.19.0 - это нормально.

#### 2. Очистка и переустановка зависимостей
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

Для Windows PowerShell:
```powershell
cd backend
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
```

#### 3. Проверка переменных окружения
Убедитесь, что файл `.env` существует в папке `backend/` и содержит все необходимые переменные:
- `SERVER_PORT` (по умолчанию 3002)
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- И другие необходимые переменные

#### 4. Проверка базы данных
Убедитесь, что PostgreSQL запущен и доступен:
```bash
# Проверка подключения к БД
psql -U your_user -d your_database -c "SELECT version();"
```

#### 5. Запуск сервера
```bash
cd backend
npm start
```

#### 6. Если проблемы сохраняются

**Проверка логов:**
- Сервер должен выводить логи в консоль
- Проверьте наличие ошибок при запуске

**Проверка порта:**
- Убедитесь, что порт 3002 не занят другим процессом
- Измените порт в `.env` если необходимо

**Проверка зависимостей:**
```bash
npm list --depth=0
```
Все зависимости должны быть установлены без ошибок.

### Обновление до Node.js 22+ (опционально)

Если вы хотите обновить Node.js до версии 22+:

#### Для Windows (используя nvm-windows):
1. Скачайте nvm-windows: https://github.com/coreybutler/nvm-windows/releases
2. Установите nvm-windows
3. Откройте новый терминал и выполните:
```bash
nvm install 22
nvm use 22
node --version  # должно показать v22.x.x
```

#### Затем переустановите зависимости:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Полезные команды

```bash
# Проверка версий
node --version
npm --version

# Очистка кэша npm
npm cache clean --force

# Проверка установленных пакетов
npm list --depth=0

# Запуск с отладкой
NODE_OPTIONS='--trace-warnings' npm start

# Проверка синтаксиса server.js
node --check server.js
```

### Контакты
Если проблема не решена, проверьте:
1. Логи сервера при запуске
2. Файл `.env` на наличие всех переменных
3. Подключение к базе данных
4. Версию Node.js и npm

