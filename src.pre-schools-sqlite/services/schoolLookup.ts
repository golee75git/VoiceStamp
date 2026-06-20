import { getDatabase } from '../db/database';
import type { NearestSchoolResult } from '../types/school';
import { haversineMeters } from '../utils/geoDistance';

type SchoolRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

function bboxDeltas(latitude: number, radiusM: number): { latDelta: number; lonDelta: number } {
  const latDelta = radiusM / 111_000;
  const lonDelta = radiusM / (111_000 * Math.cos((latitude * Math.PI) / 180));
  return { latDelta, lonDelta };
}

export async function findNearestSchool(
  latitude: number,
  longitude: number,
  radiusM: number,
): Promise<NearestSchoolResult | null> {
  const { latDelta, lonDelta } = bboxDeltas(latitude, radiusM);
  const db = await getDatabase();
  const rows = await db.getAllAsync<SchoolRow>(
    `SELECT id, name, latitude, longitude FROM schools
     WHERE latitude BETWEEN ? AND ?
       AND longitude BETWEEN ? AND ?`,
    latitude - latDelta,
    latitude + latDelta,
    longitude - lonDelta,
    longitude + lonDelta,
  );

  let nearest: NearestSchoolResult | null = null;
  for (const row of rows) {
    const distanceM = haversineMeters(latitude, longitude, row.latitude, row.longitude);
    if (distanceM > radiusM) {
      continue;
    }
    if (!nearest || distanceM < nearest.distanceM) {
      nearest = { id: row.id, name: row.name, distanceM };
    }
  }

  return nearest;
}
