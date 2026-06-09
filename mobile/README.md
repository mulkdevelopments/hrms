# HRMS Mobile (Expo / React Native)

Cross-platform (Android + iOS) employee app for the HRMS, built with **Expo + React Native + TypeScript**. It reuses the existing HRMS REST API.

## Features (v1)

- JWT login (same credentials as the web app), token stored in secure storage
- Dashboard: attendance status + leave balance snapshot
- Attendance: GPS-based check-in / check-out (geofence enforced by backend)
- Leave: matured balance, apply for leave, view your requests
- Notifications: derived alerts (attendance, pending leave, profile completeness)
- Profile: employee details + sign out

> Face verification for check-in is **phased for a later release**. If an employee's account has face auth enabled, the app shows a message asking them to use the web app (or have HR adjust the setting).

## Prerequisites

- Node.js 18+
- The [Expo Go](https://expo.dev/go) app on your phone (for quick testing), or Android Studio / Xcode for emulators

## Setup

```bash
cd mobile
npm install
# Align native deps to the installed Expo SDK (recommended):
npx expo install
# If the icon / camera / webview packages aren't present yet:
npx expo install react-native-webview expo-camera @expo/vector-icons
```

## Face verification (mobile)

Not included yet. A **real, native** on-device face recognition pipeline
(e.g. `react-native-vision-camera` + TensorFlow Lite / MobileFaceNet, or a cloud
face API) is planned for a later release and will require an Expo Dev Build.
For now, attendance uses geofence-based check-in/out. Accounts with face
verification enabled on the backend should check in via the web app until the
native flow lands.

## Configure the API endpoint

The API base URL lives in `app.json` under `expo.extra.apiBaseUrl`:

```json
"extra": { "apiBaseUrl": "https://hrms-app-dzsr.onrender.com/api" }
```

- For production, point it at your Render backend (default above).
- For local backend testing on a physical device, use your machine's LAN IP (not `localhost`), e.g. `http://192.168.1.10:4000/api`, and ensure the backend is reachable from the phone.

## Run

```bash
npm start          # opens Expo Dev Tools; scan QR with Expo Go
npm run android    # run on Android emulator/device
npm run ios        # run on iOS simulator (macOS only)
```

## Build (store / standalone)

Use EAS Build:

```bash
npm install -g eas-cli
eas login
eas build -p android   # APK/AAB
eas build -p ios        # requires an Apple Developer account
```

## Project structure

```
mobile/
  App.tsx                 # root: providers + navigation
  index.ts                # Expo entry
  app.json                # Expo config + apiBaseUrl + permissions
  src/
    api/client.ts         # fetch wrapper + secure token storage
    context/AuthContext.tsx
    navigation/RootNavigator.tsx
    components/ui.tsx      # shared UI primitives
    screens/               # Login, Dashboard, Attendance, Leave, Notifications, Profile
    theme.ts
    types.ts
```

## Notes

- Native apps are not subject to browser CORS, so the existing backend works without changes.
- Location permission is requested on first check-in; required for office geofence validation.
- Push notifications and face verification are planned for a future iteration.
