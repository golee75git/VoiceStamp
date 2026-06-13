export type Stamp = {
  id: string;
  title: string;
  memo: string;
  imagePath: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
  galleryAssetId?: string | null;
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
};
