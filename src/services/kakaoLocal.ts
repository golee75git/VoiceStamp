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

const SCHOOL_NEAR_RADIUS_M = 200;

type CoordAddress = {
  buildingName: string | null;
  roadAddressName: string | null;
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

function pickCoordAddress(documents: KakaoCoord2AddressDocument[]): CoordAddress {
  for (const doc of documents) {
    const buildingName = doc.road_address?.building_name?.trim() || null;
    const roadAddressName = doc.road_address?.address_name?.trim() || null;
    if (buildingName || roadAddressName) {
      return { buildingName, roadAddressName };
    }
  }
  return { buildingName: null, roadAddressName: null };
}

function pickGeneralPlaceName(buildingName: string | null, roadAddressName: string | null): string | null {
  return buildingName || roadAddressName || null;
}

function parseDistanceM(doc: KakaoCategoryDocument | null | undefined): number | null {
  if (!doc?.distance) {
    return null;
  }
  const distance = Number(doc.distance);
  return Number.isFinite(distance) ? distance : null;
}

function pickPlaceName(
  address: CoordAddress,
  school: KakaoCategoryDocument | null,
): string | null {
  const schoolName = school?.place_name?.trim() || null;
  const distance = parseDistanceM(school);

  if (schoolName && distance !== null && distance <= SCHOOL_NEAR_RADIUS_M) {
    return schoolName;
  }

  return pickGeneralPlaceName(address.buildingName, address.roadAddressName);
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

async function fetchNearestSchool(
  restKey: string,
  longitude: number,
  latitude: number,
): Promise<KakaoCategoryDocument | null> {
  const params = new URLSearchParams({
    category_group_code: 'SC4',
    x: String(longitude),
    y: String(latitude),
    radius: String(SCHOOL_NEAR_RADIUS_M),
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

export async function getPlaceLabelFromCoords(
  longitude: number,
  latitude: number,
): Promise<string | null> {
  const restKey = getKakaoRestKey();
  if (!restKey) {
    return null;
  }

  const [region, address, school] = await Promise.all([
    fetchRegionLabel(restKey, longitude, latitude),
    fetchCoordAddress(restKey, longitude, latitude),
    fetchNearestSchool(restKey, longitude, latitude),
  ]);

  const placeName = pickPlaceName(address, school);
  return combinePlaceLabel(region, placeName);
}
