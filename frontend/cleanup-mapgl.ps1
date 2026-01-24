#!/bin/pwsh
# Script to remove MapGL files

Write-Host "Removing MapGL/MapLibre components..." -ForegroundColor Yellow

# Files to delete
$filesToDelete = @(
    "src/components/Posts/MapLibreMap.tsx",
    "src/services/mapsGLLoader.ts",
    "src/services/map_facade/mapsglAdapter.ts",
    "src/services/map_facade/adapters/MarbleGLRenderer.ts"
)

$basePath = "d:\Best_Site\frontend\"

foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "OK: Deleted $file" -ForegroundColor Green
    } else {
        Write-Host "WARN: File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Removing dependencies from package.json..." -ForegroundColor Yellow

# Go to frontend folder
Push-Location "$basePath"

# Remove dependencies
npm uninstall maplibre-gl
npm uninstall "@vis.gl/react-maplibre"

# Reinstall
Write-Host ""
Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host "Now check build: npm run build" -ForegroundColor Cyan

Pop-Location
