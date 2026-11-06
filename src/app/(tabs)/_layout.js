import { Tabs } from 'expo-router/tabs';

import Icon from '../../components/Icon';
import { colors } from '../../theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Vecka', tabBarIcon: ({ color }) => <Icon name="calendar" color={color} /> }}
      />
      <Tabs.Screen
        name="historik"
        options={{ title: 'Historik', tabBarIcon: ({ color }) => <Icon name="chart" color={color} /> }}
      />
      <Tabs.Screen
        name="coach"
        options={{ title: 'Coach', tabBarIcon: ({ color }) => <Icon name="chat" color={color} /> }}
      />
      <Tabs.Screen
        name="installningar"
        options={{ title: 'Inställningar', tabBarIcon: ({ color }) => <Icon name="settings" color={color} /> }}
      />
    </Tabs>
  );
}
