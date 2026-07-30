export type StampFloor = '1' | '2' | '3' | '4' | '5';

export type Stamp = {
  id: string;
  title: string;
  memo: string;
  imagePath: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
  galleryAssetId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  floor?: StampFloor | null;
  placeLabel?: string | null;
  extra1?: string | null;
  extra2?: string | null;
  extra3?: string | null;
  /** Confirmed http(s) URL for caption QR overlay (null = no QR). */
  sourceUrl?: string | null;
  /** Snapshot of UI field labels at save/edit time (null = use app defaults). */
  titleFieldLabel?: string | null;
  placeFieldLabel?: string | null;
  memoFieldLabel?: string | null;
  extra1FieldLabel?: string | null;
  extra2FieldLabel?: string | null;
  extra3FieldLabel?: string | null;
};

export type StampRow = {
  id: string;
  title: string;
  memo: string;
  image_path: string;
  created_at: number;
  updated_at: number;
  deleted_at?: number | null;
  gallery_asset_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  floor?: string | null;
  place_label?: string | null;
  extra1?: string | null;
  extra2?: string | null;
  extra3?: string | null;
  source_url?: string | null;
  title_field_label?: string | null;
  place_field_label?: string | null;
  memo_field_label?: string | null;
  extra1_field_label?: string | null;
  extra2_field_label?: string | null;
  extra3_field_label?: string | null;
};
