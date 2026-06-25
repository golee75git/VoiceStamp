package expo.modules.voicestampgallery

import android.content.ContentValues
import android.graphics.BitmapFactory
import android.os.Build
import android.provider.MediaStore
import androidx.exifinterface.media.ExifInterface
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileInputStream

class VoicestampGalleryModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VoicestampGallery")

    AsyncFunction("embedExifFromSource") { captionUri: String, sourceUri: String?, latitude: Double?, longitude: Double? ->
      val captionPath = captionUri.removePrefix("file://")
      val captionFile = File(captionPath)
      if (!captionFile.isFile) {
        throw Exception("Caption file not found: $captionPath")
      }

      val exif = ExifInterface(captionPath)
      val sourcePath = sourceUri?.trim()?.removePrefix("file://")?.takeIf { it.isNotEmpty() }
      if (sourcePath != null) {
        val sourceFile = File(sourcePath)
        if (sourceFile.isFile) {
          copyExifTags(ExifInterface(sourcePath), exif)
        }
      }

      val hasGps = exif.getAttribute(ExifInterface.TAG_GPS_LATITUDE) != null
      if (!hasGps && latitude != null && longitude != null) {
        exif.setLatLong(latitude, longitude)
      }

      val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
      BitmapFactory.decodeFile(captionPath, bounds)
      if (bounds.outWidth > 0 && bounds.outHeight > 0) {
        exif.setAttribute(ExifInterface.TAG_IMAGE_WIDTH, bounds.outWidth.toString())
        exif.setAttribute(ExifInterface.TAG_IMAGE_LENGTH, bounds.outHeight.toString())
      }

      exif.saveAttributes()
      captionUri
    }

    AsyncFunction("saveImageWithDisplayName") { localUri: String, displayName: String, albumFolder: String ->
      val context = appContext.reactContext ?: throw Exception("React context unavailable")
      val resolver = context.contentResolver

      val path = localUri.removePrefix("file://")
      val sourceFile = File(path)
      if (!sourceFile.isFile) {
        throw Exception("Source file not found: $path")
      }

      val safeName = sanitizeDisplayName(displayName)
      val safeAlbum = sanitizeAlbumFolder(albumFolder)
      val mimeType = if (safeName.endsWith(".png", ignoreCase = true)) "image/png" else "image/jpeg"

      val values = ContentValues().apply {
        put(MediaStore.Images.Media.DISPLAY_NAME, safeName)
        put(MediaStore.Images.Media.MIME_TYPE, mimeType)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
          put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/$safeAlbum")
          put(MediaStore.Images.Media.IS_PENDING, 1)
        }
      }

      val collection =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
          MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        } else {
          MediaStore.Images.Media.EXTERNAL_CONTENT_URI
        }

      val itemUri = resolver.insert(collection, values)
        ?: throw Exception("MediaStore insert failed")

      try {
        resolver.openOutputStream(itemUri)?.use { out ->
          FileInputStream(sourceFile).use { input ->
            input.copyTo(out)
          }
        } ?: throw Exception("Failed to open output stream")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
          val clearPending = ContentValues().apply {
            put(MediaStore.Images.Media.IS_PENDING, 0)
          }
          resolver.update(itemUri, clearPending, null, null)
        }

        itemUri.toString()
      } catch (error: Exception) {
        resolver.delete(itemUri, null, null)
        throw error
      }
    }
  }

  private fun copyExifTags(source: ExifInterface, target: ExifInterface) {
    for (tag in COPY_EXIF_TAGS) {
      val value = source.getAttribute(tag) ?: continue
      target.setAttribute(tag, value)
    }
  }

  private fun sanitizeDisplayName(name: String): String {
    val trimmed = name.trim().ifEmpty { "VoiceStamp.jpg" }
    val cleaned = trimmed.replace(Regex("[\\\\/:*?\"<>|]"), "_")
    return if (cleaned.contains('.')) cleaned else "$cleaned.jpg"
  }

  private fun sanitizeAlbumFolder(folder: String): String {
    val trimmed = folder.trim().ifEmpty { "VoiceStamp" }
    return trimmed.replace(Regex("[\\\\/:*?\"<>|]"), "_")
  }

  companion object {
    private val COPY_EXIF_TAGS =
      arrayOf(
        ExifInterface.TAG_DATETIME,
        ExifInterface.TAG_DATETIME_ORIGINAL,
        ExifInterface.TAG_DATETIME_DIGITIZED,
        ExifInterface.TAG_MAKE,
        ExifInterface.TAG_MODEL,
        ExifInterface.TAG_ISO_SPEED_RATINGS,
        ExifInterface.TAG_PHOTOGRAPHIC_SENSITIVITY,
        ExifInterface.TAG_F_NUMBER,
        ExifInterface.TAG_EXPOSURE_TIME,
        ExifInterface.TAG_FOCAL_LENGTH,
        ExifInterface.TAG_FLASH,
        ExifInterface.TAG_WHITE_BALANCE,
        ExifInterface.TAG_GPS_LATITUDE,
        ExifInterface.TAG_GPS_LATITUDE_REF,
        ExifInterface.TAG_GPS_LONGITUDE,
        ExifInterface.TAG_GPS_LONGITUDE_REF,
        ExifInterface.TAG_GPS_ALTITUDE,
        ExifInterface.TAG_GPS_ALTITUDE_REF,
        ExifInterface.TAG_GPS_DATESTAMP,
        ExifInterface.TAG_GPS_TIMESTAMP,
      )
  }
}
