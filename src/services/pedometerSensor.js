import { Pedometer } from "expo-sensors";
import { createEmitter } from "./activitySensor";
import { ACTIVITY, UNIT } from "../constants";

export function createPedometerSensor() {
    const { subscribe, emit } = createEmitter();
    let subscription = null;
    let lastSteps = 0;

    async function start(activity = ACTIVITY.WALKING) {
        if (subscription) return;

        const available = await Pedometer.isAvailableAsync();
        if (!available)
            throw new Error("Stegräknare finns inte på den här enheten");

        const perm = await Pedometer.requestPermissionsAsync();
        if (!perm.granted)
            throw new Error("Behörighet för stegräkning nekades");

        lastSteps = 0;
        subscription = Pedometer.watchStepCount((result) => {
            const delta = result.steps - lastSteps;
            lastSteps = result.steps;
            if (delta > 0) {
                emit({
                    activity,
                    amount: delta,
                    unit: UNIT.STEPS,
                    timestamp: Date.now(),
                });
            }
        });
    }

    function stop() {
        subscription?.remove();
        subscription = null;
    }

    return { start, stop, subscribe };
}
