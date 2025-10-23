# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Android SMS import (Development Build)

Reading the SMS inbox is not supported in Expo Go. To enable the "Import from SMS" feature on Android, build a development client with a native SMS reader.

Steps (Windows PowerShell):

1. Install packages

   ```powershell
   npx expo install expo-dev-client
   npm install react-native-get-sms-android
   ```

2. Ensure Android permissions are present

   app.json already includes:

   - android.permissions: ["READ_SMS", "RECEIVE_SMS"]

3. Build a development client

   Using EAS (recommended):

   ```powershell
   npx eas login
   npx eas build:configure
   npx eas build -p android --profile development
   ```

   After it finishes, install the .apk/.aab on your device/emulator.

   Local build (optional alternative):

   ```powershell
   npx expo prebuild
   npx expo run:android
   ```

4. Run the app with the dev client

   ```powershell
   npx expo start --dev-client
   ```

Now the Import from SMS (Android) button will scan your inbox. If nothing imports, ensure:

- You granted the READ_SMS permission when prompted.
- You’re running the development build (not Expo Go).
- You have recent bank/UPI messages in your inbox.
