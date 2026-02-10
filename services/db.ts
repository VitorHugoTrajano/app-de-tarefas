import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, TaskLog } from '../types';

interface TrackMasterDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
  };
  logs: {
    key: string;
    value: TaskLog;
    indexes: { 'by-task': string };
  };
}

const DB_NAME = 'trackmaster-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TrackMasterDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<TrackMasterDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('logs')) {
          const logStore = db.createObjectStore('logs', { keyPath: 'id' });
          logStore.createIndex('by-task', 'taskId');
        }
      },
    });
  }
  return dbPromise;
};

// --- Tasks ---

export const getTasks = async (): Promise<Task[]> => {
  const db = await initDB();
  return db.getAll('tasks');
};

export const addTask = async (task: Task): Promise<void> => {
  const db = await initDB();
  await db.add('tasks', task);
};

export const updateTask = async (task: Task): Promise<void> => {
  const db = await initDB();
  await db.put('tasks', task);
};

export const deleteTask = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete('tasks', id);
  // Also delete associated logs if it's a tracker, but strict separation suggests
  // calling deleteLogsForTask separately or handling it here.
  // We will handle cascading delete here for safety.
  await deleteLogsForTask(id);
};

// --- Logs ---

export const getLogs = async (taskId: string): Promise<TaskLog[]> => {
  const db = await initDB();
  return db.getAllFromIndex('logs', 'by-task', taskId);
};

export const getAllLogs = async (): Promise<TaskLog[]> => {
  const db = await initDB();
  return db.getAll('logs');
};

export const addLog = async (log: TaskLog): Promise<void> => {
  const db = await initDB();
  await db.add('logs', log);
};

export const updateLog = async (log: TaskLog): Promise<void> => {
  const db = await initDB();
  await db.put('logs', log);
};

export const deleteLog = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete('logs', id);
};

export const deleteLogsForTask = async (taskId: string): Promise<void> => {
  const db = await initDB();
  const logs = await getLogs(taskId);
  const tx = db.transaction('logs', 'readwrite');
  const store = tx.objectStore('logs');
  for (const log of logs) {
    await store.delete(log.id);
  }
  await tx.done;
};