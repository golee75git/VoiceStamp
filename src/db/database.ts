import * as SQLite from 'expo-sqlite';

import {
  ALTER_STAMPS_ADD_DELETED_AT,
  CREATE_SETTINGS_TABLE,
  CREATE_STAMPS_INDEX,
  CREATE_STAMPS_TABLE,
  CREATE_STAMPS_TRASH_INDEX,
} from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrateStampsTable(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(stamps)');
  const hasDeletedAt = columns.some((column) => column.name === 'deleted_at');
  if (!hasDeletedAt) {
    await db.execAsync(ALTER_STAMPS_ADD_DELETED_AT);
  }
  await db.execAsync(CREATE_STAMPS_TRASH_INDEX);
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('voicestamp.db');
      await db.execAsync(CREATE_STAMPS_TABLE);
      await db.execAsync(CREATE_STAMPS_INDEX);
      await migrateStampsTable(db);
      await db.execAsync(CREATE_SETTINGS_TABLE);
      return db;
    })();
  }

  return dbPromise;
}
