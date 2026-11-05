import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@probits-hackathon-03/tracker";

const EMPTY_STATE = {
    tasks: [],
    stepsByDate: {},
    activeTaskByWeekday: {},
    taskProgressByDate: {},
};

function isValidState(value) {
    if (
        !value ||
        !Array.isArray(value.tasks) ||
        !value.stepsByDate ||
        typeof value.stepsByDate !== "object" ||
        Array.isArray(value.stepsByDate)
    ) {
        return false;
    }

    const validTasks = value.tasks.every(
        (task) =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            Number.isSafeInteger(task.goalSteps) &&
            task.goalSteps > 0 &&
            Number.isInteger(task.weekday) &&
            task.weekday >= 0 &&
            task.weekday <= 6 &&
            (task.stepsStartDate === undefined ||
                task.stepsStartDate === null ||
                /^\d{4}-\d{2}-\d{2}$/.test(task.stepsStartDate)) &&
            (task.stepsAtStart === undefined ||
                (Number.isSafeInteger(task.stepsAtStart) && task.stepsAtStart >= 0)),
    );
    const validSteps = Object.entries(value.stepsByDate).every(
        ([date, steps]) =>
            /^\d{4}-\d{2}-\d{2}$/.test(date) &&
            Number.isSafeInteger(steps) &&
            steps >= 0,
    );
    const activeTaskByWeekday = value.activeTaskByWeekday ?? {};
    const taskIdsByWeekday = new Map(
        value.tasks.map((task) => [task.id, task.weekday]),
    );
    const validActiveTasks =
        activeTaskByWeekday &&
        typeof activeTaskByWeekday === "object" &&
        !Array.isArray(activeTaskByWeekday) &&
        Object.entries(activeTaskByWeekday).every(
            ([weekday, taskId]) =>
                /^\d$/.test(weekday) &&
                Number(weekday) <= 6 &&
                (taskId === null || taskIdsByWeekday.get(taskId) === Number(weekday)),
        );
    const taskProgressByDate = value.taskProgressByDate ?? {};
    const validTaskProgress =
        taskProgressByDate &&
        typeof taskProgressByDate === "object" &&
        !Array.isArray(taskProgressByDate) &&
        Object.entries(taskProgressByDate).every(
            ([date, taskProgress]) =>
                /^\d{4}-\d{2}-\d{2}$/.test(date) &&
                taskProgress &&
                typeof taskProgress === "object" &&
                !Array.isArray(taskProgress) &&
                Object.entries(taskProgress).every(
                    ([taskId, progress]) =>
                        taskIdsByWeekday.has(taskId) &&
                        Number.isSafeInteger(progress) &&
                        progress >= 0,
                ),
        );

    return validTasks && validSteps && validActiveTasks && validTaskProgress;
}

export async function loadTrackerState() {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedValue === null) {
        return EMPTY_STATE;
    }

    const parsedValue = JSON.parse(storedValue);
    if (!isValidState(parsedValue)) {
        throw new Error("Saved tracker data has an invalid format");
    }

    const activeTaskByWeekday = { ...parsedValue.activeTaskByWeekday };
    for (const task of parsedValue.tasks) {
        if (!(task.weekday in (parsedValue.activeTaskByWeekday ?? {}))) {
            activeTaskByWeekday[task.weekday] = task.id;
        }
    }

    return {
        ...EMPTY_STATE,
        ...parsedValue,
        activeTaskByWeekday,
        taskProgressByDate: parsedValue.taskProgressByDate ?? {},
    };
}

export async function saveTrackerState(state) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
