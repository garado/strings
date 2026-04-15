import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import { startListening, stopListening, addPitchListener, setReferencePitch, PitchEvent } from "@/modules/pitch-detector";
import { useReferencePitch } from "@/contexts/ReferencePitchContext";

const SILENCE_TIMEOUT_MS = 3000;
const EMA_SMOOTHING = 0.3;
const MIN_MS_BETWEEN_UPDATES = 1000 / 60;

export function usePitchDetection() {
  const { referencePitch } = useReferencePitch();
  const [isListening, setIsListening] = useState(false);
  const [pitchResult, setPitchResult] = useState<PitchEvent | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const smoothedCentsRef = useRef<number>(0);
  const lastNoteRef = useRef<string>("");
  const lastUpdateRef = useRef<number>(0);

  const startPitchDetection = useCallback(async () => {
    if (isListening) return;

    if (Platform.OS === "android") {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Microphone Access",
          message: "Strings needs microphone access to detect pitch.",
          buttonPositive: "Allow",
        }
      );
      if (status !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    try {
      await startListening();
      setIsListening(true);
    } catch {
      return;
    }
  }, [isListening]);

  const stopPitchDetection = useCallback(async () => {
    await stopListening();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsListening(false);
    setPitchResult(null);
  }, []);

  // pitch smoothing, clearing, and publishing
  useEffect(() => {
    if (!isListening) return;

    const sub = addPitchListener((event) => {
      // smoothing
      if (event.note !== lastNoteRef.current) {
        lastNoteRef.current = event.note;
        smoothedCentsRef.current = event.cents;
      } else {
        smoothedCentsRef.current = smoothedCentsRef.current * (1 - EMA_SMOOTHING) + event.cents * EMA_SMOOTHING;
      }

      // publish new pitch (throttled to ~60fps)
      const now = Date.now();
      if (now - lastUpdateRef.current >= MIN_MS_BETWEEN_UPDATES) {
        lastUpdateRef.current = now;
        setPitchResult({ ...event, cents: Math.round(smoothedCentsRef.current) });
      }

      // clear on silence
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => setPitchResult(null), SILENCE_TIMEOUT_MS);
    });

    return () => {
      sub.remove();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isListening]);

  // update reference pitch calibration value
  useEffect(() => {
    setReferencePitch(referencePitch).catch(() => { });
  }, [referencePitch]);

  // stop audio engine when calling component unmounts
  useEffect(() => {
    return () => { stopPitchDetection().catch(() => { }); };
  }, [stopPitchDetection]);

  // stop detection when app is backgrounded or screen is locked
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        stopPitchDetection();
      } else if (state === "active") {
        startPitchDetection(); // background -> foreground
      }
    });
    return () => sub.remove();
  }, [stopPitchDetection, startPitchDetection]);

  return { isListening, pitchResult, startPitchDetection, stopPitchDetection };
}
