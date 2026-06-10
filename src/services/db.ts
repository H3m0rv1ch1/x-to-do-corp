import initSqlJs, { type Database } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { type Todo, type Note, type UserProfile, type UnlockedAchievement } from '@/types';

// ─── OPFS paths ────────────────────────────────────────────────
const DB_FILE = 'x-todo-db.sqlite';
const DB_DIR = 'databases';

// ─── State ─────────────────────────────────────────────────────
let db: Database | null = null;
let initPromise: Promise<void> | null = null;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

// Flush pending saves before the page unloads (prevents data loss on tab close)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => { saveToOPFS(); });
  // Also flush on visibility change (tab hidden / app backgrounded)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveToOPFS();
  });
}

// ─── OPFS helpers ──────────────────────────────────────────────

async function getDBDir(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(DB_DIR, { create: true });
}

async function getDBFileHandle(create: boolean): Promise<FileSystemFileHandle> {
  const dir = await getDBDir();
  return dir.getFileHandle(DB_FILE, { create });
}

async function saveToOPFS(): Promise<void> {
  if (!db) return;
  try {
    const data = db.export();
    const fileHandle = await getDBFileHandle(true);
    const writable = await fileHandle.createWritable();
    await writable.write(data as unknown as FileSystemWriteChunkType);
    await writable.close();
  } catch (e) {
    console.error('Failed to save database to OPFS:', e);
  }
}

function scheduleSave(): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    saveToOPFS();
  }, 300);
}

// ─── Schema ────────────────────────────────────────────────────

function createTables(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS achievements (
      achievementId TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS kv (
      id TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL
    );
  `);
}

// ─── IndexedDB to SQLite migration ─────────────────────────────

async function migrateFromIndexedDB(): Promise<boolean> {
  try {
    const legacyDBs = await indexedDB.databases?.();
    const legacyDB = legacyDBs?.find(
      (d) => d.name === 'X-ToDo-DB' || d.name === 'x-todo-corp-db'
    );
    if (!legacyDB) return false;

    const readIDB = <T>(dbName: string, storeName: string): Promise<T[]> => {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const idb = req.result;
          const tx = idb.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const getReq = store.getAll();
          getReq.onsuccess = () => resolve(getReq.result as T[]);
          getReq.onerror = () => reject(getReq.error);
        };
      });
    };

    let dbName = 'X-ToDo-DB';
    let todos: Todo[] = [];
    let notes: any[] = [];
    let profiles: any[] = [];
    let achievements: any[] = [];

    try {
      [todos, notes, profiles, achievements] = await Promise.all([
        readIDB<Todo>(dbName, 'todos').catch(() => [] as Todo[]),
        readIDB<any>(dbName, 'notes').catch(() => [] as any[]),
        readIDB<any>(dbName, 'userProfile').catch(() => [] as any[]),
        readIDB<any>(dbName, 'unlockedAchievements').catch(() => [] as any[]),
      ]);
    } catch {
      dbName = 'x-todo-corp-db';
      try {
        [todos, notes, profiles, achievements] = await Promise.all([
          readIDB<Todo>(dbName, 'todos').catch(() => [] as Todo[]),
          readIDB<any>(dbName, 'notes').catch(() => [] as any[]),
          readIDB<any>(dbName, 'userProfile').catch(() => [] as any[]),
          readIDB<any>(dbName, 'unlockedAchievements').catch(() => [] as any[]),
        ]);
      } catch {
        return false;
      }
    }

    if (todos.length === 0 && notes.length === 0 && profiles.length === 0 && achievements.length === 0) {
      return false;
    }

    console.log(`Migrating from IndexedDB: ${todos.length} todos, ${notes.length} notes`);

    let kvItems: { id: string; value: any }[] = [];
    let users: any[] = [];
    let syncQueue: any[] = [];
    try {
      [kvItems, users, syncQueue] = await Promise.all([
        readIDB<{ id: string; value: any }>(dbName, 'keyValue').catch(() => []),
        readIDB<any>(dbName, 'users').catch(() => []),
        readIDB<any>(dbName, 'sync_queue').catch(() => []),
      ]);
    } catch { /* ignore */ }

    const runAll = (sql: string, items: any[], paramFn: (item: any) => any[]) => {
      for (const item of items) {
        try { db!.run(sql, paramFn(item)); } catch (e) { console.error('Migration insert error:', e); }
      }
    };

    runAll('INSERT OR REPLACE INTO todos (id, data) VALUES (?, ?)', todos, (t) => [t.id, JSON.stringify(t)]);
    runAll('INSERT OR REPLACE INTO notes (id, data) VALUES (?, ?)', notes, (n) => [n.id, JSON.stringify(n)]);
    runAll('INSERT OR REPLACE INTO profiles (id, data) VALUES (?, ?)', profiles, (p) => [p.id || 'main_profile', JSON.stringify(p)]);
    runAll('INSERT OR REPLACE INTO achievements (achievementId, data) VALUES (?, ?)', achievements, (a) => [a.achievementId, JSON.stringify(a)]);
    runAll('INSERT OR REPLACE INTO kv (id, value) VALUES (?, ?)', kvItems, (k) => [k.id, JSON.stringify(k.value)]);
    runAll('INSERT OR REPLACE INTO users (email, data) VALUES (?, ?)', users, (u) => [u.email, JSON.stringify(u)]);
    runAll('INSERT OR REPLACE INTO sync_queue (id, data) VALUES (?, ?)', syncQueue, (s) => [s.id ?? null, JSON.stringify(s)]);

    await saveToOPFS();
    console.log('Migration from IndexedDB to SQLite complete!');
    return true;
  } catch (e) {
    console.error('Migration from IndexedDB failed:', e);
    return false;
  }
}

// ─── Init ──────────────────────────────────────────────────────

async function initDB(): Promise<Database> {
  if (db) return db;
  if (initPromise) { await initPromise; return db!; }

  initPromise = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file: string) => {
        if (file.endsWith('.wasm')) return sqlWasmUrl;
        return file;
      }
    });
    let loaded = false;
    try {
      const fileHandle = await getDBFileHandle(false);
      const file = await fileHandle.getFile();
      if (file.size > 0) {
        const buffer = await file.arrayBuffer();
        db = new SQL.Database(new Uint8Array(buffer));
        createTables(db);
        loaded = true;
      }
    } catch { /* expected on first launch */ }

    if (!loaded) {
      db = new SQL.Database();
      createTables(db);
      const migrated = await migrateFromIndexedDB();
      if (!migrated) await saveToOPFS();
    }
  })();

  await initPromise;
  return db!;
}

// ─── Generic CRUD helpers ──────────────────────────────────────

function getAllFromTable<T>(table: string): T[] {
  if (!db) return [];
  try {
    const results = db.exec(`SELECT data FROM ${table}`);
    if (!results.length || !results[0].values.length) return [];
    return results[0].values.map((row: any[]) => JSON.parse(row[0] as string) as T);
  } catch { return []; }
}

function getFromTable<T>(table: string, idCol: string, id: string): T | null {
  if (!db) return null;
  try {
    const results = db.exec(`SELECT data FROM ${table} WHERE ${idCol} = ?`, [id]);
    if (!results.length || !results[0].values.length) return null;
    return JSON.parse(results[0].values[0][0] as string) as T;
  } catch { return null; }
}

function putInTable(table: string, idCol: string, id: string, data: any): void {
  if (!db) return;
  try {
    db.run(`INSERT OR REPLACE INTO ${table} (${idCol}, data) VALUES (?, ?)`, [id, JSON.stringify(data)]);
    scheduleSave();
  } catch (e) { console.error(`putInTable ${table} error:`, e); }
}

function deleteFromTable(table: string, idCol: string, id: string): void {
  if (!db) return;
  try { db.run(`DELETE FROM ${table} WHERE ${idCol} = ?`, [id]); scheduleSave(); }
  catch (e) { console.error(`deleteFromTable ${table} error:`, e); }
}

function clearTable(table: string): void {
  if (!db) return;
  try { db.run(`DELETE FROM ${table}`); scheduleSave(); }
  catch (e) { console.error(`clearTable ${table} error:`, e); }
}

// ─── Todo functions ────────────────────────────────────────────

export const getTodos = async (): Promise<Todo[]> => {
  await initDB();
  return getAllFromTable<Todo>('todos');
};

export const putTodo = async (todo: Todo): Promise<void> => {
  await initDB();
  putInTable('todos', 'id', todo.id, todo);
};

export const deleteTodo = async (id: string): Promise<void> => {
  await initDB();
  deleteFromTable('todos', 'id', id);
};

export const clearTodos = async (): Promise<void> => {
  await initDB();
  clearTable('todos');
};

// ─── Note functions ────────────────────────────────────────────

export const getNotes = async (): Promise<Note[]> => {
  await initDB();
  return getAllFromTable<Note>('notes');
};

export const putNote = async (note: Note): Promise<void> => {
  await initDB();
  putInTable('notes', 'id', note.id, note);
};

export const deleteNote = async (id: string): Promise<void> => {
  await initDB();
  deleteFromTable('notes', 'id', id);
};

export const clearNotes = async (): Promise<void> => {
  await initDB();
  clearTable('notes');
};

// ─── Achievement functions ─────────────────────────────────────

export const getUnlockedAchievements = async (): Promise<UnlockedAchievement[]> => {
  await initDB();
  return getAllFromTable<UnlockedAchievement>('achievements');
};

export const putUnlockedAchievement = async (achievement: UnlockedAchievement): Promise<void> => {
  await initDB();
  putInTable('achievements', 'achievementId', achievement.achievementId, achievement);
};

// ─── Profile functions ─────────────────────────────────────────

const PROFILE_KEY = 'main_profile';

export const getUserProfile = async (): Promise<UserProfile | null> => {
  await initDB();
  const profile = getFromTable<UserProfile & { id?: string }>('profiles', 'id', PROFILE_KEY);
  if (profile) {
    const { id: _, ...rest } = profile as UserProfile & { id: string };
    return rest as UserProfile;
  }
  const all = getAllFromTable<any>('profiles');
  if (all.length > 0) {
    const { id: _, ...rest } = all[0];
    return rest as UserProfile;
  }
  return null;
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  await initDB();
  putInTable('profiles', 'id', PROFILE_KEY, profile);
};

// ─── KV Store ──────────────────────────────────────────────────

export const getValue = async (key: string): Promise<{ id: string; value: any } | undefined> => {
  await initDB();
  if (!db) return undefined;
  try {
    const results = db.exec('SELECT value FROM kv WHERE id = ?', [key]);
    if (!results.length || !results[0].values.length) return undefined;
    return { id: key, value: JSON.parse(results[0].values[0][0] as string) };
  } catch { return undefined; }
};

export const putValue = async (key: string, value: any): Promise<void> => {
  await initDB();
  if (!db) return;
  try {
    db.run('INSERT OR REPLACE INTO kv (id, value) VALUES (?, ?)', [key, JSON.stringify(value)]);
    scheduleSave();
  } catch (e) { console.error('putValue error:', e); }
};

// ─── User functions ────────────────────────────────────────────

export const getUser = async (email: string): Promise<any | undefined> => {
  await initDB();
  const user = getFromTable<any>('users', 'email', email);
  return user || undefined;
};

export const putUser = async (user: any): Promise<void> => {
  await initDB();
  putInTable('users', 'email', user.email, user);
};

// ─── Sync Queue ────────────────────────────────────────────────

export const addToSyncQueue = async (item: any): Promise<void> => {
  await initDB();
  if (!db) return;
  try {
    db.run('INSERT INTO sync_queue (data) VALUES (?)', [JSON.stringify(item)]);
    scheduleSave();
  } catch (e) { console.error('addToSyncQueue error:', e); }
};

export const getSyncQueue = async (): Promise<any[]> => {
  await initDB();
  if (!db) return [];
  try {
    const results = db.exec('SELECT id, data FROM sync_queue ORDER BY id ASC');
    if (!results.length || !results[0].values.length) return [];
    return results[0].values.map((row: any[]) => {
      const item = JSON.parse(row[1] as string);
      item.id = row[0];
      return item;
    });
  } catch { return []; }
};

export const removeFromSyncQueue = async (id: number): Promise<void> => {
  await initDB();
  if (!db) return;
  try { db.run('DELETE FROM sync_queue WHERE id = ?', [id]); scheduleSave(); }
  catch (e) { console.error('removeFromSyncQueue error:', e); }
};

// ─── General ───────────────────────────────────────────────────

export const clearAllData = async (): Promise<void> => {
  await initDB();
  // Clean up audio files from OPFS
  try {
    const audioDir = await getAudioDir();
    const entries: string[] = [];
    for await (const [name] of (audioDir as any).entries()) {
      entries.push(name);
    }
    for (const name of entries) {
      try { await audioDir.removeEntry(name); } catch { /* ignore */ }
    }
  } catch { /* ignore - audio dir might not exist */ }

  const tables = ['todos', 'notes', 'profiles', 'achievements', 'kv', 'users', 'sync_queue'];
  for (const table of tables) {
    try { db!.run(`DELETE FROM ${table}`); } catch { /* ignore */ }
  }
  await saveToOPFS();
};

// ─── OPFS audio blob helpers (voice notes) ─────────────────────

const AUDIO_DIR = 'audio';

async function getAudioDir(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(AUDIO_DIR, { create: true });
}

export const saveAudioBlob = async (noteId: string, blob: Blob): Promise<string> => {
  const dir = await getAudioDir();
  const fileName = `${noteId}.webm`;
  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
  return `opfs-audio://${noteId}`;
};

export const loadAudioBlob = async (noteId: string): Promise<string | null> => {
  try {
    const dir = await getAudioDir();
    const fileName = `${noteId}.webm`;
    const fileHandle = await dir.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return URL.createObjectURL(file);
  } catch { return null; }
};

export const deleteAudioBlob = async (noteId: string): Promise<void> => {
  try {
    const dir = await getAudioDir();
    const fileName = `${noteId}.webm`;
    await dir.removeEntry(fileName);
  } catch { /* no-op */ }
};