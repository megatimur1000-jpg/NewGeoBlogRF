# Запуск проекта Best Site
Write-Host "🚀 Запуск проекта Best Site" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host ""
Write-Host "🛑 Останавливаем все процессы Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "⏳ Ждем 2 секунды для освобождения портов..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "🔧 Запускаем Backend сервер (порт 3002)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d D:\Best_Site\backend && npm start" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Ждем 5 секунд для запуска backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎨 Запускаем Frontend сервер (порт 5173)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d D:\Best_Site\frontend && npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Ждем 3 секунды для запуска frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Проект запущен!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Blue
Write-Host "🔧 Backend: http://localhost:3002" -ForegroundColor Blue
Write-Host ""
Write-Host "📝 Тестовые данные для входа:" -ForegroundColor Magenta
Write-Host "   Email: test@example.com" -ForegroundColor White
Write-Host "   Пароль: test123" -ForegroundColor White
Write-Host ""
Write-Host "Нажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
