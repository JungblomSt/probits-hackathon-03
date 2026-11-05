import { useEffect, useMemo, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
    Button,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { createMockSensor } from "./src/services/mockSensor";
import { ACTIVITY } from "./src/constants";
import { loadTrackerState, saveTrackerState } from "./src/services/taskStorage";

const WEEKDAYS = [
    { label: "Mån", name: "Måndag" },
    { label: "Tis", name: "Tisdag" },
    { label: "Ons", name: "Onsdag" },
    { label: "Tor", name: "Torsdag" },
    { label: "Fre", name: "Fredag" },
    { label: "Lör", name: "Lördag" },
    { label: "Sön", name: "Söndag" },
];

function getCalendarDay() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return {
        key: `${date.getFullYear()}-${month}-${day}`,
        weekday: (date.getDay() + 6) % 7,
    };
}

function getLastTaskId(tasks, weekday) {
    return tasks.filter((task) => task.weekday === weekday).slice(-1)[0]?.id ?? null;
}

function addStepsToTracker(data, amount, currentDay) {
    const activeTaskId = data.activeTaskByWeekday[currentDay.weekday];
    const activeTask = data.tasks.find((task) => task.id === activeTaskId);
    const currentProgress = data.taskProgressByDate[currentDay.key] ?? {};

    return {
        ...data,
        stepsByDate: {
            ...data.stepsByDate,
            [currentDay.key]: (data.stepsByDate[currentDay.key] ?? 0) + amount,
        },
        taskProgressByDate: activeTask
            ? {
                  ...data.taskProgressByDate,
                  [currentDay.key]: {
                      ...currentProgress,
                      [activeTask.id]: Math.min(
                          activeTask.goalSteps,
                          (currentProgress[activeTask.id] ?? 0) + amount,
                      ),
                  },
              }
            : data.taskProgressByDate,
    };
}

export default function App() {
    const sensor = useMemo(() => createMockSensor(), []);
    const [trackerData, setTrackerData] = useState({
        tasks: [],
        stepsByDate: {},
        activeTaskByWeekday: {},
        taskProgressByDate: {},
    });
    const [storageStatus, setStorageStatus] = useState("loading");
    const [storageError, setStorageError] = useState(null);
    const [sensorError, setSensorError] = useState(null);
    const [running, setRunning] = useState(false);
    const [today, setToday] = useState(getCalendarDay);
    const [selectedDay, setSelectedDay] = useState(() => getCalendarDay().weekday);
    const [taskName, setTaskName] = useState("");
    const [goalInput, setGoalInput] = useState("");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [formError, setFormError] = useState(null);
    const saveQueue = useRef(Promise.resolve());
    const mounted = useRef(false);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (storageStatus !== "loading") return undefined;

        let active = true;
        loadTrackerState()
            .then((savedState) => {
                if (!active) return;
                setTrackerData(savedState);
                setStorageError(null);
                setStorageStatus("ready");
            })
            .catch((error) => {
                console.warn("Could not load saved tracker data", error);
                if (!active) return;
                setStorageError("Kunde inte läsa sparade uppgifter. Försök igen.");
                setStorageStatus("error");
            });

        return () => {
            active = false;
        };
    }, [storageStatus]);

    useEffect(() => {
        if (storageStatus !== "ready") return;

        const snapshot = trackerData;
        saveQueue.current = saveQueue.current
            .then(async () => {
                await saveTrackerState(snapshot);
                if (mounted.current) setStorageError(null);
            })
            .catch((error) => {
                console.warn("Could not save tracker data", error);
                if (mounted.current) {
                    setStorageError("Kunde inte spara ändringarna på den här enheten.");
                }
            });
    }, [trackerData, storageStatus]);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentDay = getCalendarDay();
            setToday((previousDay) =>
                previousDay.key === currentDay.key ? previousDay : currentDay,
            );
        }, 60_000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (storageStatus !== "ready") return undefined;

        const unsubscribe = sensor.subscribe((r) => {
            const currentDay = getCalendarDay();
            setTrackerData((currentData) =>
                addStepsToTracker(currentData, r.amount, currentDay),
            );
        });
        return () => {
            unsubscribe();
            sensor.stop();
        };
    }, [sensor, storageStatus]);

    async function toggle() {
        setSensorError(null);
        if (running) {
            sensor.stop();
            setRunning(false);
            return;
        }
        try {
            await sensor.start(ACTIVITY.WALKING);
            setRunning(true);
        } catch (e) {
            console.warn("Could not start the step sensor", e);
            setSensorError(e.message);
        }
    }

    function clearTaskForm() {
        setTaskName("");
        setGoalInput("");
        setEditingTaskId(null);
        setFormError(null);
    }

    function saveTask() {
        const title = taskName.trim();
        const goalSteps = Number(goalInput);

        if (!title) {
            setFormError("Skriv ett namn på uppgiften.");
            return;
        }
        if (!Number.isSafeInteger(goalSteps) || goalSteps <= 0) {
            setFormError("Målet måste vara ett heltal större än noll.");
            return;
        }

        setTrackerData((currentData) => {
            if (editingTaskId) {
                const originalTask = currentData.tasks.find(
                    (task) => task.id === editingTaskId,
                );
                if (!originalTask) return currentData;

                const tasks = currentData.tasks.map((task) =>
                    task.id === editingTaskId
                        ? { ...task, title, goalSteps, weekday: selectedDay }
                        : task,
                );
                const activeTaskByWeekday = {
                    ...currentData.activeTaskByWeekday,
                };

                if (
                    activeTaskByWeekday[originalTask.weekday] === editingTaskId &&
                    selectedDay !== originalTask.weekday
                ) {
                    activeTaskByWeekday[originalTask.weekday] = getLastTaskId(
                        tasks.filter((task) => task.id !== editingTaskId),
                        originalTask.weekday,
                    );
                }
                if (selectedDay !== originalTask.weekday) {
                    activeTaskByWeekday[selectedDay] = editingTaskId;
                }

                return { ...currentData, tasks, activeTaskByWeekday };
            }

            const newTask = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                title,
                goalSteps,
                weekday: selectedDay,
            };

            return {
                ...currentData,
                tasks: [...currentData.tasks, newTask],
                activeTaskByWeekday: {
                    ...currentData.activeTaskByWeekday,
                    [selectedDay]: newTask.id,
                },
            };
        });
        clearTaskForm();
    }

    function editTask(task) {
        setTaskName(task.title);
        setGoalInput(String(task.goalSteps));
        setSelectedDay(task.weekday);
        setEditingTaskId(task.id);
        setFormError(null);
    }

    function removeTask(taskId) {
        setTrackerData((currentData) => {
            const task = currentData.tasks.find((item) => item.id === taskId);
            if (!task) return currentData;

            const tasks = currentData.tasks.filter((item) => item.id !== taskId);
            const activeTaskByWeekday = { ...currentData.activeTaskByWeekday };
            if (activeTaskByWeekday[task.weekday] === taskId) {
                activeTaskByWeekday[task.weekday] = getLastTaskId(
                    tasks,
                    task.weekday,
                );
            }
            const taskProgressByDate = Object.fromEntries(
                Object.entries(currentData.taskProgressByDate).map(
                    ([date, progress]) => [
                        date,
                        Object.fromEntries(
                            Object.entries(progress).filter(
                                ([id]) => id !== taskId,
                            ),
                        ),
                    ],
                ),
            );

            return {
                ...currentData,
                tasks,
                activeTaskByWeekday,
                taskProgressByDate,
            };
        });
        if (editingTaskId === taskId) clearTaskForm();
    }

    function setActiveTask(taskId) {
        setTrackerData((currentData) => ({
            ...currentData,
            activeTaskByWeekday: {
                ...currentData.activeTaskByWeekday,
                [selectedDay]: taskId,
            },
        }));
    }

    function retryLoading() {
        setStorageError(null);
        setStorageStatus("loading");
    }

    if (storageStatus !== "ready") {
        return (
            <View style={styles.loadingContainer}>
                <Text>{storageStatus === "loading" ? "Laddar uppgifter..." : storageError}</Text>
                {storageStatus === "error" && (
                    <Button title="Försök igen" onPress={retryLoading} />
                )}
                <StatusBar style="auto" />
            </View>
        );
    }

    const todaySteps = trackerData.stepsByDate[today.key] ?? 0;
    const tasksForSelectedDay = trackerData.tasks.filter(
        (task) => task.weekday === selectedDay,
    );
    const activeTaskId = trackerData.activeTaskByWeekday[selectedDay] ?? null;
    const todayTaskProgress = trackerData.taskProgressByDate[today.key] ?? {};

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.content}>
                <Text style={styles.title}>Stegmål</Text>
                <Text style={styles.counter}>Steg idag: {todaySteps}</Text>
                <Text>Steg räknas bara mot dagens aktiva uppgift.</Text>
                <Button
                    title={running ? "Stoppa" : "Starta"}
                    onPress={toggle}
                    disabled={storageStatus !== "ready"}
                />
                {sensorError && <Text style={styles.error}>{sensorError}</Text>}

                <Text style={styles.sectionTitle}>Uppgifter för {WEEKDAYS[selectedDay].name}</Text>
                <View style={styles.weekdays}>
                    {WEEKDAYS.map((day, index) => (
                        <Pressable
                            key={day.name}
                            accessibilityRole="button"
                            accessibilityState={{ selected: selectedDay === index }}
                            onPress={() => setSelectedDay(index)}
                            style={[
                                styles.dayButton,
                                selectedDay === index && styles.selectedDayButton,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dayButtonText,
                                    selectedDay === index && styles.selectedDayButtonText,
                                ]}
                            >
                                {day.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Vad vill du göra?"
                    value={taskName}
                    onChangeText={setTaskName}
                    maxLength={80}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Mål i steg"
                    value={goalInput}
                    onChangeText={setGoalInput}
                    keyboardType="number-pad"
                />
                <View style={styles.formButtons}>
                    <Button
                        title={editingTaskId ? "Spara ändringar" : "Lägg till uppgift"}
                        onPress={saveTask}
                    />
                    {editingTaskId && <Button title="Avbryt" onPress={clearTaskForm} />}
                </View>
                {formError && <Text style={styles.error}>{formError}</Text>}

                {storageError && <Text style={styles.error}>{storageError}</Text>}

                {tasksForSelectedDay.length === 0 ? (
                    <Text style={styles.emptyMessage}>Inga uppgifter för den här dagen.</Text>
                ) : (
                    tasksForSelectedDay.map((task) => {
                        const isActive = activeTaskId === task.id;
                        const progress =
                            selectedDay === today.weekday
                                ? (todayTaskProgress[task.id] ?? 0)
                                : null;

                        return (
                            <View
                                key={task.id}
                                style={[styles.task, isActive && styles.activeTask]}
                            >
                                <Text style={styles.taskTitle}>{task.title}</Text>
                                {isActive && <Text style={styles.activeLabel}>Aktiv uppgift</Text>}
                                {progress === null ? (
                                    <Text>Mål: {task.goalSteps} steg</Text>
                                ) : (
                                    <Text>
                                        {progress >= task.goalSteps ? "Klar" : "Framsteg"}:{" "}
                                        {Math.min(progress, task.goalSteps)}/{task.goalSteps} steg
                                    </Text>
                                )}
                                <View style={styles.taskButtons}>
                                    {!isActive && (
                                        <Button
                                            title="Gör aktiv"
                                            onPress={() => setActiveTask(task.id)}
                                        />
                                    )}
                                    <Button title="Redigera" onPress={() => editTask(task)} />
                                    <Button title="Ta bort" onPress={() => removeTask(task.id)} />
                                </View>
                            </View>
                        );
                    })
                )}
            </View>
            <StatusBar style="auto" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        padding: 24,
        paddingTop: 48,
    },
    content: {
        width: "100%",
        maxWidth: 480,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    counter: {
        fontSize: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 28,
        marginBottom: 12,
    },
    weekdays: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    dayButton: {
        borderWidth: 1,
        borderColor: "#888",
        borderRadius: 16,
        paddingHorizontal: 9,
        paddingVertical: 8,
    },
    selectedDayButton: {
        backgroundColor: "#222",
        borderColor: "#222",
    },
    dayButtonText: {
        color: "#222",
    },
    selectedDayButtonText: {
        color: "#fff",
    },
    input: {
        borderWidth: 1,
        borderColor: "#888",
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
    },
    formButtons: {
        flexDirection: "row",
        justifyContent: "flex-start",
        flexWrap: "wrap",
        marginBottom: 8,
    },
    error: {
        color: "#b00020",
        marginTop: 6,
    },
    emptyMessage: {
        color: "#555",
        marginTop: 20,
    },
    task: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        padding: 12,
        marginTop: 12,
    },
    activeTask: {
        borderColor: "#222",
        borderWidth: 2,
    },
    activeLabel: {
        fontWeight: "600",
        marginBottom: 4,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    taskButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
    },
});
