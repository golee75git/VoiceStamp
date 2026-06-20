import fs from 'fs';
import path from 'path';

import Database from 'better-sqlite3';

const CSV_PATH = path.join('data', '전국초중등학교위치표준데이터-20260620.csv');
const OUT_PATH = path.join('assets', 'schools.sqlite');

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  fields.push(current);
  return fields;
}

function readCsvRows(filePath) {
  const bytes = fs.readFileSync(filePath);
  let text = new TextDecoder('euc-kr').decode(bytes);
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  return text.split(/\r?\n/).filter((line) => line.trim().length > 0);
}

const rows = readCsvRows(CSV_PATH);
if (rows.length < 2) {
  throw new Error(`CSV has no data rows: ${CSV_PATH}`);
}

const idx = {
  id: 0,
  name: 1,
  type: 2,
  status: 6,
  lat: 15,
  lon: 16,
  dataDate: 17,
};

const schools = [];
let dataVersion = null;

for (let i = 1; i < rows.length; i++) {
  const cols = parseCsvLine(rows[i]);
  if (cols.length <= idx.lon) {
    continue;
  }
  if (cols[idx.status]?.trim() !== '운영') {
    continue;
  }

  const latitude = Number.parseFloat(cols[idx.lat]);
  const longitude = Number.parseFloat(cols[idx.lon]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    continue;
  }

  const id = cols[idx.id]?.trim();
  const name = cols[idx.name]?.trim();
  if (!id || !name) {
    continue;
  }

  if (!dataVersion) {
    dataVersion = cols[idx.dataDate]?.trim() || 'unknown';
  }

  schools.push({
    id,
    name,
    type: cols[idx.type]?.trim() || '',
    latitude,
    longitude,
  });
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
if (fs.existsSync(OUT_PATH)) {
  fs.unlinkSync(OUT_PATH);
}

const db = new Database(OUT_PATH);
db.exec(`
  CREATE TABLE schools (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    school_type TEXT NOT NULL DEFAULT '',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
  );
  CREATE INDEX idx_schools_latitude ON schools(latitude);
  CREATE INDEX idx_schools_longitude ON schools(longitude);
  CREATE TABLE meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`);

const insert = db.prepare(`
  INSERT INTO schools (id, name, school_type, latitude, longitude)
  VALUES (@id, @name, @type, @latitude, @longitude)
`);

const insertAll = db.transaction((items) => {
  for (const school of items) {
    insert.run(school);
  }
});

insertAll(schools);
db.prepare(`INSERT INTO meta (key, value) VALUES ('dataVersion', ?)`).run(dataVersion ?? 'unknown');
db.close();

const sizeKb = Math.round(fs.statSync(OUT_PATH).size / 1024);
console.log(
  `Wrote ${schools.length} schools to ${OUT_PATH} (${sizeKb} KB, dataVersion=${dataVersion})`,
);
