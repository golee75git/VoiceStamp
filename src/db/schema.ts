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
