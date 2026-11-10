import { PermissionsAndroid } from "react-native";
import WifiManager from "react-native-wifi-reborn";

export async function getCurrentWifiRssi(): Promise<number> {
  const permission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  const alreadyGranted = await PermissionsAndroid.check(permission);

  if (!alreadyGranted) {
    const result = await PermissionsAndroid.request(permission);

    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error("Nie przyznano uprawnienia lokalizacji.");
    }
  }

  const rssi = await WifiManager.getCurrentSignalStrength();

  if (!Number.isFinite(rssi) || rssi === -127) {
    throw new Error("Telefon nie udostępnił wartości RSSI.");
  }

  return rssi;
}