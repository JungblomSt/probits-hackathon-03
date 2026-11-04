import { createEmitter } from "./activitySensor";
import { UNIT } from "../constants";

export function createMockSensor() {
    const { subscribe, emit } = createEmitter();
    let timer = null;

    function start(activity) {
        if (timer) return; // redan igång
        timer = setInterval(() => {
            emit({
                activity,
                amount: Math.floor(Math.random() * 3) + 1, //1-3 steg per sekund
                unit: UNIT.STEPS,
                timestamp: Date.now(),
            });
        }, 1000);
    }

    function stop() {
        clearInterval(timer);
        timer = null;
    }

    return { start, stop, subscribe };
}
