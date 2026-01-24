@echo off
echo 🚀 Быстрый запуск frontend и backend...

echo.
echo 🔧 Запускаем backend...
start "Backend" cmd /k "cd backend && npm start"

echo.
echo ⏳ Ждем 3 секунды...
timeout /t 3 /nobreak > nul

echo.
echo 🎨 Запускаем frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Серверы запущены!
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3002
echo.
pause







































