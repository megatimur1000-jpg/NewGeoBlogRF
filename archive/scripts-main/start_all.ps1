Write-Host "🚀 ЗАПУСК ВСЕЙ СИСТЕМЫ" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# 1. Настройка
Write-Host "`n1. НАСТРОЙКА..." -ForegroundColor Yellow
.\scripts\setup.ps1

# 2. Получение проблем
Write-Host "`n2. ПОЛУЧЕНИЕ ПРОБЛЕМ..." -ForegroundColor Yellow
.\scripts\get-sonar-issues.ps1

# 3. Открываем todo
Write-Host "`n3. ОТКРЫВАЕМ СПИСОК ЗАДАЧ..." -ForegroundColor Yellow
code sonar_automation\todo_sonarqube.md

Write-Host "`n✅ ГОТОВО! Выбери задачу из todo_sonarqube.md" -ForegroundColor Green
Write-Host "🔧 Для исправления задачи #X выполни:" -ForegroundColor White
Write-Host "   .\scripts\fix-helper.ps1 -taskNumber X" -ForegroundColor Gray