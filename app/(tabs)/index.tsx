import { View, StyleSheet } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { StyledButton } from "@/components/StyledButton";
import { n } from "@/utils/scaling";
import { usePitchDetection } from "@/hooks/usePitchDetection";

export default function TunerScreen() {
    const { isListening, pitchResult, start, stop } = usePitchDetection();

    return (
        <ContentContainer
            headerTitle="Tuner"
            hideBackButton
            style={styles.content}
        >
            <View style={styles.display}>
                <StyledText style={styles.note}>
                    {pitchResult ? `${pitchResult.note}${pitchResult.octave}` : "─"}
                </StyledText>
                <StyledText style={styles.freq}>
                    {pitchResult ? `${pitchResult.frequency.toFixed(1)} Hz` : ""}
                </StyledText>
            </View>

            <View style={styles.buttonRow}>
                <StyledButton
                    text={isListening ? "stop" : "start"}
                    onPress={isListening ? stop : start}
                />
            </View>
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        justifyContent: "space-between",
    },
    display: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        gap: n(8),
    },
    note: {
        fontSize: n(96),
        lineHeight: n(110),
    },
    freq: {
        fontSize: n(20),
    },
    buttonRow: {
        width: "100%",
        alignItems: "center",
        paddingBottom: n(48),
    },
});
