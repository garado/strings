package expo.modules.pitchdetector

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.log2
import kotlin.math.round
import kotlin.math.sqrt

class PitchDetectorModule : Module() {
    private val sampleRate = 44100
    private val bufferSamples = 2048
    private val notes = arrayOf("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
    @Volatile private var referencePitch = 440.0

    private var audioRecord: AudioRecord? = null
    private var captureThread: Thread? = null
    private var isRunning = false

    override fun definition() = ModuleDefinition {
        Name("PitchDetector")

        Events("onPitchDetected")

        AsyncFunction("setReferencePitch") { hz: Double ->
            referencePitch = hz
        }

        AsyncFunction("startListening") {
            startCapture()
        }

        AsyncFunction("stopListening") {
            stopCapture()
        }
    }

    private fun startCapture() {
        val minBuffer = AudioRecord.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )
        val recordBufferBytes = maxOf(minBuffer, bufferSamples * 4)

        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            recordBufferBytes
        )

        isRunning = true
        audioRecord?.startRecording()

        captureThread = Thread {
            val shortBuf = ShortArray(bufferSamples)
            val floatBuf = FloatArray(bufferSamples)

            while (isRunning) {
                val read = audioRecord?.read(shortBuf, 0, bufferSamples) ?: break
                if (read < bufferSamples) continue

                for (i in 0 until bufferSamples) {
                    floatBuf[i] = shortBuf[i] / 32768.0f
                }

                val freq = detectPitch(floatBuf)
                if (freq > 0) {
                    val midi = 12 * log2(freq / referencePitch) + 69
                    val rounded = round(midi).toInt()
                    val cents = round((midi - rounded) * 100).toInt()
                    val octave = rounded / 12 - 1
                    val noteIndex = ((rounded % 12) + 12) % 12

                    sendEvent("onPitchDetected", mapOf(
                        "frequency" to freq,
                        "note" to notes[noteIndex],
                        "octave" to octave,
                        "cents" to cents
                    ))
                }
            }
        }.also { it.start() }
    }

    private fun stopCapture() {
        isRunning = false
        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null
        captureThread?.join(500)
        captureThread = null
    }

    private fun detectPitch(buffer: FloatArray): Double {
        var energy = 0.0
        for (s in buffer) energy += s * s
        if (energy / buffer.size < 0.0002) return -1.0

        val W = buffer.size / 2
        val minLag = sampleRate / 2000
        val maxLag = minOf(W - 1, sampleRate / 50 + 1)

        val diff = DoubleArray(maxLag + 1)
        for (tau in 1..maxLag) {
            var sum = 0.0
            for (j in 0 until W) {
                val d = (buffer[j] - buffer[j + tau]).toDouble()
                sum += d * d
            }
            diff[tau] = sum
        }

        val cmnd = DoubleArray(maxLag + 1)
        cmnd[0] = 1.0
        var running = 0.0
        for (tau in 1..maxLag) {
            running += diff[tau]
            cmnd[tau] = if (running > 0) (diff[tau] * tau) / running else 0.0
        }

        val threshold = 0.25
        for (tau in minLag..maxLag) {
            if (cmnd[tau] < threshold) {
                var t = tau
                while (t + 1 <= maxLag && cmnd[t + 1] < cmnd[t]) t++
                return sampleRate.toDouble() / parabolicInterp(cmnd, t, maxLag)
            }
        }

        var minVal = Double.MAX_VALUE
        var minTau = minLag
        for (tau in minLag..maxLag) {
            if (cmnd[tau] < minVal) { minVal = cmnd[tau]; minTau = tau }
        }
        if (minVal > 0.6) return -1.0
        return sampleRate.toDouble() / parabolicInterp(cmnd, minTau, maxLag)
    }

    private fun parabolicInterp(arr: DoubleArray, tau: Int, max: Int): Double {
        if (tau <= 0 || tau >= max) return tau.toDouble()
        val a = arr[tau - 1]; val b = arr[tau]; val c = arr[tau + 1]
        val denom = 2 * b - a - c
        return if (denom == 0.0) tau.toDouble() else tau + (a - c) / (2 * denom)
    }
}
