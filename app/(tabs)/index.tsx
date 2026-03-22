import { StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { TunerGauge } from "@/components/TunerGauge";
import { n } from "@/utils/scaling";
import { usePitchDetection } from "@/hooks/usePitchDetection";

export default function TunerScreen() {
  const { pitchResult, start, stop } = usePitchDetection();

  useFocusEffect(
    useCallback(() => {
      start();
      return () => { stop(); };
    }, [])
  );

  return (
    <ContentContainer hideBackButton style={styles.content}>
      <StyledText style={styles.note}>
        {pitchResult ? `${pitchResult.note}${pitchResult.octave}` : "─"}
      </StyledText>

      <StyledText style={styles.freq}>
        {pitchResult ? `${pitchResult.frequency.toFixed(1)} Hz` : "─"}
      </StyledText>

      <TunerGauge cents={pitchResult?.cents ?? null} />
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: n(32),
  },
  note: {
    fontSize: n(96),
    lineHeight: n(110),
  },
  freq: {
    fontSize: n(20),
  },
});
