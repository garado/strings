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

            <StyledButton
                text={isListening ? "stop" : "start"}
                onPress={isListening ? stop : start}
            />
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        justifyContent: "space-between",
        paddingBottom: n(48),
    },
    display: {
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-start",
        gap: n(8),
    },
    note: {
        fontSize: n(96),
        lineHeight: n(110),
    },
    freq: {
        fontSize: n(20),
    },
});
