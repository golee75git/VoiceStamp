package expo.modules.voicestampgallery

import android.content.ContentValues
import android.os.Build
import android.provider.MediaStore
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileInputStream

class VoicestampGalleryModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VoicestampGallery")

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

  private fun sanitizeDisplayName(name: String): String {
    val trimmed = name.trim().ifEmpty { "VoiceStamp.jpg" }
    val cleaned = trimmed.replace(Regex("[\\\\/:*?\"<>|]"), "_")
    return if (cleaned.contains('.')) cleaned else "$cleaned.jpg"
  }

  private fun sanitizeAlbumFolder(folder: String): String {
    val trimmed = folder.trim().ifEmpty { "VoiceStamp" }
    return trimmed.replace(Regex("[\\\\/:*?\"<>|]"), "_")
  }
}
