import * as SQLite from 'expo-sqlite';

import {
  ALTER_STAMPS_ADD_DELETED_AT,
  ALTER_STAMPS_ADD_GALLERY_ASSET_ID,
  ALTER_STAMPS_ADD_FLOOR,
  ALTER_STAMPS_ADD_LATITUDE,
  ALTER_STAMPS_ADD_LONGITUDE,
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
  const hasGalleryAssetId = columns.some((column) => column.name === 'gallery_asset_id');
  if (!hasGalleryAssetId) {
    await db.execAsync(ALTER_STAMPS_ADD_GALLERY_ASSET_ID);
  }
  const hasLatitude = columns.some((column) => column.name === 'latitude');
  if (!hasLatitude) {
    await db.execAsync(ALTER_STAMPS_ADD_LATITUDE);
  }
  const hasLongitude = columns.some((column) => column.name === 'longitude');
  if (!hasLongitude) {
    await db.execAsync(ALTER_STAMPS_ADD_LONGITUDE);
  }
  const hasFloor = columns.some((column) => column.name === 'floor');
  if (!hasFloor) {
    await db.execAsync(ALTER_STAMPS_ADD_FLOOR);
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
