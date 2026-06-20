import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';

const SCHOOLS_DB_NAME = 'schools.sqlite';
const SCHOOLS_DB_VERSION = '2026-03-20';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const schoolsDbAsset = require('../../assets/schools.sqlite');

let schoolsDbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function installSchoolsDatabaseIfNeeded(): Promise<void> {
  const sqliteDir = `${FileSystem.documentDirectory}SQLite`;
  const dbPath = `${sqliteDir}/${SCHOOLS_DB_NAME}`;
  const versionPath = `${sqliteDir}/schools.version`;

  const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
  }

  const [dbInfo, versionInfo] = await Promise.all([
    FileSystem.getInfoAsync(dbPath),
    FileSystem.getInfoAsync(versionPath),
  ]);

  if (dbInfo.exists && versionInfo.exists) {
    const storedVersion = await FileSystem.readAsStringAsync(versionPath);
    if (storedVersion === SCHOOLS_DB_VERSION) {
      return;
    }
  }

  const asset = Asset.fromModule(schoolsDbAsset);
  await asset.downloadAsync();
  const sourceUri = asset.localUri;
  if (!sourceUri) {
    throw new Error('학교 DB asset 경로를 찾지 못했습니다.');
  }

  if (dbInfo.exists) {
    await FileSystem.deleteAsync(dbPath, { idempotent: true });
  }

  await FileSystem.copyAsync({ from: sourceUri, to: dbPath });
  await FileSystem.writeAsStringAsync(versionPath, SCHOOLS_DB_VERSION);
}

export async function getSchoolsDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!schoolsDbPromise) {
    schoolsDbPromise = (async () => {
      await installSchoolsDatabaseIfNeeded();
      return SQLite.openDatabaseAsync(SCHOOLS_DB_NAME);
    })();
  }

  return schoolsDbPromise;
}
