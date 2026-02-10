export type TaskType = 'one_off' | 'tracker';
export type TaskStatus = 'open' | 'done';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  createdAt: string; // ISO String
  doneAt: string | null; // ISO String
}

export interface TaskLog {
  id: string;
  taskId: string;
  timestamp: string; // ISO String
  note: string;
}

export interface GroupedLogs {
  date: string;
  logs: TaskLog[];
}