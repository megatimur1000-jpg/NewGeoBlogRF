function update-progress {
    # подсчитываем статистику из todo файла
    $todo = get-content "todo_sonarqube.md" -raw
    
    $total = [regex]::matches($todo, "### ✅ ").count
    $done = [regex]::matches($todo, "📌 статус.*✅ выполнено").count
    $wip = [regex]::matches($todo, "📌 статус.*🟡 в работе").count
    
    $progress = if ($total -gt 0) { [math]::round(($done / $total) * 100) } else { 0 }
    
    # обновляем трекер
    $tracker = get-content "progress_tracker.md" -raw
    
    $tracker = $tracker -replace "всего проблем: \[autoupdate\]", "всего проблем: $total"
    $tracker = $tracker -replace "исправлено: \[autoupdate\]", "исправлено: $done"
    $tracker = $tracker -replace "прогресс: \[autoupdate\]%", "прогресс: $progress%"
    
    $tracker | out-file "progress_tracker.md" -encoding utf8
    
    write-host "прогресс обновлён: $done/$total ($progress%)"
}

function mark-task-done {
    param(
        [string]$tasknumber,
        [string]$filename,
        [string]$timespent
    )
    
    # обновляем todo
    $todo = get-content "todo_sonarqube.md" -raw
    $pattern = "(### ✅  $tasknumber.*?)(📌 статус: 🔴 не начато)"
    $replacement = "`$1📌 статус: ✅ выполнено`n**✅ дата выполнения:** $(get-date -format 'dd.mm.yyyy hh:mm')`n**⏱️ время затрачено:** $timespent"
    
    $todo = $todo -replace $pattern, $replacement
    $todo | out-file "todo_sonarqube.md" -encoding utf8
    
    # добавляем в трекер
    $newentry = "| $(get-date -format 'dd.mm.yyyy') | задача $tasknumber | $filename | средняя | $timespent |"
    
    $tracker = get-content "progress_tracker.md"
    $insertline = $tracker.indexof("| дата | задача | файл | сложность | время |") + 1
    
    $tracker[$insertline] = $newentry
    $tracker | out-file "progress_tracker.md" -encoding utf8
    
    write-host "задача $tasknumber отмечена как выполненная"
    update-progress
}
