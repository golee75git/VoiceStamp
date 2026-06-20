import type { SQLiteDatabase } from 'expo-sqlite';

const SCHOOLS_DATA_VERSION_KEY = 'schools_data_version';

type SchoolsSeedFile = {
  dataVersion: string;
  schools: {
    id: string;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
  }[];
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const schoolsSeed = require('../../assets/schools.seed.json') as SchoolsSeedFile;

const INSERT_SCHOOL = `
  INSERT OR REPLACE INTO schools (id, name, school_type, latitude, longitude)
  VALUES (?, ?, ?, ?, ?)
`;

export async function seedSchoolsIfNeeded(db: SQLiteDatabase): Promise<void> {
  const countRow = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM schools');
  const existingCount = countRow?.count ?? 0;
  const storedVersion = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    SCHOOLS_DATA_VERSION_KEY,
  );
  const targetVersion = schoolsSeed.dataVersion;

  if (existingCount > 0 && storedVersion?.value === targetVersion) {
    return;
  }

  await db.withTransactionAsync(async () => {
    if (existingCount > 0) {
      await db.execAsync('DELETE FROM schools');
    }

    for (const school of schoolsSeed.schools) {
      await db.runAsync(INSERT_SCHOOL, [
        school.id,
        school.name,
        school.type,
        school.latitude,
        school.longitude,
      ]);
    }

    await db.runAsync(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
      SCHOOLS_DATA_VERSION_KEY,
      targetVersion,
    );
  });
}
