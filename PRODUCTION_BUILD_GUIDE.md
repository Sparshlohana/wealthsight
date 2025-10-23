# Production Build Guide - Fixing Play Protect Warning

## The Issue
The "Not verified by Play Protect" warning appears because your release build was signed with the debug keystore instead of a proper production keystore.

## Solution Options

### Option 1: Let EAS Handle Signing (Recommended - Easiest)

This is the simplest approach. EAS will automatically create and manage your signing credentials.

1. **Delete any local keystores from your project** (keep debug.keystore if needed for local dev)

2. **Build with EAS:**
   ```powershell
   eas build --platform android --profile production
   ```

3. **When prompted**, choose to let EAS generate credentials for you:
   - Select: "Generate new keystore"
   - EAS will create and securely store your production keystore in the cloud

4. **Install the APK** - This will now be properly signed and won't show the Play Protect warning

**Advantages:**
- No manual keystore management
- Credentials stored securely in EAS
- Works across different machines
- Automatic credential handling

---

### Option 2: Use Your Own Keystore (More Control)

If you want to manage your own keystore:

#### Step 1: Generate a Production Keystore

```powershell
cd android\app
keytool -genkeypair -v -storetype PKCS12 -keystore wealthsight-upload.keystore -alias wealthsight -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for:
- Keystore password (remember this!)
- Key password (remember this!)
- Your name, organization, city, state, country

**IMPORTANT:** Store these passwords securely! You'll need them for all future builds.

#### Step 2: Configure EAS with Your Keystore

Create/update `android/app/eas-credentials.json`:

```json
{
  "android": {
    "keystore": {
      "keystorePath": "android/app/wealthsight-upload.keystore",
      "keystorePassword": "YOUR_KEYSTORE_PASSWORD",
      "keyAlias": "wealthsight",
      "keyPassword": "YOUR_KEY_PASSWORD"
    }
  }
}
```

**⚠️ SECURITY:** Add this file to `.gitignore` immediately!

#### Step 3: Update .gitignore

Add these lines to your `.gitignore`:
```
# Keystores
*.keystore
!debug.keystore
eas-credentials.json

# Gradle signing properties
android/gradle.properties.local
android/key.properties
```

#### Step 4: Build with EAS

```powershell
eas build --platform android --profile production
```

---

## Current Configuration Status

✅ **eas.json** - Updated to build APK format for production
✅ **build.gradle** - Updated to use proper release signing when available
✅ **Fallback** - Will use debug keystore only for local testing

## Building for Different Scenarios

### Production Build (Play Store or Direct Distribution)
```powershell
eas build --platform android --profile production
```

### Preview Build (Internal Testing)
```powershell
eas build --platform android --profile preview
```

### Local Build (Development)
```powershell
cd android
.\gradlew assembleRelease
```

## Verifying Your Build

After building with EAS, verify the signing:

```powershell
# Download your APK from EAS, then run:
keytool -printcert -jarfile path\to\your\app.apk
```

You should see your certificate details (not the Android debug certificate).

## Troubleshooting

### "App not installed" error
- Clear previous installations of the app
- Enable "Install unknown apps" for your browser/file manager
- Check if device has enough storage

### Still showing Play Protect warning
- Make sure you built with `--profile production`
- Verify signing credentials in EAS dashboard
- Check that you're not using the debug keystore

### Certificate fingerprint doesn't match
- You may have built with different keystores
- Uninstall the old version completely before installing the new one

## Important Notes

1. **Never commit keystores to Git** (except debug.keystore)
2. **Backup your keystore securely** - losing it means you can't update your app
3. **Keep passwords safe** - store in a password manager
4. **For Play Store:** You can use Play App Signing to let Google manage your keystore

## Next Steps

1. Choose Option 1 (EAS managed) or Option 2 (self-managed)
2. Build your production APK
3. Test the installation - the Play Protect warning should be gone
4. Upload to Play Store or distribute directly

## Play Store Submission

For Play Store, you'll also want to enable Play App Signing:
1. Go to Play Console → Your App → Setup → App Integrity
2. Enable Play App Signing
3. Upload your app signing key (or let Google generate one)

This adds an extra layer of security and allows Google to re-sign your app for different architectures.
