import {
  getCameraHand,
  getCoordsLabelMode,
  getExtra1FieldLabel,
  getExtra2FieldLabel,
  getExtra3FieldLabel,
  getFloorDisplayMode,
  getMemoFieldLabel,
  getMemoTextAlign,
  getOverlayFooterPhrase,
  getOverlayOrgName,
  getOverlayShowFooterPhrase,
  getOverlayShowOrgName,
  getPdfShowDatetime,
  getPlaceFieldLabel,
  getStampTextLayout,
  getStampTextSize,
  getTitleFieldLabel,
  getTitleTextAlign,
  getWatermarkStyle,
  type CameraHand,
  type CoordsLabelMode,
  type FloorDisplayMode,
  type StampTextLayout,
  type StampTextSize,
  type TextAlign,
  type WatermarkStyle,
} from './settingsService';

export type StampSaveModalLayoutSettings = {
  titleTextAlign: TextAlign;
  memoTextAlign: TextAlign;
  cameraHand: CameraHand;
  stampTextLayout: StampTextLayout;
  stampTextSize: StampTextSize;
  watermarkStyle: WatermarkStyle;
  showDatetime: boolean;
  coordsLabel: CoordsLabelMode;
  floorDisplayMode: FloorDisplayMode;
  overlayOrgName: string;
  overlayFooterPhrase: string;
  overlayShowOrgName: boolean;
  overlayShowFooterPhrase: boolean;
  titleFieldLabel: string;
  placeFieldLabel: string;
  memoFieldLabel: string;
  extra1FieldLabel: string;
  extra2FieldLabel: string;
  extra3FieldLabel: string;
};

let cachedLayout: StampSaveModalLayoutSettings | null = null;
let loadPromise: Promise<StampSaveModalLayoutSettings> | null = null;

export function peekStampSaveModalLayoutCache(): StampSaveModalLayoutSettings | null {
  return cachedLayout;
}

export function invalidateStampSaveModalLayoutCache(): void {
  cachedLayout = null;
  loadPromise = null;
}

/** Update field labels in the in-memory cache (keep other layout settings). */
export function patchStampSaveModalLayoutFieldLabels(labels: {
  titleFieldLabel: string;
  placeFieldLabel: string;
  memoFieldLabel: string;
  extra1FieldLabel: string;
  extra2FieldLabel: string;
  extra3FieldLabel: string;
}): void {
  if (!cachedLayout) {
    return;
  }
  cachedLayout = {
    ...cachedLayout,
    titleFieldLabel: labels.titleFieldLabel,
    placeFieldLabel: labels.placeFieldLabel,
    memoFieldLabel: labels.memoFieldLabel,
    extra1FieldLabel: labels.extra1FieldLabel,
    extra2FieldLabel: labels.extra2FieldLabel,
    extra3FieldLabel: labels.extra3FieldLabel,
  };
}

export function loadStampSaveModalLayoutSettings(): Promise<StampSaveModalLayoutSettings> {
  if (cachedLayout) {
    return Promise.resolve(cachedLayout);
  }
  if (!loadPromise) {
    loadPromise = Promise.all([
      getTitleTextAlign(),
      getMemoTextAlign(),
      getCameraHand(),
      getStampTextLayout(),
      getStampTextSize(),
      getWatermarkStyle(),
      getPdfShowDatetime(),
      getCoordsLabelMode(),
      getFloorDisplayMode(),
      getOverlayOrgName(),
      getOverlayFooterPhrase(),
      getOverlayShowOrgName(),
      getOverlayShowFooterPhrase(),
      getTitleFieldLabel(),
      getPlaceFieldLabel(),
      getMemoFieldLabel(),
      getExtra1FieldLabel(),
      getExtra2FieldLabel(),
      getExtra3FieldLabel(),
    ]).then(
      ([
        titleTextAlign,
        memoTextAlign,
        cameraHand,
        stampTextLayout,
        stampTextSize,
        watermarkStyle,
        showDatetime,
        coordsLabel,
        floorDisplayMode,
        overlayOrgName,
        overlayFooterPhrase,
        overlayShowOrgName,
        overlayShowFooterPhrase,
        titleFieldLabel,
        placeFieldLabel,
        memoFieldLabel,
        extra1FieldLabel,
        extra2FieldLabel,
        extra3FieldLabel,
      ]) => {
        const settings: StampSaveModalLayoutSettings = {
          titleTextAlign,
          memoTextAlign,
          cameraHand,
          stampTextLayout,
          stampTextSize,
          watermarkStyle,
          showDatetime,
          coordsLabel,
          floorDisplayMode,
          overlayOrgName,
          overlayFooterPhrase,
          overlayShowOrgName,
          overlayShowFooterPhrase,
          titleFieldLabel,
          placeFieldLabel,
          memoFieldLabel,
          extra1FieldLabel,
          extra2FieldLabel,
          extra3FieldLabel,
        };
        cachedLayout = settings;
        return settings;
      },
    );
  }
  return loadPromise;
}
