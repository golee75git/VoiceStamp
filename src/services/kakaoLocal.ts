import type { PlaceLabelMode } from './placeLabelMode';

type KakaoRegionDocument = {
  region_type?: string;
  region_1depth_name?: string;
  region_2depth_name?: string;
  region_3depth_name?: string;
};

type KakaoCoord2RegionResponse = {
  documents?: KakaoRegionDocument[];
};

type KakaoRoadAddress = {
  address_name?: string;
  building_name?: string;
};

type KakaoCoord2AddressDocument = {
  road_address?: KakaoRoadAddress | null;
};

type KakaoCoord2AddressResponse = {
  documents?: KakaoCoord2AddressDocument[];
};

type KakaoCategoryDocument = {
  place_name?: string;
  distance?: string;
};

type KakaoCategorySearchResponse = {
  documents?: KakaoCategoryDocument[];
};

type CoordAddress = {
  buildingName: string | null;
  roadAddressName: string | null;
};

const SCHOOL_SEARCH_RADIUS_M = 400;
const SCHOOL_PREFER_MAX_DISTANCE_M = 500;

function getKakaoRestKey(): string {
  return process.env.EXPO_PUBLIC_KAKAO_REST_KEY?.trim() ?? '';
}

function pickRegionLabel(documents: KakaoRegionDocument[]): string | null {
  const preferred =
    documents.find((doc) => doc.region_type === 'B') ??
    documents.find((doc) => doc.region_type === 'H') ??
    documents[0];

  if (!preferred) {
    return null;
  }

  const parts = [preferred.region_2depth_name, preferred.region_3depth_name].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' ');
  }

  return preferred.region_1depth_name ?? null;
}

function pickCoordAddress(documents: KakaoCoord2AddressDocument[]): CoordAddress {
  for (const doc of documents) {
    const road = doc.road_address;
    const buildingName = road?.building_name?.trim() || null;
    const roadAddressName = road?.address_name?.trim() || null;
    if (buildingName || roadAddressName) {
      return { buildingName, roadAddressName };
    }
  }
  return { buildingName: null, roadAddressName: null };
}

function parseDistanceM(doc: KakaoCategoryDocument | null | undefined): number | null {
  if (!doc?.distance) {
    return null;
  }
  const distance = Number(doc.distance);
  return Number.isFinite(distance) ? distance : null;
}

function isDaycarePlaceName(name: string): boolean {
  return name.includes('어린이집');
}

function isKindergartenPlaceName(name: string): boolean {
  return name.includes('유치원') && !isDaycarePlaceName(name);
}

function pickGeneralPlaceName(buildingName: string | null, roadAddressName: string | null): string | null {
  if (buildingName?.trim()) {
    return buildingName.trim();
  }
  if (roadAddressName?.trim()) {
    return roadAddressName.trim();
  }
  return null;
}

function pickEducationPlaceName(
  building: string | null,
  school: KakaoCategoryDocument | null,
  kindergarten: KakaoCategoryDocument | null,
): string | null {
  type Candidate = { name: string; distance: number };
  const candidates: Candidate[] = [];

  for (const doc of [school, kindergarten]) {
    if (!doc) {
      continue;
    }
    const name = doc.place_name?.trim();
    const distance = parseDistanceM(doc);
    if (!name || distance === null) {
      continue;
    }
    if (isDaycarePlaceName(name)) {
      continue;
    }
    if (doc === kindergarten && !isKindergartenPlaceName(name)) {
      continue;
    }
    if (distance <= SCHOOL_SEARCH_RADIUS_M) {
      candidates.push({ name, distance });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.distance - b.distance);
    return candidates[0].name;
  }

  const schoolName = school?.place_name?.trim() || null;
  const schoolDistance = parseDistanceM(school);
  if (
    building &&
    schoolName &&
    !isDaycarePlaceName(schoolName) &&
    schoolDistance !== null &&
    schoolDistance <= SCHOOL_PREFER_MAX_DISTANCE_M &&
    building.includes('아파트')
  ) {
    return schoolName;
  }

  return null;
}

function pickPublicPlaceName(publicPlace: KakaoCategoryDocument | null): string | null {
  const name = publicPlace?.place_name?.trim() || null;
  const distance = parseDistanceM(publicPlace);
  if (name && distance !== null && distance <= SCHOOL_SEARCH_RADIUS_M) {
    return name;
  }
  return null;
}

function combinePlaceLabel(region: string | null, placeName: string | null): string | null {
  const parts = [region, placeName].filter((part): part is string => Boolean(part?.trim()));
  if (parts.length === 0) {
    return null;
  }
  return parts.join(' ');
}

async function fetchRegionLabel(
  restKey: string,
  longitude: number,
  latitude: number,
): Promise<string | null> {
  const params = new URLSearchParams({
    x: String(longitude),
    y: String(latitude),
  });

  const response = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?${params.toString()}`,
    {
      headers: {
        Authorization: `KakaoAK ${restKey}`,
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as KakaoCoord2RegionResponse;
  if (!data.documents?.length) {
    return null;
  }

  return pickRegionLabel(data.documents);
}

async function fetchCoordAddress(
  restKey: string,
  longitude: number,
  latitude: number,
): Promise<CoordAddress> {
  const params = new URLSearchParams({
    x: String(longitude),
    y: String(latitude),
    input_coord: 'WGS84',
  });

  const response = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2address.json?${params.toString()}`,
    {
      headers: {
        Authorization: `KakaoAK ${restKey}`,
      },
    },
  );

  if (!response.ok) {
    return { buildingName: null, roadAddressName: null };
  }

  const data = (await response.json()) as KakaoCoord2AddressResponse;
  if (!data.documents?.length) {
    return { buildingName: null, roadAddressName: null };
  }

  return pickCoordAddress(data.documents);
}

async function fetchNearestCategory(
  restKey: string,
  longitude: number,
  latitude: number,
  categoryGroupCode: string,
): Promise<KakaoCategoryDocument | null> {
  const params = new URLSearchParams({
    category_group_code: categoryGroupCode,
    x: String(longitude),
    y: String(latitude),
    radius: String(SCHOOL_PREFER_MAX_DISTANCE_M),
    sort: 'distance',
    size: '5',
  });

  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/category.json?${params.toString()}`,
    {
      headers: {
        Authorization: `KakaoAK ${restKey}`,
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as KakaoCategorySearchResponse;
  if (!data.documents?.length) {
    return null;
  }

  return data.documents[0];
}

async function fetchNearestKindergarten(
  restKey: string,
  longitude: number,
  latitude: number,
): Promise<KakaoCategoryDocument | null> {
  const params = new URLSearchParams({
    category_group_code: 'PS3',
    x: String(longitude),
    y: String(latitude),
    radius: String(SCHOOL_PREFER_MAX_DISTANCE_M),
    sort: 'distance',
    size: '5',
  });

  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/category.json?${params.toString()}`,
    {
      headers: {
        Authorization: `KakaoAK ${restKey}`,
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as KakaoCategorySearchResponse;
  if (!data.documents?.length) {
    return null;
  }

  for (const doc of data.documents) {
    const name = doc.place_name?.trim();
    if (name && isKindergartenPlaceName(name)) {
      return doc;
    }
  }

  return null;
}

export async function getPlaceLabelFromCoords(
  longitude: number,
  latitude: number,
  mode: PlaceLabelMode = 'education',
): Promise<string | null> {
  const restKey = getKakaoRestKey();
  if (!restKey) {
    return null;
  }

  const [region, address] = await Promise.all([
    fetchRegionLabel(restKey, longitude, latitude),
    fetchCoordAddress(restKey, longitude, latitude),
  ]);

  const generalName = pickGeneralPlaceName(address.buildingName, address.roadAddressName);

  if (mode === 'general') {
    return combinePlaceLabel(region, generalName);
  }

  if (mode === 'public') {
    const publicPlace = await fetchNearestCategory(restKey, longitude, latitude, 'PO3');
    const placeName = pickPublicPlaceName(publicPlace) ?? generalName;
    return combinePlaceLabel(region, placeName);
  }

  const [school, kindergarten] = await Promise.all([
    fetchNearestCategory(restKey, longitude, latitude, 'SC4'),
    fetchNearestKindergarten(restKey, longitude, latitude),
  ]);

  const placeName =
    pickEducationPlaceName(address.buildingName, school, kindergarten) ?? generalName;
  return combinePlaceLabel(region, placeName);
}
