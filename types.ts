export type TaskCategory =
  | 'sport'
  | 'work'
  | 'study'
  | 'health'
  | 'prayer'
  | 'personal'
  | 'general';

export type RepeatRule = 'once' | 'daily' | 'weekdays' | 'weekly';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  time: string;
  category: TaskCategory;
  priority: TaskPriority;
  repeat: RepeatRule;
  reminder: boolean;
  sound: boolean;
  completed: boolean;
  completionDates: string[];
  createdAt: string;
};

export type AppSettings = {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  firstDayOfWeek: 'monday' | 'sunday';
};

export type NewTask = Pick<
  Task,
  'title' | 'time' | 'category' | 'priority' | 'repeat' | 'reminder' | 'sound'
>;