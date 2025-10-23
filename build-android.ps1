# Android Build Script for WealthSight
# Run this script to build the Android APK locally

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('debug', 'release')]
    [string]$BuildType = 'release'
)

Write-Host "Building Android APK ($BuildType)..." -ForegroundColor Cyan

# Navigate to android directory
Set-Location android

if ($BuildType -eq 'debug') {
    ./gradlew assembleDebug
    $apkPath = "app/build/outputs/apk/debug/app-debug.apk"
} else {
    ./gradlew assembleRelease
    $apkPath = "app/build/outputs/apk/release/app-release.apk"
}

# Go back to root
Set-Location ..

if (Test-Path "android/$apkPath") {
    Write-Host "`nBuild successful!" -ForegroundColor Green
    Write-Host "APK location: android/$apkPath" -ForegroundColor Yellow
    
    # Copy to root for easy access
    Copy-Item "android/$apkPath" "app-$BuildType.apk" -Force
    Write-Host "APK copied to: app-$BuildType.apk" -ForegroundColor Yellow
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
}
