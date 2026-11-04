import { useEffect, useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { createMockSensor } from "./src/services/mockSensor";
import { createPedometerSensor } from "./src/services/pedometerSensor";
import { ACTIVITY } from "./src/constants";

export default function App() {
    const sensor = useMemo(() => createMockSensor(), []);
    const [total, setTotal] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        const unsubscribe = sensor.subscribe((r) => {
            console.log(r);
            setTotal((t) => t + r.amount);
        });
        return () => {
            unsubscribe();
            sensor.stop();
        };
    }, [sensor]);

    async function toggle() {
        if (running) {
            sensor.stop();
            setRunning(false);
            return;
        }
        try {
            await sensor.start(ACTIVITY.WALKING);
            setRunning(true);
        } catch (e) {
            console.warn(e.message);
        }
    }

    return (
        <View style={styles.container}>
            <Text>Steg: {total}</Text>
            <Button title={running ? "Stoppa" : "Starta"} onPress={toggle} />
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
