import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import { startListening, stopListening, addPitchListener, setReferencePitch, PitchEvent } from "@/modules/pitch-detector";
import { useReferencePitch } from "@/contexts/ReferencePitchContext";

export function usePitchDetection() {
  const { referencePitch } = useReferencePitch();
  const [isListening, setIsListening] = useState(false);
  const [pitchResult, setPitchResult] = useState<PitchEvent | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const smoothedCentsRef = useRef<number>(0);
  const lastNoteRef = useRef<string>("");

  const start = useCallback(async () => {
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
    await startListening();
    setIsListening(true);
  }, []);

  const stop = useCallback(async () => {
    await stopListening();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsListening(false);
    setPitchResult(null);
  }, []);

  useEffect(() => {
    if (!isListening) return;

    const sub = addPitchListener((event) => {
      if (event.note !== lastNoteRef.current) {
        lastNoteRef.current = event.note;
        smoothedCentsRef.current = event.cents;
      } else {
        smoothedCentsRef.current = smoothedCentsRef.current * 0.7 + event.cents * 0.3;
      }
      setPitchResult({ ...event, cents: Math.round(smoothedCentsRef.current) });
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => setPitchResult(null), 3000);
    });

    return () => {
      sub.remove();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isListening]);

  useEffect(() => {
    setReferencePitch(referencePitch).catch(() => { });
  }, [referencePitch]);

  useEffect(() => {
    return () => { stopListening().catch(() => { }); };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        stopListening().catch(() => { });
      }
    });
    return () => sub.remove();
  }, []);

  return { isListening, pitchResult, start, stop };
}
