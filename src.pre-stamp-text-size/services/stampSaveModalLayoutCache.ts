import {
  getCameraHand,
  getCoordsLabelMode,
  getExtra1FieldLabel,
  getExtra2FieldLabel,
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
  getTitleFieldLabel,
  getTitleTextAlign,
  getWatermarkStyle,
  type CameraHand,
  type CoordsLabelMode,
  type FloorDisplayMode,
  type StampTextLayout,
  type TextAlign,
  type WatermarkStyle,
} from './settingsService';

export type StampSaveModalLayoutSettings = {
  titleTextAlign: TextAlign;
  memoTextAlign: TextAlign;
  cameraHand: CameraHand;
  stampTextLayout: StampTextLayout;
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
    ]).then(
      ([
        titleTextAlign,
        memoTextAlign,
        cameraHand,
        stampTextLayout,
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
      ]) => {
        const settings: StampSaveModalLayoutSettings = {
          titleTextAlign,
          memoTextAlign,
          cameraHand,
          stampTextLayout,
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
        };
        cachedLayout = settings;
        return settings;
      },
    );
  }
  return loadPromise;
}
