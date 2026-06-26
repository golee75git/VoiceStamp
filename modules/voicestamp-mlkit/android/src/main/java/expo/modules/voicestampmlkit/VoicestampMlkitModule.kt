package expo.modules.voicestampmlkit

import android.net.Uri
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.label.ImageLabeling
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

class VoicestampMlkitModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VoicestampMlkit")

    AsyncFunction("labelImage") { localUri: String, maxLabels: Int, minConfidence: Double ->
      val context = appContext.reactContext ?: throw Exception("React context unavailable")
      val path = localUri.removePrefix("file://")
      val sourceFile = File(path)
      if (!sourceFile.isFile) {
        throw Exception("Image file not found: $path")
      }

      val image = InputImage.fromFilePath(context, Uri.fromFile(sourceFile))
      val safeMax = maxLabels.coerceIn(1, 10)
      val safeConfidence = minConfidence.coerceIn(0.1, 1.0).toFloat()
      val options = ImageLabelerOptions.Builder()
        .setConfidenceThreshold(safeConfidence)
        .build()
      val labeler = ImageLabeling.getClient(options)

      try {
        val rawLabels = Tasks.await(labeler.process(image))
        val labels = rawLabels
          .sortedByDescending { it.confidence }
          .take(safeMax)
          .map { label ->
            mapOf(
              "text" to label.text,
              "confidence" to label.confidence.toDouble(),
            )
          }
        mapOf("labels" to labels)
      } finally {
        labeler.close()
      }
    }
  }
}
