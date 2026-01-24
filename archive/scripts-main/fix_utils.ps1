function prepare-for-fix {
    param(
        [string]$filename,
        [int]$linenumber
    )
    
    # 1. создаём бэкап
    $backupname = "backup\$(get-date -format 'yyyy-mm-dd-hhmmss')-$($filename -replace '[\\\/]', '-')"
    copy-item $filename $backupname -force
    
    # 2. получаем контекст кода (3 строки до и после)
    $content = get-content $filename
    $start = [math]::max(1, $linenumber - 3)
    $end = [math]::min($content.count, $linenumber + 3)
    $context = $content[($start-1)..($end-1)] -join "`n"
    
    # 3. создаём файл для работы
    @"
# С: $filename (строка $linenumber)

## ТСТ:
\```javascript
$context
\```

##   SONARQUBE:
[вставить описание проблемы]

## ТЯ:
1. ✅ не ломать существующую логику
2. ✅ добавить обработку ошибок
3. ✅ улучшить читаемость кода
4. ✅ покрыть тестами если возможно

## Ш:
1. открыть файл в vs code
2. перейти на строку $linenumber
3. выделить проблемный код
4. использовать copilot с командой выше
5. проверить результат
6. запустить тесты
7. сохранить изменения

##  Я COPILOT:
"исправь [тип проблемы] в этом коде, сохраняя функциональность:
[вставить проблемный код]"
"@ | out-file "work_in_progress.md" -encoding utf8
    
    write-host "готово к работе с $filename:$linenumber"
    write-host "бэкап создан: $backupname"
    write-host "контекст сохранён в work_in_progress.md"
}

# пример использования
# prepare-for-fix "src\auth.js" 42
