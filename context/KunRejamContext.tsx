import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { AppSettings, NewTask, Task } from '@/types';

const STORAGE_KEY = '@kunrejam/state-v1';
const NOTIFICATION_CHANNEL = 'kunrejam-reminders';

export const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  firstDayOfWeek: 'monday',
};

const starterTasks: Task[] = [
  {
    id: 'starter-water',
    title: 'Bir stakan suv ichish',
    time: '08:00',
    category: 'health',
    priority: 'medium',
    repeat: 'daily',
    reminder: true,
    sound: true,
    completed: false,
    completionDates: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-focus',
    title: 'Diqqatli ish vaqti',
    time: '09:30',
    category: 'work',
    priority: 'high',
    repeat: 'weekdays',
    reminder: true,
    sound: true,
    completed: false,
    completionDates: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-walk',
    title: '20 daqiqa yurish',
    time: '18:30',
    category: 'sport',
    priority: 'low',
    repeat: 'daily',
    reminder: false,
    sound: false,
    completed: false,
    completionDates: [],
    createdAt: new Date().toISOString(),
  },
];

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

type StoredState = { tasks: Task[]; settings: AppSettings };

type ContextValue = {
  tasks: Task[];
  settings: AppSettings;
  isLoading: boolean;
  addTask: (task: NewTask) => Promise<void>;
  updateTask: (id: string, patch: Partial<NewTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  setSettings: (patch: Partial<AppSettings>) => Promise<void>;
  resetData: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
};

const KunRejamContext = createContext<ContextValue | null>(null);

const dateKey = (date = new Date()) => date.toISOString().slice(0, 10);
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function taskForToday(task: Task, date = new Date()) {
  if (task.repeat === 'once' || task.repeat === 'daily') return true;
  if (task.repeat === 'weekdays') return date.getDay() !== 0 && date.getDay() !== 6;
  return true;
}

function nextReminderDate(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  return date;
}

async function configureNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL, {
    name: 'KunRejam eslatmalari',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 200, 250],
    sound: 'default',
  });
}

async function requestNativeNotificationPermission() {
  if (Platform.OS === 'web') return false;
  await configureNotificationChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function refreshScheduledNotifications(tasks: Task[], settings: AppSettings) {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.notificationsEnabled) return;
  const permissionGranted = await requestNativeNotificationPermission();
  if (!permissionGranted) return;

  for (const task of tasks) {
    if (!task.reminder || task.completed) continue;
    const [hour, minute] = task.time.split(':').map(Number);
    const repeats = task.repeat === 'daily' || task.repeat === 'weekdays' || task.repeat === 'weekly';
    const trigger = repeats
      ? {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          ...(task.repeat === 'weekly' ? { weekday: new Date().getDay() || 7 } : {}),
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: nextReminderDate(task.time),
        };
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'KunRejam eslatmasi',
        body: task.title,
        sound: settings.soundEnabled && task.sound ? 'default' : undefined,
        ...(Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL } : {}),
      },
      trigger: trigger as Notifications.NotificationTriggerInput,
    });
  }
}

export function KunRejamProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active) return;
        if (raw) {
          const saved = JSON.parse(raw) as StoredState;
          setTasks(saved.tasks ?? []);
          setSettingsState({ ...defaultSettings, ...(saved.settings ?? {}) });
        } else {
          setTasks(starterTasks);
        }
      } catch {
        setTasks(starterTasks);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (nextTasks: Task[], nextSettings: AppSettings) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: nextTasks, settings: nextSettings }));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      void persist(tasks, settings);
      void refreshScheduledNotifications(tasks, settings);
    }
  }, [isLoading, persist, settings, tasks]);

  const addTask = useCallback(async (input: NewTask) => {
    const task: Task = {
      ...input,
      id: makeId(),
      completed: false,
      completionDates: [],
      createdAt: new Date().toISOString(),
    };
    setTasks((current) => [...current, task].sort((a, b) => a.time.localeCompare(b.time)));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const updateTask = useCallback(async (id: string, patch: Partial<NewTask>) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)).sort((a, b) => a.time.localeCompare(b.time)));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    const today = dateKey();
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) return task;
        const completed = !task.completed;
        const completionDates = completed
          ? Array.from(new Set([...task.completionDates, today]))
          : task.completionDates.filter((date) => date !== today);
        return { ...task, completed, completionDates };
      }),
    );
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const setSettings = useCallback(async (patch: Partial<AppSettings>) => {
    setSettingsState((current) => ({ ...current, ...patch }));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const resetData = useCallback(async () => {
    setTasks(starterTasks.map((task) => ({ ...task, completionDates: [], completed: false })));
    setSettingsState(defaultSettings);
    await AsyncStorage.removeItem(STORAGE_KEY);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    const granted = await requestNativeNotificationPermission();
    if (granted) {
      setSettingsState((current) => ({ ...current, notificationsEnabled: true }));
    }
    return granted;
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      settings,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      setSettings,
      resetData,
      requestNotificationPermission,
    }),
    [addTask, deleteTask, isLoading, requestNotificationPermission, resetData, setSettings, settings, tasks, toggleTask, updateTask],
  );

  return <KunRejamContext.Provider value={value}>{children}</KunRejamContext.Provider>;
}

export function useKunRejam() {
  const context = useContext(KunRejamContext);
  if (!context) throw new Error('useKunRejam must be used inside KunRejamProvider');
  return context;
}

export function getTodayTasks(tasks: Task[]) {
  return tasks.filter((task) => taskForToday(task));
}

export function getWeekSummary(tasks: Task[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = dateKey(date);
    const count = tasks.reduce((total, task) => total + (task.completionDates.includes(key) ? 1 : 0), 0);
    return { key, label: date.toLocaleDateString('uz-UZ', { weekday: 'short' }).slice(0, 2), count };
  });
}