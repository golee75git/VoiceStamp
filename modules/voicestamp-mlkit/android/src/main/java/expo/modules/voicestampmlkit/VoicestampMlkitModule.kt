package expo.modules.voicestampmlkit

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.net.Uri
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.korean.KoreanTextRecognizerOptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.TimeUnit
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * On-device privacy masking: Face Detection + Korean OCR → mosaic blur.
 * Photos never leave the device. Not for biometric identification.
 */
class VoicestampMlkitModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VoicestampMlkit")

    AsyncFunction("detectPrivacyRegions") { localUri: String ->
      val context = appContext.reactContext ?: throw Exception("React context unavailable")
      val cacheDir = context.cacheDir
      val sourceFile = materializeLocalFile(localUri, cacheDir)
      val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
      BitmapFactory.decodeFile(sourceFile.absolutePath, bounds)
      val imgWidth = bounds.outWidth
      val imgHeight = bounds.outHeight
      if (imgWidth <= 0 || imgHeight <= 0) {
        throw Exception("Cannot decode image bounds")
      }

      val image = InputImage.fromFilePath(context, Uri.fromFile(sourceFile))

      val faceOptions =
        FaceDetectorOptions.Builder()
          .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
          .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_NONE)
          .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_NONE)
          .build()
      val faceDetector = FaceDetection.getClient(faceOptions)
      val textRecognizer =
        TextRecognition.getClient(KoreanTextRecognizerOptions.Builder().build())

      try {
        val faces = Tasks.await(faceDetector.process(image), 12, TimeUnit.SECONDS)
        val textResult = Tasks.await(textRecognizer.process(image), 12, TimeUnit.SECONDS)

        val regions = mutableListOf<Map<String, Any?>>()
        faces.forEachIndexed { index, face ->
          val box = face.boundingBox
          regions.add(
            regionMap(
              id = "face-$index",
              type = "face",
              box = box,
              text = null,
            ),
          )
        }

        var textIndex = 0
        for (block in textResult.textBlocks) {
          val value = block.text ?: continue
          if (!DIGIT_REGEX.containsMatchIn(value)) {
            continue
          }
          val box = block.boundingBox ?: continue
          regions.add(
            regionMap(
              id = "text-$textIndex",
              type = "text",
              box = box,
              text = value.take(120),
            ),
          )
          textIndex += 1
        }

        mapOf(
          "width" to imgWidth,
          "height" to imgHeight,
          "regions" to regions,
        )
      } finally {
        faceDetector.close()
        textRecognizer.close()
      }
    }

    AsyncFunction("applyBlurRegions") { localUri: String, regionsJson: String, strength: String ->
      val context = appContext.reactContext ?: throw Exception("React context unavailable")
      val cacheDir = context.cacheDir
      val sourceFile = materializeLocalFile(localUri, cacheDir)

      val decoded =
        BitmapFactory.decodeFile(sourceFile.absolutePath)
          ?: throw Exception("Cannot decode image")
      val bitmap =
        if (decoded.isMutable) {
          decoded
        } else {
          val copy = decoded.copy(Bitmap.Config.ARGB_8888, true)
          decoded.recycle()
          copy ?: throw Exception("Cannot create mutable bitmap")
        }

      val blockSize = mosaicBlockSize(strength)
      val inflate = if (strength == "strong") 0.15f else 0.12f
      val canvas = Canvas(bitmap)
      val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }

      val arr = JSONArray(regionsJson)
      for (i in 0 until arr.length()) {
        val obj = arr.optJSONObject(i) ?: continue
        if (obj.optBoolean("enabled", true).not()) {
          continue
        }
        val left = obj.optDouble("left", Double.NaN)
        val top = obj.optDouble("top", Double.NaN)
        val width = obj.optDouble("width", Double.NaN)
        val height = obj.optDouble("height", Double.NaN)
        if (
          left.isNaN() ||
            top.isNaN() ||
            width.isNaN() ||
            height.isNaN() ||
            width <= 0 ||
            height <= 0
        ) {
          continue
        }
        val type = obj.optString("type", "text")
        val padFactor = if (type == "face") inflate else 0.06f
        val rect =
          inflateRect(
            left.roundToInt(),
            top.roundToInt(),
            width.roundToInt(),
            height.roundToInt(),
            padFactor,
            bitmap.width,
            bitmap.height,
          )
        drawMosaic(bitmap, canvas, paint, rect, blockSize)
      }

      val outFile = File(cacheDir, "voicestamp-blur-${System.currentTimeMillis()}.jpg")
      FileOutputStream(outFile).use { out ->
        if (!bitmap.compress(Bitmap.CompressFormat.JPEG, 92, out)) {
          bitmap.recycle()
          throw Exception("Failed to compress blurred JPEG")
        }
      }
      bitmap.recycle()
      "file://${outFile.absolutePath}"
    }
  }

  private fun regionMap(
    id: String,
    type: String,
    box: Rect,
    text: String?,
  ): Map<String, Any?> {
    return mapOf(
      "id" to id,
      "type" to type,
      "left" to box.left.toDouble(),
      "top" to box.top.toDouble(),
      "width" to box.width().toDouble(),
      "height" to box.height().toDouble(),
      "text" to text,
      "enabled" to true,
    )
  }

  private fun mosaicBlockSize(strength: String): Int {
    return when (strength) {
      "light" -> 12
      "strong" -> 40
      else -> 24
    }
  }

  private fun inflateRect(
    left: Int,
    top: Int,
    width: Int,
    height: Int,
    factor: Float,
    imgW: Int,
    imgH: Int,
  ): Rect {
    val padX = (width * factor).roundToInt()
    val padY = (height * factor).roundToInt()
    val l = max(0, left - padX)
    val t = max(0, top - padY)
    val r = min(imgW, left + width + padX)
    val b = min(imgH, top + height + padY)
    return Rect(l, t, max(l + 1, r), max(t + 1, b))
  }

  private fun drawMosaic(
    bitmap: Bitmap,
    canvas: Canvas,
    paint: Paint,
    rect: Rect,
    blockSize: Int,
  ) {
    val size = max(4, blockSize)
    var y = rect.top
    while (y < rect.bottom) {
      var x = rect.left
      val y2 = min(rect.bottom, y + size)
      while (x < rect.right) {
        val x2 = min(rect.right, x + size)
        val cx = min(bitmap.width - 1, (x + x2) / 2)
        val cy = min(bitmap.height - 1, (y + y2) / 2)
        paint.color = bitmap.getPixel(cx, cy)
        canvas.drawRect(x.toFloat(), y.toFloat(), x2.toFloat(), y2.toFloat(), paint)
        x = x2
      }
      y = y2
    }
  }

  /** Copy content:// (or plain path) into a real file for ML Kit + BitmapFactory. */
  private fun materializeLocalFile(localUri: String, cacheDir: File): File {
    val trimmed = localUri.trim()
    if (trimmed.startsWith("content://")) {
      val context = appContext.reactContext ?: throw Exception("React context unavailable")
      val tmp = File(cacheDir, "voicestamp-mlkit-src-${System.currentTimeMillis()}.jpg")
      context.contentResolver.openInputStream(Uri.parse(trimmed))?.use { input ->
        FileOutputStream(tmp).use { output -> input.copyTo(output) }
      } ?: throw Exception("Cannot open content URI")
      return tmp
    }
    val path = trimmed.removePrefix("file://")
    val file = File(path)
    if (!file.isFile) {
      throw Exception("Source file not found: $path")
    }
    // Soft path check: reject obvious path traversal tokens in the URI string.
    if (trimmed.contains("..")) {
      throw Exception("Invalid image path")
    }
    return file
  }

  companion object {
    private val DIGIT_REGEX = Regex("\\d")
  }
}
