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

export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`;
