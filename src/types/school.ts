export type SchoolRecord = {
  id: string;
  name: string;
  schoolType: string;
  latitude: number;
  longitude: number;
};

export type NearestSchoolResult = {
  id: string;
  name: string;
  distanceM: number;
};
