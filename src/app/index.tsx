import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getCurrentWifiRssi } from "../features/wifi/wifiService";

export default function Index() {
  const [rssi, setRssi] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const [readCount, setReadCount] = useState(0);
  const [lastReadTime, setLastReadTime] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    return () => setRunning(false);
  }, []));

  const measureSignal = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError("");

    try {
      const value = await getCurrentWifiRssi();

      setRssi(value);
      setReadCount((count) => count + 1);
      setLastReadTime(new Date().toLocaleTimeString("pl-PL"));

      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Wystąpił nieznany błąd."
      );

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!running) return;

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      const success = await measureSignal();

      if (stopped) return;

      if (!success) {
        setRunning(false);
        return;
      }

      timer = setTimeout(tick, 1000);
    }

    void tick();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [running, measureSignal]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WiFi Mapper</Text>

      <Text style={styles.value}>
        {rssi === null ? "—" : `${rssi} dBm`}
      </Text>

      <Text>{running ? "🟢 Odczyt automatyczny" : "⚪ Odczyt zatrzymany"}</Text>

      <Button
        title="Zmierz raz"
        disabled={running || loading}
        onPress={() => {
          void measureSignal();
        }}
      />

      <Button
        title={running ? "Stop" : "Start"}
        disabled={loading && !running}
        onPress={() => setRunning((current) => !current)}
      />

      <View style={styles.indicator}>
        <Text>Udane odczyty: {readCount}</Text>
        <Text>Ostatni odczyt: {lastReadTime ?? "—"}</Text>
        {loading && <ActivityIndicator />}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  value: {
    fontSize: 42,
    fontWeight: "bold",
  },
  indicator: {
    alignItems: "center",
    gap: 8,
  },
  error: {
    color: "red",
    textAlign: "center",
  },
});
