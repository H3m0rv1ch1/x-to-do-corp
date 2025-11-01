
import { type Todo, type Note, type UserProfile, type UnlockedAchievement } from '@/types';

const DB_NAME = 'X-ToDo-DB';
const DB_VERSION = 3; // Incremented version for schema change
const TODO_STORE = 'todos';
const NOTE_STORE = 'notes';
const PROFILE_STORE = 'userProfile';
const ACHIEVEMENTS_STORE = 'unlockedAchievements';
const KV_STORE = 'keyValue';
const ALL_STORES = [TODO_STORE, NOTE_STORE, PROFILE_STORE, ACHIEVEMENTS_STORE, KV_STORE];

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(TODO_STORE)) {
        dbInstance.createObjectStore(TODO_STORE, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(NOTE_STORE)) {
        dbInstance.createObjectStore(NOTE_STORE, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(PROFILE_STORE)) {
        dbInstance.createObjectStore(PROFILE_STORE, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(ACHIEVEMENTS_STORE)) {
        dbInstance.createObjectStore(ACHIEVEMENTS_STORE, { keyPath: 'achievementId' });
      }
      if (!dbInstance.objectStoreNames.contains(KV_STORE)) {
        dbInstance.createObjectStore(KV_STORE, { keyPath: 'id' });
      }
    };
  });
};

const getStore = (storeName: string, mode: IDBTransactionMode) => {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
};

const getAll = <T>(storeName: string): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    await initDB();
    const store = getStore(storeName, 'readonly');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
};

const get = <T>(storeName: string, id: string): Promise<T | undefined> => {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const store = getStore(storeName, 'readonly');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
    });
};

const put = <T>(storeName: string, item: T): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    await initDB();
    const store = getStore(storeName, 'readwrite');
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const deleteItem = (storeName: string, id: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    await initDB();
    const store = getStore(storeName, 'readwrite');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const clearStore = (storeName: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    await initDB();
    const store = getStore(storeName, 'readwrite');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};


// To-Do specific functions
export const getTodos = () => getAll<Todo>(TODO_STORE);
export const putTodo = (todo: Todo) => put<Todo>(TODO_STORE, todo);
export const deleteTodo = (id: string) => deleteItem(TODO_STORE, id);

// Note specific functions
export const getNotes = () => getAll<Note>(NOTE_STORE);
export const putNote = (note: Note) => put<Note>(NOTE_STORE, note);
export const deleteNote = (id: string) => deleteItem(NOTE_STORE, id);
export const clearNotes = () => clearStore(NOTE_STORE);

// Achievement specific functions
export const getUnlockedAchievements = () => getAll<UnlockedAchievement>(ACHIEVEMENTS_STORE);
export const putUnlockedAchievement = (achievement: UnlockedAchievement) => put<UnlockedAchievement>(ACHIEVEMENTS_STORE, achievement);


// Profile specific functions
const PROFILE_KEY = 'main_profile';

export const getUserProfile = async (): Promise<UserProfile | null> => {
    const profile = await get<UserProfile & {id: string}>(PROFILE_STORE, PROFILE_KEY);
    if(profile) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = profile;
        return rest as UserProfile;
    }
    return null;
}

export const saveUserProfile = (profile: UserProfile) => {
    return put<UserProfile & {id: string}>(PROFILE_STORE, { ...profile, id: PROFILE_KEY });
};

// Key-Value Store functions
export const getValue = (id: string) => get<{id: string, value: any}>(KV_STORE, id);
export const putValue = (id: string, value: any) => put(KV_STORE, { id, value });


// General DB functions
export const clearAllData = async (): Promise<void> => {
  await initDB();
  const transaction = db.transaction(ALL_STORES, 'readwrite');
  await Promise.all(ALL_STORES.map(storeName => {
    return new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore(storeName).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }));
};