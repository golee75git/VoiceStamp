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

export const ALTER_STAMPS_ADD_PLACE_LABEL = `
  ALTER TABLE stamps ADD COLUMN place_label TEXT;
`;

export const ALTER_STAMPS_ADD_EXTRA1 = `
  ALTER TABLE stamps ADD COLUMN extra1 TEXT;
`;

export const ALTER_STAMPS_ADD_EXTRA2 = `
  ALTER TABLE stamps ADD COLUMN extra2 TEXT;
`;

export const ALTER_STAMPS_ADD_EXTRA3 = `
  ALTER TABLE stamps ADD COLUMN extra3 TEXT;
`;

export const ALTER_STAMPS_ADD_TITLE_FIELD_LABEL = `
  ALTER TABLE stamps ADD COLUMN title_field_label TEXT;
`;

export const ALTER_STAMPS_ADD_PLACE_FIELD_LABEL = `
  ALTER TABLE stamps ADD COLUMN place_field_label TEXT;
`;

export const ALTER_STAMPS_ADD_MEMO_FIELD_LABEL = `
  ALTER TABLE stamps ADD COLUMN memo_field_label TEXT;
`;

export const ALTER_STAMPS_ADD_EXTRA1_FIELD_LABEL = `
  ALTER TABLE stamps ADD COLUMN extra1_field_label TEXT;
`;

export const ALTER_STAMPS_ADD_EXTRA2_FIELD_LABEL = `
  ALTER TABLE stamps ADD COLUMN extra2_field_label TEXT;
`;

export const ALTER_STAMPS_ADD_EXTRA3_FIELD_LABEL = `
  ALTER TABLE stamps ADD COLUMN extra3_field_label TEXT;
`;

export const ALTER_STAMPS_ADD_SOURCE_URL = `
  ALTER TABLE stamps ADD COLUMN source_url TEXT;
`;

export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`;
