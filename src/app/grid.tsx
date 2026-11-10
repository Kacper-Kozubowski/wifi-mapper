import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getCurrentWifiRssi } from "../features/wifi/wifiService";

const GRID_SIZE = 5;
const READ_INTERVAL_MS = 3000;
const SAMPLE_COUNTS = [1, 3, 5, 10];

type Measurement = { rssi: number; count: number };

export default function GridScreen() {
  const [cells, setCells] = useState<(Measurement | null)[]>(
    () => Array(GRID_SIZE * GRID_SIZE).fill(null)
  );
  const [sampleCount, setSampleCount] = useState(1);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const measurementId = useRef(0);
  const busy = useRef(false);

  const cancelMeasurement = useCallback(() => {
    measurementId.current += 1;
    busy.current = false;
    setActiveCell(null);
  }, []);

  useFocusEffect(useCallback(() => cancelMeasurement, [cancelMeasurement]));

  async function measureCell(index: number) {
    if (busy.current) return;
    if (deleting) {
      setCells((current) => current.map((cell, i) => i === index ? null : cell));
      return;
    }

    busy.current = true;
    const id = ++measurementId.current;
    setActiveCell(index);
    setProgress(0);
    setError("");

    try {
      let sum = 0;
      for (let i = 0; i < sampleCount; i += 1) {
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, READ_INTERVAL_MS));
        }
        if (id !== measurementId.current) return;
        const rssi = await getCurrentWifiRssi();
        if (id !== measurementId.current) return;
        sum += rssi;
        setProgress(i + 1);
      }
      const result = { rssi: sum / sampleCount, count: sampleCount };
      setCells((current) => current.map((cell, i) => i === index ? result : cell));
    } catch (cause) {
      if (id === measurementId.current) {
        setError(cause instanceof Error ? cause.message : "Nie udało się odczytać RSSI.");
      }
    } finally {
      if (id === measurementId.current) {
        busy.current = false;
        setActiveCell(null);
      }
    }
  }

  const measuring = activeCell !== null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Siatka 5 × 5</Text>
      <Text>Dotknij komórki, aby zapisać pomiar. Kolejny pomiar zastąpi jej wynik.</Text>
      <Text style={styles.label}>Liczba odczytów do średniej</Text>
      <View style={styles.options}>
        {SAMPLE_COUNTS.map((count) => (
          <Pressable key={count} disabled={measuring} onPress={() => setSampleCount(count)}
            accessibilityRole="button" accessibilityState={{ selected: sampleCount === count, disabled: measuring }}
            style={[styles.option, sampleCount === count && styles.selected]}>
            <Text>{count}</Text>
          </Pressable>
        ))}
      </View>
      <Text>Odstęp: 3 s. Czas pomiaru: około {(sampleCount - 1) * 3} s{sampleCount === 1 ? " (od razu)" : ""}.</Text>
      <Text>Średnia arytmetyczna RSSI w dBm. Liczba odczytów nie gwarantuje tylu niezależnych pomiarów sprzętowych.</Text>
      <View style={styles.grid}>
        {Array.from({ length: GRID_SIZE }, (_, row) => (
          <View key={row} style={styles.row}>
            {cells.slice(row * GRID_SIZE, (row + 1) * GRID_SIZE).map((cell, column) => {
              const index = row * GRID_SIZE + column;
              return (
                <Pressable key={column} disabled={measuring} onPress={() => void measureCell(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Wiersz ${row + 1}, kolumna ${column + 1}, ${cell ? `${cell.rssi.toFixed(1)} dBm` : "brak odczytu"}`}
                  style={[styles.cell, cell !== null && styles.measured, activeCell === index && styles.selected]}>
                  <Text style={styles.value}>{activeCell === index ? `${progress}/${sampleCount}` : cell ? cell.rssi.toFixed(1) : "—"}</Text>
                  {cell && activeCell !== index ? <Text style={styles.unit}>dBm · {cell.count} odcz.</Text> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      {measuring ? <>
        <Text>Pomiar: {progress}/{sampleCount}. Pozostań w wybranym miejscu.</Text>
        <Button title="Anuluj pomiar" onPress={cancelMeasurement} />
      </> : null}
      <Button title={deleting ? "Zakończ usuwanie" : "Usuń odczyty — dotykaj komórek"}
        disabled={measuring} onPress={() => setDeleting(!deleting)} />
      {deleting ? <Text>Tryb usuwania: dotknij komórki, aby usunąć jej wynik.</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text>Wyniki pozostają po zmianie zakładki. Znikają po ponownym uruchomieniu aplikacji. Zmiana zakładki anuluje trwający pomiar.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  title: { fontSize: 26, fontWeight: "bold" },
  label: { fontWeight: "bold" },
  options: { flexDirection: "row", gap: 12 },
  option: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center", backgroundColor: "#eee", borderRadius: 8 },
  selected: { backgroundColor: "#a9d5ff" },
  grid: { width: "100%", maxWidth: 500, alignSelf: "center", gap: 3 },
  row: { flexDirection: "row", gap: 3 },
  cell: { flex: 1, aspectRatio: 1, backgroundColor: "#eee", alignItems: "center", justifyContent: "center", borderRadius: 4 },
  measured: { backgroundColor: "#dceedd" },
  value: { fontSize: 16, fontWeight: "bold" },
  unit: { fontSize: 9 },
  error: { color: "#b00020" },
});
