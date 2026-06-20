export const CREATE_STAMPS_TABLE = `
  CREATE TABLE IF NOT EXISTS stamps (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    memo TEXT NOT NULL DEFAULT '',
    image_path TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

export const CREATE_STAMPS_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_stamps_created_at ON stamps(created_at DESC);
`;

export const CREATE_STAMPS_TRASH_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_stamps_deleted_at ON stamps(deleted_at);
`;

export const ALTER_STAMPS_ADD_DELETED_AT = `
  ALTER TABLE stamps ADD COLUMN deleted_at INTEGER;
`;

export const ALTER_STAMPS_ADD_GALLERY_ASSET_ID = `
  ALTER TABLE stamps ADD COLUMN gallery_asset_id TEXT;
`;

export const ALTER_STAMPS_ADD_LATITUDE = `
  ALTER TABLE stamps ADD COLUMN latitude REAL;
`;

export const ALTER_STAMPS_ADD_LONGITUDE = `
  ALTER TABLE stamps ADD COLUMN longitude REAL;
`;

export const ALTER_STAMPS_ADD_FLOOR = `
  ALTER TABLE stamps ADD COLUMN floor TEXT;
`;

export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`;

export const CREATE_SCHOOLS_TABLE = `
  CREATE TABLE IF NOT EXISTS schools (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    school_type TEXT NOT NULL DEFAULT '',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
  );
`;

export const CREATE_SCHOOLS_LAT_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_schools_latitude ON schools(latitude);
`;

export const CREATE_SCHOOLS_LON_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_schools_longitude ON schools(longitude);
`;
