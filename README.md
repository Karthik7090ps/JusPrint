# Jusprint - Student Super App

A cross-platform React Native application for smart printing, student marketplace, and community features.

## Prerequisites
- **Node.js** (v18 or newer)
- **Java Development Kit (JDK)** (v17 recommended for React Native 0.73+)
- **Android Studio** (for Android) with Android SDK and Virtual Device installed.
- **Xcode** (for iOS, macOS only) with CocoaPods (`sudo gem install cocoapods`).

## Getting Started

### 1. Install Dependencies
Open a terminal in the project folder and run:
```bash
npm install
```

### 2. Start the Metro Bundler
Start the JavaScript bundler in a dedicated terminal:
```bash
npm start
```
*Press `a` to run on Android or `i` to run on iOS from this terminal as a shortcut, or proceed to the next step.*

### 3. Run on Android
Make sure you have an Android Emulator running or a physical device connected (with USB Debugging enabled).
```bash
npm run android
# OR
npx react-native run-android
```

### 4. Run on iOS (macOS only)
Install pods first:
```bash
cd ios && pod install && cd ..
```
Then build the simulator:
```bash
npm run ios
# OR
npx react-native run-ios
```

## detailed Troubleshooting
- **"JAVA_HOME is not set"**: Set your `JAVA_HOME` environment variable to your JDK installation path.
- **"SDK location not found"**: Create a `local.properties` file in the `android/` directory with `sdk.dir=/path/to/android/sdk`.
- **"Metro not connecting"**: Run `adb reverse tcp:8081 tcp:8081` for Android.

## Project Structure
- `src/screens`: UI Screens (Printing, Marketplace, etc.)
- `src/components`: Reusable UI components.
- `src/navigation`: Navigation configuration.
- `src/store`: Redux Toolkit setup.
