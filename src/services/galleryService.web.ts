export async function saveStampPhotoToGallery(
  _localFileUri: string,
  _preferredFileName?: string,
  _albumName?: string,
): Promise<string | null> {
  return null;
}

export async function moveStampGalleryAlbum(
  assetId: string | null | undefined,
  _newGroupName: string,
  _localFileUri?: string,
): Promise<string | null> {
  return assetId ?? null;
}
