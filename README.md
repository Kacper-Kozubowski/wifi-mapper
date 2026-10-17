# WiFi Mapper

An Android application for measuring Wi-Fi signal strength and visualizing wireless coverage in an apartment using a heatmap.

## Project Plan

1. **2D Floor Plan Editor** - Create a simple apartment layout directly in the app by drawing rooms and walls.
2. **Wi-Fi Measurements** - Read the signal strength (RSSI, in dBm) of the connected Wi-Fi network and let users place measurements on the floor plan.
3. **Heatmap Generation** - Estimate signal strength between measurement points using inverse distance weighting (IDW) and display a color-coded heatmap over the floor plan.
4. **Save and Review** - Store floor plans and measurement sessions locally so users can revisit their results.

## Planned Tech Stack

- **React Native + Expo** - Android app development
- **TypeScript** - Application logic and type safety
- **Expo Router** - Navigation
- **React Native WiFi Reborn** - Access to Wi-Fi signal information on Android
- **React Native Skia** - 2D floor plan editor and heatmap rendering
- **Expo SQLite** - Local storage
- **IDW interpolation** - Heatmap generation
