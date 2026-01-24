# Скрипт запуска международного парсера маркеров
Write-Host "🌍 Запуск международного парсера маркеров" -ForegroundColor Blue
Write-Host ""

# Переходим в директорию скрипта
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Запускаем парсер
node international-parser.js

# Пауза для просмотра результата
Write-Host ""
Write-Host "Нажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
