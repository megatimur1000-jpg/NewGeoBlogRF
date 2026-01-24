# Move top-level markdown files to docs/archive
# Whitelist: keep these files at repo root
$root = Get-Location
$whitelist = @(
    'README.md',
    'ANALIZ_OFFLINE_REZHIMA.md',
    'FACADE_FIX_REPORT.md',
    'backend\README.md',
    'frontend\README.md'
)

$archiveDir = Join-Path $root 'docs\archive'
$backupDir = Join-Path $archiveDir 'backup'
if (-not (Test-Path $archiveDir)) { New-Item -ItemType Directory -Path $archiveDir | Out-Null }
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }

$moved = @()
Get-ChildItem -Path $root -Filter *.md -File | ForEach-Object {
    $name = $_.Name
    # Skip whitelist by name
    if ($whitelist -contains $name) { return }
    $src = $_.FullName
    $dest = Join-Path $archiveDir $name
    Move-Item -Path $src -Destination $dest -Force
    Copy-Item -Path $dest -Destination (Join-Path $backupDir $name) -Force
    $moved += ,@{Original = $src; New = $dest}
}

# Create INDEX.md
$indexPath = Join-Path $archiveDir 'INDEX.md'
"# Archive index`r`n`r`n" | Out-File -FilePath $indexPath -Encoding utf8
"Moved files:`r`n" | Out-File -FilePath $indexPath -Encoding utf8 -Append
foreach ($item in $moved) {
    ("- $($item.Original) -> $($item.New)") | Out-File -FilePath $indexPath -Encoding utf8 -Append
}

("`r`nBackup copies saved in: " + $backupDir) | Out-File -FilePath $indexPath -Encoding utf8 -Append

Write-Output ("Moved $($moved.Count) files to $archiveDir. INDEX created at $indexPath.")