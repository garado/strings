import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { TunerGauge } from "@/components/TunerGauge";
import { n } from "@/utils/scaling";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useHaptic } from "@/contexts/HapticContext";

const IN_TUNE_THRESHOLD = 5;

export default function TunerScreen() {
    const { pitchResult, start, stop } = usePitchDetection();
    const { triggerHaptic } = useHaptic();
    const wasInTuneRef = useRef(false);

    useEffect(() => {
        const inTune = pitchResult !== null && Math.abs(pitchResult.cents) <= IN_TUNE_THRESHOLD;
        if (inTune && !wasInTuneRef.current) triggerHaptic();
        wasInTuneRef.current = inTune;
    }, [pitchResult]);

    useFocusEffect(
        useCallback(() => {
            start();
            return () => { stop(); };
        }, [])
    );

    return (
        <ContentContainer hideBackButton style={styles.content}>
            <View style={styles.noteRow}>
                <StyledText style={styles.note}>
                    {pitchResult ? pitchResult.note : "─"}
                </StyledText>
                {pitchResult && (
                    <StyledText style={styles.octave}>{pitchResult.octave}</StyledText>
                )}
            </View>

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
    noteRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: n(8),
    },
    note: {
        fontSize: n(96),
        lineHeight: n(110),
    },
    octave: {
        fontSize: n(30),
        paddingBottom: n(14),
    },
    freq: {
        fontSize: n(20),
    },
});
