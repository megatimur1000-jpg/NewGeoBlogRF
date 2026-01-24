# 🛑 Скрипт для остановки всех серверов проекта
Write-Host "🛑 Останавливаем все серверы проекта..." -ForegroundColor Red

# Останавливаем Node.js процессы
Write-Host "`n🔧 Останавливаем Node.js процессы..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Node.js процессы остановлены" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Node.js процессы не найдены" -ForegroundColor Gray
}

# Останавливаем PostgreSQL
Write-Host "`n🗄️ Останавливаем PostgreSQL..." -ForegroundColor Yellow
try {
    Stop-Service postgresql-x64-15 -Force
    Write-Host "✅ PostgreSQL остановлен" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ PostgreSQL не запущен или не найден" -ForegroundColor Gray
}

Write-Host "`n✅ Все серверы остановлены!" -ForegroundColor Green

Write-Host "`nНажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")







































