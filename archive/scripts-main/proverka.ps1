# scripts/check-all.ps1
Write-Host "=== ПРОВЕРКА ПРОЕКТА ===" -ForegroundColor Cyan

Write-Host "`n1. 🎨 ФРОНТЕНД (npm run dev):" -ForegroundColor Yellow
$frontend = npm run dev 2>&1
if ($frontend -match "error|Error|ERROR") {
    $frontend | Select-String "error|Error|ERROR" | Select -First 3
} else {
    Write-Host "✅ Ошибок не найдено" -ForegroundColor Green
}

Write-Host "`n2. ⚙️  БЭКЕНД (npm start):" -ForegroundColor Yellow  
$backend = npm start 2>&1
if ($backend -match "error|Error|ERROR") {
    $backend | Select-String "error|Error|ERROR" | Select -First 3
} else {
    Write-Host "✅ Ошибок не найдено" -ForegroundColor Green
}

Write-Host "`n=== ГОТОВО ===" -ForegroundColor Cyan