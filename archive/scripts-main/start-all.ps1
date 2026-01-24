# 🚀 Скрипт для запуска всех серверов проекта
Write-Host "🚀 Запускаем все серверы проекта..." -ForegroundColor Green

# Активируем виртуальное окружение Python
Write-Host "`n📦 Активируем виртуальное окружение Python..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Запускаем PostgreSQL
Write-Host "`n🗄️ Запускаем PostgreSQL..." -ForegroundColor Yellow
try {
    Start-Service postgresql-x64-15
    Write-Host "✅ PostgreSQL запущен" -ForegroundColor Green
} catch {
    Write-Host "⚠️ PostgreSQL уже запущен или не найден" -ForegroundColor Yellow
}

# Ждем запуска PostgreSQL
Write-Host "`n⏳ Ждем 3 секунды для запуска PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Запускаем backend
Write-Host "`n🔧 Запускаем backend сервер..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -WindowStyle Normal

# Ждем запуска backend
Write-Host "`n⏳ Ждем 5 секунд для запуска backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Запускаем frontend
Write-Host "`n🎨 Запускаем frontend сервер..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "`n✅ Все серверы запущены!" -ForegroundColor Green
Write-Host "`n🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:3002" -ForegroundColor Cyan
Write-Host "🗄️ PostgreSQL: localhost:5432" -ForegroundColor Cyan

Write-Host "`nНажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")







































