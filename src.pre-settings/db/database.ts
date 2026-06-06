import * as SQLite from 'expo-sqlite';

import { CREATE_STAMPS_INDEX, CREATE_STAMPS_TABLE } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('voicestamp.db');
      await db.execAsync(CREATE_STAMPS_TABLE);
      await db.execAsync(CREATE_STAMPS_INDEX);
      return db;
    })();
  }

  return dbPromise;
}
