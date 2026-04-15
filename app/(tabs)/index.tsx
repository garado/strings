import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { TunerGauge } from "@/components/TunerGauge";
import { n } from "@/utils/scaling";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useHaptic } from "@/contexts/HapticContext";
import { useReferencePitch } from "@/contexts/ReferencePitchContext";
import { useNoteDisplay, toDisplayNote } from "@/contexts/NoteDisplayContext";

const IN_TUNE_THRESHOLD = 5; // cents

export default function TunerScreen() {
  const { pitchResult, startPitchDetection, stopPitchDetection } = usePitchDetection();
  const { triggerHaptic } = useHaptic();
  const { referencePitch } = useReferencePitch();
  const { noteDisplay } = useNoteDisplay();
  const wasInTuneRef = useRef(false);

  // watch PitchResult and trigger haptic if pitch is within +-5 cents
  useEffect(() => {
    const inTune = pitchResult !== null && Math.abs(pitchResult.cents) <= IN_TUNE_THRESHOLD;
    if (inTune && !wasInTuneRef.current) triggerHaptic();
    wasInTuneRef.current = inTune;
  }, [pitchResult]);

  // start pitch detection when main screen is in focus
  // stop pitch detection when main screen is out of focus
  useFocusEffect(
    useCallback(() => {
      startPitchDetection();
      return () => { stopPitchDetection(); };
    }, [])
  );

  return (
    <ContentContainer hideBackButton style={styles.content}>
      <View style={styles.centerGroup}>
        <View style={styles.pitchGroup}>
          <View style={styles.noteRow}>
            <StyledText style={styles.note}>
              {pitchResult ? toDisplayNote(pitchResult.note, noteDisplay) : "─"}
            </StyledText>
            {pitchResult && (
              <StyledText style={styles.octave}>{pitchResult.octave}</StyledText>
            )}
          </View>

          <View style={styles.freqBox}>
            <StyledText style={styles.freq}>
              {pitchResult ? `${pitchResult.frequency.toFixed(1)} Hz` : "─"}
            </StyledText>
            <StyledText style={styles.referencePitch}>
              A4 = {referencePitch} Hz
            </StyledText>
          </View>
        </View>

        <TunerGauge cents={pitchResult?.cents ?? null} />
      </View>
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: n(32),
  },
  centerGroup: {
    alignItems: "center",
    gap: n(32),
  },
  pitchGroup: {
    alignItems: "center",
    gap: n(16),
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: n(8),
  },
  note: {
    fontSize: n(120),
    lineHeight: n(136),
  },
  octave: {
    fontSize: n(30),
    paddingBottom: n(14),
  },
  freqBox: {
    alignItems: "center",
    gap: n(4),
  },
  freq: {
    fontSize: n(20),
  },
  referencePitch: {
    fontSize: n(14),
    opacity: 0.4,
  },
});
