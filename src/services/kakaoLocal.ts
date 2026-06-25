import { findNearestSchool } from './schoolLookup';

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

type KakaoJibunAddress = {
  address_name?: string;
  mountain_yn?: string;
  main_address_no?: string;
  sub_address_no?: string;
};

type KakaoCoord2AddressDocument = {
  address?: KakaoJibunAddress | null;
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

const SCHOOL_NEAR_RADIUS_M = 300;
const POI_SEARCH_RADIUS_M = 150;
const POI_MAX_DISTANCE_M = 100;
const POI_CATEGORY_CODES = ['CS2', 'CE7', 'FD6'] as const;

type CoordAddress = {
  buildingName: string | null;
  roadAddressName: string | null;
  jibunTail: string | null;
};

const EMPTY_COORD_ADDRESS: CoordAddress = {
  buildingName: null,
  roadAddressName: null,
  jibunTail: null,
};

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

function formatJibunTail(jibun: KakaoJibunAddress | null | undefined): string | null {
  if (!jibun) {
    return null;
  }
  const main = jibun.main_address_no?.trim();
  if (!main) {
    return null;
  }
  const sub = jibun.sub_address_no?.trim();
  const lot = sub ? `${main}-${sub}` : main;
  return jibun.mountain_yn === 'Y' ? `산 ${lot}` : lot;
}

function pickCoordAddress(documents: KakaoCoord2AddressDocument[]): CoordAddress {
  for (const doc of documents) {
    const buildingName = doc.road_address?.building_name?.trim() || null;
    const roadAddressName = doc.road_address?.address_name?.trim() || null;
    const jibunTail = formatJibunTail(doc.address);
    if (buildingName || roadAddressName || jibunTail) {
      return { buildingName, roadAddressName, jibunTail };
    }
  }
  return EMPTY_COORD_ADDRESS;
}

function pickGeneralPlaceName(
  buildingName: string | null,
  roadAddressName: string | null,
  jibunTail: string | null,
): string | null {
  return buildingName || roadAddressName || jibunTail || null;
}

function parseDistanceM(doc: KakaoCategoryDocument | null | undefined): number | null {
  if (!doc?.distance) {
    return null;
  }
  const distance = Number(doc.distance);
  return Number.isFinite(distance) ? distance : null;
}

function isSchoolWithinRadius(school: KakaoCategoryDocument | null): boolean {
  const schoolName = school?.place_name?.trim() || null;
  const distance = parseDistanceM(school);
  return Boolean(schoolName && distance !== null && distance <= SCHOOL_NEAR_RADIUS_M);
}

function needsNearbyPoiFallback(address: CoordAddress, school: KakaoCategoryDocument | null): boolean {
  if (isSchoolWithinRadius(school)) {
    return false;
  }
  return !pickGeneralPlaceName(address.buildingName, address.roadAddressName, address.jibunTail);
}

function pickPlaceName(
  address: CoordAddress,
  school: KakaoCategoryDocument | null,
  nearbyPoi: KakaoCategoryDocument | null,
): string | null {
  if (isSchoolWithinRadius(school)) {
    return school?.place_name?.trim() || null;
  }

  const general = pickGeneralPlaceName(address.buildingName, address.roadAddressName, address.jibunTail);
  if (general) {
    return general;
  }

  const poiName = nearbyPoi?.place_name?.trim() || null;
  const poiDistance = parseDistanceM(nearbyPoi);
  if (poiName && poiDistance !== null && poiDistance <= POI_MAX_DISTANCE_M) {
    return `${poiName} 근처`;
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
    return EMPTY_COORD_ADDRESS;
  }

  const data = (await response.json()) as KakaoCoord2AddressResponse;
  if (!data.documents?.length) {
    return EMPTY_COORD_ADDRESS;
  }

  return pickCoordAddress(data.documents);
}

async function fetchCategoryNearest(
  restKey: string,
  longitude: number,
  latitude: number,
  categoryGroupCode: string,
  radiusM: number,
): Promise<KakaoCategoryDocument | null> {
  const params = new URLSearchParams({
    category_group_code: categoryGroupCode,
    x: String(longitude),
    y: String(latitude),
    radius: String(radiusM),
    sort: 'distance',
    size: '3',
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

async function fetchNearestSchoolFromKakao(
  restKey: string,
  longitude: number,
  latitude: number,
): Promise<KakaoCategoryDocument | null> {
  return fetchCategoryNearest(restKey, longitude, latitude, 'SC4', SCHOOL_NEAR_RADIUS_M);
}

async function fetchNearestPoiFromKakao(
  restKey: string,
  longitude: number,
  latitude: number,
): Promise<KakaoCategoryDocument | null> {
  const results = await Promise.all(
    POI_CATEGORY_CODES.map((code) =>
      fetchCategoryNearest(restKey, longitude, latitude, code, POI_SEARCH_RADIUS_M),
    ),
  );

  let nearest: KakaoCategoryDocument | null = null;
  let nearestDistance: number | null = null;
  for (const doc of results) {
    const distance = parseDistanceM(doc);
    if (!doc || distance === null || distance > POI_MAX_DISTANCE_M) {
      continue;
    }
    if (nearestDistance === null || distance < nearestDistance) {
      nearest = doc;
      nearestDistance = distance;
    }
  }

  return nearest;
}

async function resolveNearestSchool(
  restKey: string,
  longitude: number,
  latitude: number,
): Promise<KakaoCategoryDocument | null> {
  const local = await findNearestSchool(latitude, longitude, SCHOOL_NEAR_RADIUS_M);
  if (local) {
    return {
      place_name: local.name,
      distance: String(Math.round(local.distanceM)),
    };
  }

  if (!restKey) {
    return null;
  }

  return fetchNearestSchoolFromKakao(restKey, longitude, latitude);
}

export async function getPlaceLabelFromCoords(
  longitude: number,
  latitude: number,
): Promise<string | null> {
  const restKey = getKakaoRestKey();

  const [region, address, school] = await Promise.all([
    restKey ? fetchRegionLabel(restKey, longitude, latitude) : Promise.resolve(null),
    restKey ? fetchCoordAddress(restKey, longitude, latitude) : Promise.resolve(EMPTY_COORD_ADDRESS),
    resolveNearestSchool(restKey, longitude, latitude),
  ]);

  let nearbyPoi: KakaoCategoryDocument | null = null;
  if (restKey && needsNearbyPoiFallback(address, school)) {
    nearbyPoi = await fetchNearestPoiFromKakao(restKey, longitude, latitude);
  }

  const placeName = pickPlaceName(address, school, nearbyPoi);
  return combinePlaceLabel(region, placeName);
}
