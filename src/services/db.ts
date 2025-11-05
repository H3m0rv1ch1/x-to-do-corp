
import { type Todo, type Note, type UserProfile, type UnlockedAchievement } from '@/types';

const DB_NAME = 'X-ToDo-DB';
const LEGACY_DB_NAME = 'x-todo-corp-db';
const DB_VERSION = 3; // Incremented version for schema change
const TODO_STORE = 'todos';
const NOTE_STORE = 'notes';
const PROFILE_STORE = 'userProfile';
const ACHIEVEMENTS_STORE = 'unlockedAchievements';
const KV_STORE = 'keyValue';
const ALL_STORES = [TODO_STORE, NOTE_STORE, PROFILE_STORE, ACHIEVEMENTS_STORE, KV_STORE];

let db: IDBDatabase;

const openDBWithVersion = (name: string, version?: number): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = version ? indexedDB.open(name, version) : indexedDB.open(name);

    request.onerror = () => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      resolve(request.result);
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

const areAllStoresEmpty = async (): Promise<boolean> => {
  if (!db) return true;
  const stores = Array.from(db.objectStoreNames);
  if (stores.length === 0) return true;
  const counts = await Promise.all(
    stores.map(
      (storeName) =>
        new Promise<number>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const req = tx.objectStore(storeName).count();
          req.onsuccess = () => resolve(req.result || 0);
          req.onerror = () => reject(req.error);
        })
    )
  );
  return counts.every((c) => c === 0);
};

const getAllFromDB = <T>(dbInstance: IDBDatabase, storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    if (!Array.from(dbInstance.objectStoreNames).includes(storeName)) {
      resolve([]);
      return;
    }
    const tx = dbInstance.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
};

const migrateFromLegacyIfPresent = async (): Promise<void> => {
  // If the new DB already has data, skip migration
  const empty = await areAllStoresEmpty();
  if (!empty) return;

  // Check if the legacy DB exists (supported in Chromium/Edge)
  const databasesFn = (indexedDB as any).databases;
  let legacyInfo: { name: string; version?: number } | undefined;
  if (typeof databasesFn === 'function') {
    try {
      const dbs: Array<{ name: string; version?: number }> = await databasesFn();
      legacyInfo = dbs.find((d) => d.name === LEGACY_DB_NAME);
    } catch {
      // ignore listing errors
    }
  }

  if (!legacyInfo) {
    return;
  }

  // Open legacy DB read-only and copy data into the current DB
  const legacyDb = await openDBWithVersion(LEGACY_DB_NAME, legacyInfo.version);

  const [legacyTodos, legacyNotes, legacyProfiles, legacyAchievements, legacyKV] = await Promise.all([
    getAllFromDB<Todo>(legacyDb, TODO_STORE),
    getAllFromDB<Note>(legacyDb, NOTE_STORE),
    getAllFromDB<(UserProfile & { id?: string })>(legacyDb, PROFILE_STORE),
    getAllFromDB<UnlockedAchievement>(legacyDb, ACHIEVEMENTS_STORE),
    getAllFromDB<{ id: string; value: any }>(legacyDb, KV_STORE),
  ]);

  // Write into the new DB
  const tx = db.transaction(ALL_STORES, 'readwrite');
  const putAll = (storeName: string, items: any[]) =>
    new Promise<void>((resolve, reject) => {
      if (!items || items.length === 0) return resolve();
      const store = tx.objectStore(storeName);
      let pending = items.length;
      items.forEach((item) => {
        // Normalize profile key
        if (storeName === PROFILE_STORE) {
          item = { ...item, id: PROFILE_KEY };
        }
        const req = store.put(item);
        req.onsuccess = () => {
          pending -= 1;
          if (pending === 0) resolve();
        };
        req.onerror = () => reject(req.error);
      });
      if (items.length === 0) resolve();
    });

  await Promise.all([
    putAll(TODO_STORE, legacyTodos),
    putAll(NOTE_STORE, legacyNotes),
    putAll(PROFILE_STORE, legacyProfiles),
    putAll(ACHIEVEMENTS_STORE, legacyAchievements),
    putAll(KV_STORE, legacyKV),
  ]);
};

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
      migrateFromLegacyIfPresent()
        .then(() => resolve(db))
        .catch(() => resolve(db));
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