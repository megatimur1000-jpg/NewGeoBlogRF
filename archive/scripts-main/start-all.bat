@echo off
echo 🚀 Запускаем все серверы проекта...

echo.
echo 📦 Активируем виртуальное окружение Python...
call .venv\Scripts\activate.bat

echo.
echo 🗄️ Запускаем PostgreSQL...
net start postgresql-x64-15

echo.
echo ⏳ Ждем 3 секунды для запуска PostgreSQL...
timeout /t 3 /nobreak > nul

echo.
echo 🔧 Запускаем backend сервер...
start "Backend Server" cmd /k "cd backend && npm start"

echo.
echo ⏳ Ждем 5 секунд для запуска backend...
timeout /t 5 /nobreak > nul

echo.
echo 🎨 Запускаем frontend сервер...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Все серверы запущены!
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3002
echo 🗄️ PostgreSQL: localhost:5432
echo.
echo Нажмите любую клавишу для выхода...
pause > nul







































