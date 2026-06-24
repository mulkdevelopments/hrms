# HRMS Mobile (Expo / React Native)

Cross-platform (Android + iOS) employee app for the HRMS, built with **Expo + React Native + TypeScript**. It reuses the existing HRMS REST API.

## Features

- JWT login (same credentials as the web app), token stored in secure storage
- Dashboard: attendance status + leave balance snapshot
- Attendance: GPS-based check-in / check-out (geofence enforced by backend), **fingerprint / Face ID** before check-in, **face verification** (same engine as web)
- **Leave:** apply with acting colleague, air ticket preview, extended leave fields (rejoin, balances, remark)
- **Leave tabs:** My Leaves, date-range History, Pending Approvals (managers/HR), Excel/PDF Reports (managers/HR)
- **Profile:** full employee master fields (org, payroll, allowances, visa)
- **HR Tools (HR/admin):** browse employees, per-employee PDF reports with section picker, Excel import (master + leave)
- Notifications: derived alerts (attendance, pending leave, profile completeness)

## Face verification (mobile)

Uses the **native front camera** (`expo-camera`). Photos are sent to the backend, which runs the same face-api models as the web app and returns a `faceVerificationToken`. Enrollment on web still works on mobile and vice versa.

Flow:
1. **Enroll Face** — capture Front, Left, Right selfies
2. **Check In / Out** — capture one selfie; server verifies and issues a token

Requires camera permission. Backend downloads face models on first use (needs network once).

## Biometric check-in

- Node.js 18+
- The [Expo Go](https://expo.dev/go) app on your phone (for quick testing), or Android Studio / Xcode for emulators

## Setup

```bash
cd mobile
npm install
# Align native deps to the installed Expo SDK (recommended):
npx expo install
# If optional native packages aren't present yet:
npx expo install expo-camera @expo/vector-icons
```

## Biometric check-in

Check-in prompts for **fingerprint**, **Face ID**, or your **lock screen passcode** (when biometrics are not enrolled) via `expo-local-authentication`.

## Prerequisites

The API base URL lives in `app.json` under `expo.extra.apiBaseUrl`:

```json
"extra": { "apiBaseUrl": "https://api.mulkinternational.co/api" }
```

- For production, point it at your Render backend (default above).
- For local backend testing on a physical device, use your machine's LAN IP (not `localhost`), e.g. `http://192.168.1.10:4000/api`, and ensure the backend is reachable from the phone.

## Run

```bash
npm start          # LAN mode (phone must reach your Mac on Wi‑Fi)
npm run start:usb  # Android + USB cable (requires adb)
npm run start:tunnel  # needs NGROK_AUTHTOKEN — see below
npm run web        # test in browser (no phone needed)
npm run android    # Android emulator on this Mac
npm run ios        # iOS simulator (macOS only)
```

### Expo Go: “Failed to download remote update”

The app code and Metro bundler are fine — the phone cannot reach `exp://192.168.1.4:8081`.

**Option A — Fix Wi‑Fi (LAN)**
- Phone and Mac on the **same Wi‑Fi** (not guest / isolated network)
- Turn off VPN on both devices
- macOS **System Settings → Network → Firewall** → allow **Node** or **Terminal** incoming connections
- Stop Expo (`Ctrl+C`), run `npm start`, scan the **new** QR code

**Option B — USB (Android, most reliable)**
1. Enable USB debugging on the phone, connect via cable
2. Install [Android platform-tools](https://developer.android.com/tools/releases/platform-tools) (`adb`)
3. `npm run start:usb`
4. In Expo Go, open **`exp://127.0.0.1:8081`**

**Option C — Tunnel (when LAN is blocked)**
```bash
# Free token from https://dashboard.ngrok.com/get-started/your-authtoken
export NGROK_AUTHTOKEN=your_token_here
npm run start:tunnel
```

**Option D — No phone**
```bash
npm run web
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
    navigation/types.ts
    components/ui.tsx
    components/SegmentTabs.tsx
    components/LeaveRequestCard.tsx
    components/EmployeeProfileView.tsx
    lib/roles.ts
    lib/format.ts
    screens/               # Login, Dashboard, Attendance, Leave, Notifications, Profile
    screens/leave/         # Leave tab panels
    screens/EmployeesScreen.tsx
    screens/EmployeeDetailScreen.tsx
    screens/HrToolsScreen.tsx
    theme.ts
    types.ts
```

## Notes

- Native apps are not subject to browser CORS, so the existing backend works without changes.
- Location permission is requested on first check-in; required for office geofence validation.
- Push notifications and face verification are planned for a future iteration.
