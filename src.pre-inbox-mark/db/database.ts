import * as SQLite from 'expo-sqlite';

import {
  ALTER_STAMPS_ADD_DELETED_AT,
  ALTER_STAMPS_ADD_GALLERY_ASSET_ID,
  ALTER_STAMPS_ADD_FLOOR,
  ALTER_STAMPS_ADD_PLACE_LABEL,
  ALTER_STAMPS_ADD_EXTRA1,
  ALTER_STAMPS_ADD_EXTRA2,
  ALTER_STAMPS_ADD_EXTRA3,
  ALTER_STAMPS_ADD_TITLE_FIELD_LABEL,
  ALTER_STAMPS_ADD_PLACE_FIELD_LABEL,
  ALTER_STAMPS_ADD_MEMO_FIELD_LABEL,
  ALTER_STAMPS_ADD_EXTRA1_FIELD_LABEL,
  ALTER_STAMPS_ADD_EXTRA2_FIELD_LABEL,
  ALTER_STAMPS_ADD_EXTRA3_FIELD_LABEL,
  ALTER_STAMPS_ADD_SOURCE_URL,
  ALTER_STAMPS_ADD_TEMPLATE_ID,
  ALTER_STAMPS_ADD_PARENT_ID,
  ALTER_STAMPS_ADD_LATITUDE,
  ALTER_STAMPS_ADD_LONGITUDE,
  CREATE_STAMPS_PARENT_INDEX,
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
  const hasPlaceLabel = columns.some((column) => column.name === 'place_label');
  if (!hasPlaceLabel) {
    await db.execAsync(ALTER_STAMPS_ADD_PLACE_LABEL);
  }
  const hasExtra1 = columns.some((column) => column.name === 'extra1');
  if (!hasExtra1) {
    await db.execAsync(ALTER_STAMPS_ADD_EXTRA1);
  }
  const hasExtra2 = columns.some((column) => column.name === 'extra2');
  if (!hasExtra2) {
    await db.execAsync(ALTER_STAMPS_ADD_EXTRA2);
  }
  const hasExtra3 = columns.some((column) => column.name === 'extra3');
  if (!hasExtra3) {
    await db.execAsync(ALTER_STAMPS_ADD_EXTRA3);
  }
  const hasTitleFieldLabel = columns.some((column) => column.name === 'title_field_label');
  if (!hasTitleFieldLabel) {
    await db.execAsync(ALTER_STAMPS_ADD_TITLE_FIELD_LABEL);
  }
  const hasPlaceFieldLabel = columns.some((column) => column.name === 'place_field_label');
  if (!hasPlaceFieldLabel) {
    await db.execAsync(ALTER_STAMPS_ADD_PLACE_FIELD_LABEL);
  }
  const hasMemoFieldLabel = columns.some((column) => column.name === 'memo_field_label');
  if (!hasMemoFieldLabel) {
    await db.execAsync(ALTER_STAMPS_ADD_MEMO_FIELD_LABEL);
  }
  const hasExtra1FieldLabel = columns.some((column) => column.name === 'extra1_field_label');
  if (!hasExtra1FieldLabel) {
    await db.execAsync(ALTER_STAMPS_ADD_EXTRA1_FIELD_LABEL);
  }
  const hasExtra2FieldLabel = columns.some((column) => column.name === 'extra2_field_label');
  if (!hasExtra2FieldLabel) {
    await db.execAsync(ALTER_STAMPS_ADD_EXTRA2_FIELD_LABEL);
  }
  const hasExtra3FieldLabel = columns.some((column) => column.name === 'extra3_field_label');
  if (!hasExtra3FieldLabel) {
    await db.execAsync(ALTER_STAMPS_ADD_EXTRA3_FIELD_LABEL);
  }
  const hasSourceUrl = columns.some((column) => column.name === 'source_url');
  if (!hasSourceUrl) {
    await db.execAsync(ALTER_STAMPS_ADD_SOURCE_URL);
  }
  const hasTemplateId = columns.some((column) => column.name === 'template_id');
  if (!hasTemplateId) {
    await db.execAsync(ALTER_STAMPS_ADD_TEMPLATE_ID);
  }
  const hasParentId = columns.some((column) => column.name === 'parent_id');
  if (!hasParentId) {
    await db.execAsync(ALTER_STAMPS_ADD_PARENT_ID);
  }
  await db.execAsync(CREATE_STAMPS_TRASH_INDEX);
  await db.execAsync(CREATE_STAMPS_PARENT_INDEX);
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
