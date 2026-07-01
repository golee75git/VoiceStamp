import {
  getCameraHand,
  getCoordsLabelMode,
  getFloorDisplayMode,
  getMemoTextAlign,
  getOverlayFooterPhrase,
  getOverlayOrgName,
  getOverlayShowFooterPhrase,
  getOverlayShowOrgName,
  getPdfShowDatetime,
  getStampTextLayout,
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
        };
        cachedLayout = settings;
        return settings;
      },
    );
  }
  return loadPromise;
}
