// Hanterar lyssnarna så att varje sensor slipper skriva det själv ↓
export function createEmitter() {
    const listeners = new Set();
    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        emit(reading) {
            listeners.forEach((l) => l(reading));
        },
    };
}
