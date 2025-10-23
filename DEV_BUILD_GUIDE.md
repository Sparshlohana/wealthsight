# Development Build Setup Guide

To enable SMS import on Android, you need to run a **Development Build** (custom dev client) instead of Expo Go. This guide covers two approaches: **EAS Build (cloud)** and **Local Build**.

---

## Prerequisites

✅ **Already done:**
- `expo-dev-client` installed
- `react-native-get-sms-android` installed
- Android permissions configured in `app.json`

---

## Option 1: EAS Build (Recommended - No Android Studio Required)

This builds your app in the cloud and gives you an APK/AAB to install on your device.

### Step 1: Install EAS CLI globally

```powershell
npm install -g eas-cli
```

### Step 2: Log in to your Expo account

```powershell
eas login
```

If you don't have an Expo account, create one at [expo.dev](https://expo.dev).

### Step 3: Configure EAS Build

```powershell
eas build:configure
```

This creates an `eas.json` file. The default configuration should work fine.

### Step 4: Build the development client for Android

```powershell
eas build -p android --profile development
```

**What happens:**
- EAS uploads your code to the cloud
- Builds a development APK/AAB (includes all native modules like SMS reader)
- Takes ~5-15 minutes
- You'll get a download link when it's done

### Step 5: Install the APK on your device

**Options:**
- Scan the QR code shown in terminal (opens download link)
- Or manually download from the Expo dashboard
- Transfer the APK to your Android device and install it

**Note:** You may need to enable "Install from unknown sources" in Android settings.

### Step 6: Run the development server

```powershell
npx expo start --dev-client
```

### Step 7: Open the app

- Launch the dev client app you just installed (named "WealthSight")
- It will connect to your Metro bundler
- Tap "Import from SMS (Android)" and grant READ_SMS permission

---

## Option 2: Local Build (Requires Android Studio)

Build the app locally on your Windows machine.

### Prerequisites

1. **Android Studio** installed with:
   - Android SDK
   - Android SDK Platform-Tools
   - Android Emulator (optional)

2. **Environment variables** set:
   - `ANDROID_HOME` (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
   - Add to PATH: `%ANDROID_HOME%\platform-tools`

### Step 1: Generate native Android project

```powershell
npx expo prebuild
```

This creates an `android/` folder with the full native project.

### Step 2: Build and run on device/emulator

**Option A: Use Expo CLI (easier)**
```powershell
npx expo run:android
```

**Option B: Use Android Studio**
1. Open `android/` folder in Android Studio
2. Wait for Gradle sync
3. Connect your Android device via USB (enable USB debugging)
4. Click Run ▶️

### Step 3: The app will install and launch automatically

The Metro bundler starts automatically when you use `expo run:android`.

---

## Verify It's Working

Once your development build is running:

1. Go to Home screen
2. Tap **"Import from SMS (Android)"**
3. Grant READ_SMS permission when prompted
4. Check your terminal for debug logs like:
   ```
   [SMS] Read 200 inbox messages (showing 5 samples)
   [SMS] #1 date=... body=...
   [SMS] Parsed 15 transactions from messages
   ```
5. You should see an alert: "Imported N transactions"

---

## Troubleshooting

### "SMS Import Unavailable" still showing
- ✅ Confirm you're running the **development build** (not Expo Go)
- ✅ Check that `react-native-get-sms-android` is in `package.json`
- ✅ Rebuild if you added the package after building

### Permission denied
- Grant READ_SMS permission when the system prompts
- Or go to Android Settings → Apps → WealthSight → Permissions → SMS

### Build fails
- **EAS**: Check the build logs in Expo dashboard
- **Local**: Ensure `ANDROID_HOME` is set correctly
- Try: `cd android && ./gradlew clean` then rebuild

### No logs appearing
- Ensure you're watching the terminal where you ran `npx expo start`
- Or use ADB: `adb logcat | Select-String -Pattern "\[SMS\]"`

---

## Key Differences: Dev Client vs Expo Go

| Feature | Expo Go | Dev Client |
|---------|---------|------------|
| SMS Reading | ❌ Not supported | ✅ Supported |
| Native modules | Only built-in | Any npm package |
| Build required | No | Yes (one-time) |
| Update speed | Instant | Fast (JS-only changes) |

---

## Next Steps

After your dev client is installed:
- JS/TS changes reload instantly (like Expo Go)
- Native changes (new packages) require a rebuild
- Publish updates with `eas update` (for production builds)

---

## Quick Reference

```powershell
# Cloud build (recommended)
eas build -p android --profile development
npx expo start --dev-client

# Local build
npx expo prebuild
npx expo run:android

# View logs
npx expo start --dev-client  # Watch this terminal
# Or: adb logcat | Select-String -Pattern "\[SMS\]"
```
