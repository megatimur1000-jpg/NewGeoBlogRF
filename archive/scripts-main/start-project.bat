@echo off
echo 🚀 Запуск проекта Best Site
echo ================================

echo.
echo 🛑 Останавливаем все процессы Node.js...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ⏳ Ждем 2 секунды для освобождения портов...
timeout /t 2 /nobreak >nul

echo.
echo 🔧 Запускаем Backend сервер (порт 3002)...
start "Backend Server" cmd /k "cd /d D:\Best_Site\backend && npm start"

echo.
echo ⏳ Ждем 5 секунд для запуска backend...
timeout /t 5 /nobreak >nul

echo.
echo 🎨 Запускаем Frontend сервер (порт 5173)...
start "Frontend Server" cmd /k "cd /d D:\Best_Site\frontend && npm run dev"

echo.
echo ⏳ Ждем 3 секунды для запуска frontend...
timeout /t 3 /nobreak >nul

echo.
echo ✅ Проект запущен!
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3002
echo.
echo 📝 Тестовые данные для входа:
echo    Email: test@example.com
echo    Пароль: test123
echo.
echo Нажмите любую клавишу для выхода...
pause >nul
