import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ sceneStyle: { backgroundColor: "white" } }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Odczyty",
          tabBarIcon: ({ color }) => <Text style={{ color }}>●</Text>,
        }}
      />
      <Tabs.Screen
        name="grid"
        options={{
          title: "Siatka",
          tabBarIcon: ({ color }) => <Text style={{ color }}>▦</Text>,
        }}
      />
    </Tabs>
  );
}
