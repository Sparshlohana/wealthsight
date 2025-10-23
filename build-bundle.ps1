# Android App Bundle Build Script
# AAB files are smaller and optimized for Google Play Store

Write-Host "Building Android App Bundle (AAB)..." -ForegroundColor Cyan

# Navigate to android directory
Set-Location android

# Build the bundle
./gradlew bundleRelease

# Go back to root
Set-Location ..

$aabPath = "android/app/build/outputs/bundle/release/app-release.aab"

if (Test-Path $aabPath) {
    Write-Host "`nBuild successful!" -ForegroundColor Green
    Write-Host "AAB location: $aabPath" -ForegroundColor Yellow
    
    # Copy to root for easy access
    Copy-Item $aabPath "app-release.aab" -Force
    Write-Host "AAB copied to: app-release.aab" -ForegroundColor Yellow
    
    # Show file size
    $size = [math]::Round((Get-Item $aabPath).Length / 1MB, 2)
    Write-Host "File size: $size MB" -ForegroundColor Cyan
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
}
