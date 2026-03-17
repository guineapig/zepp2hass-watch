# zepp2hass Watch App

An alternative ZeppOS 3.0 watch app for syncing health data from Amazfit watches to [Home Assistant](https://www.home-assistant.io/) via the [zepp2hass](https://github.com/davidepalleschi/zepp2hass) custom component by [Davide Palleschi](https://github.com/davidepalleschi).

> **Note**: This is an alternative watch app implementation, not a replacement for the original. The original [zepp2hass project](https://github.com/davidepalleschi/zepp2hass) includes both a Home Assistant custom component and its own watch app. This project provides only a watch app that works with the same Home Assistant component. It was created because the original watch app did not work on certain devices (Amazfit Balance 2).

## Features

- Background sync via alarm-based scheduling (no screen wake)
- Configurable sync interval (1, 2, 5, 10, 15, or 30 minutes)
- Manual sync from the watch UI
- Settings page in the Zepp app for webhook URL and interval

### Sensors

| Sensor | Data |
|---|---|
| Heart Rate | Last, resting, daily max |
| Steps | Current, target |
| Calories | Current, target |
| Distance | Current |
| Blood Oxygen | Last few hours (requires on-demand measurement) |
| Stress | Current value |
| Body Temperature | Current (requires on-demand measurement) |
| Sleep | Score, duration, deep sleep, sleeping status |
| PAI | Weekly total, daily |
| Fat Burning | Current, target |
| Standing | Current, target |
| Battery | Current level |
| Wearing Status | On/off wrist |
| Screen | Status, AOD mode, brightness |
| Workout | VO2 Max, training load, recovery time, history |
| Device Info | Name, source, resolution |
| User Profile | Age, height, weight, gender |

> Blood oxygen and body temperature only report data if you've recently taken a manual measurement on the watch. Workout data requires recorded workout sessions.

## Prerequisites

- **Home Assistant** with the [zepp2hass custom component](https://github.com/davidepalleschi/zepp2hass) installed
- **Zepp app** on your phone, logged in and paired with your watch
- An Amazfit watch running **ZeppOS 3.0+** (tested on Amazfit Balance 2)

## Setting Up Home Assistant

1. Install the [zepp2hass](https://github.com/davidepalleschi/zepp2hass) custom component in Home Assistant.
   - The easiest way is via [HACS](https://hacs.xyz/): search for "zepp2hass" and install it.
   - Alternatively, copy the `custom_components/zepp2hass` folder from the [zepp2hass repo](https://github.com/davidepalleschi/zepp2hass) into your Home Assistant `config/custom_components/` directory.
2. Restart Home Assistant.
3. Go to **Settings > Devices & Services > Add Integration** and search for **zepp2hass**.
4. Follow the setup flow. It will generate a **webhook URL** — copy this URL, you'll need it for the watch app settings.

## Installing the Watch App

### Option A: QR Code Install (recommended)

This is the easiest method and works on all platforms.

1. **Enable Developer Mode** in the Zepp app:
   - Open the Zepp app on your phone
   - Go to **Profile > Settings > About**
   - Tap the Zepp icon/version number **7 times** to enable developer mode
   - Go back to **Profile > Developer Mode** and toggle it on

2. **Install Node.js** (v16 or later) on your computer.

3. **Clone and build** the project:
   ```bash
   git clone https://github.com/MrCodeEU/zepp2hass-watch.git
   cd zepp2hass-watch
   npm install
   npx zeus build
   ```

4. **Generate a QR code** for installation:
   ```bash
   npx zeus preview
   ```
   This will display a QR code in your terminal.

5. **Scan the QR code** with the Zepp app:
   - In the Zepp app, go to **Profile > Developer Mode**
   - Tap the **+** or scan icon to scan a QR code
   - Scan the QR code from your terminal
   - The app will install on your watch

### Option B: Direct .zab Install

After building (`npx zeus build`), the `.zab` file is in the `dist/` folder. You can distribute this file and install it via the Zepp app's developer mode sideloading.

## Configuration

After installing the watch app:

1. Open the **Zepp app** on your phone.
2. Go to **Profile > My devices > [your watch] > App list > zepp2hass**.
3. Tap the **Settings** gear icon.
4. Enter your **Home Assistant webhook URL** (the one you copied during HA setup).
5. Choose your preferred **sync interval**.

The app will start syncing automatically in the background. Open the watch app to see the last sync time and status, or tap "Sync Now" for a manual sync.

## Architecture

```
Watch (ZeppOS)                    Phone (Zepp App)              Home Assistant
┌─────────────────┐              ┌─────────────────┐           ┌──────────────┐
│  app-service/   │  BLE/Message │  app-side/      │   HTTP    │  zepp2hass   │
│  sync.js        │─────────────>│  index.js       │──────────>│  component   │
│  (background)   │  Builder     │  (side service) │   POST    │  (webhook)   │
│                 │              │                 │           │              │
│  Sensors:       │              │  Settings:      │           │  Creates     │
│  HR, SpO2,      │              │  webhook_url    │           │  HA sensors  │
│  Steps, Sleep,  │              │  sync_interval  │           │  from JSON   │
│  Battery, etc.  │              │                 │           │  payload     │
└─────────────────┘              └─────────────────┘           └──────────────┘
        │
        │ Alarm API
        │ (schedules next run)
        └──> repeats every N minutes
```

- **`app-service/sync.js`** — Background service that collects sensor data and sends it via BLE MessageBuilder. Schedules the next sync via the Alarm API.
- **`app-side/index.js`** — Phone-side service that receives data via BLE and POSTs it to the Home Assistant webhook.
- **`setting/index.js`** — Settings UI in the Zepp phone app for configuring the webhook URL and sync interval.
- **`page/index.js`** — Watch UI showing sync status with a manual "Sync Now" button.
- **`shared/`** — MessageBuilder BLE communication library from the [official ZeppOS samples](https://github.com/nicklai0720/nicklai0720-ZeppOS_samples).

## Zepp App Store

Publishing to the Zepp App Store requires:

1. A [Zepp Developer account](https://developer.zepp.com/)
2. Passing the Zepp app review process
3. Providing screenshots, descriptions, and privacy policy documentation
4. The app must comply with Zepp's [developer guidelines](https://docs.zepp.com/docs/distribute/)

The review process typically takes a few days. The main consideration is that this app sends health data to an external server (your HA instance), which requires clear disclosure in the app description and privacy policy.

## Credits

- **[zepp2hass](https://github.com/davidepalleschi/zepp2hass)** by [Davide Palleschi](https://github.com/davidepalleschi) — the Home Assistant custom component that this watch app sends data to. Without this component, this watch app has nothing to talk to.
- **[ZeppOS Samples](https://github.com/nicklai0720/nicklai0720-ZeppOS_samples)** — the MessageBuilder BLE communication library used in this project is from the official ZeppOS sample code.
- Built with [ZeppOS 3.0 SDK](https://docs.zepp.com/)

## License

MIT — see [LICENSE](LICENSE).
