import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { useReferencePitch } from "@/contexts/ReferencePitchContext";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";

export default function CalibrationCustomScreen() {
  const { referencePitch, setReferencePitch } = useReferencePitch();
  const { invertColors } = useInvertColors();
  const textColor = invertColors ? "black" : "white";

  const [value, setValue] = useState(
    referencePitch !== 440 ? String(referencePitch) : ""
  );
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const confirm = () => {
    const hz = Number(value);
    if (hz >= 400 && hz <= 480) {
      setReferencePitch(hz);
      router.back();
    }
  };

  return (
    <ContentContainer headerTitle="Custom Reference Pitch">
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: textColor, borderBottomColor: textColor }]}
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={confirm}
          placeholder="440"
          placeholderTextColor={invertColors ? "#999" : "#555"}
        />
        <StyledText style={styles.unit}>Hz</StyledText>
      </View>
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    width: "100%",
    gap: n(12),
    paddingTop: n(16),
  },
  input: {
    fontFamily: "PublicSans-Regular",
    fontSize: n(64),
    borderBottomWidth: 1,
    paddingBottom: n(4),
    minWidth: n(160),
  },
  unit: {
    fontSize: n(24),
    paddingBottom: n(10),
  },
});
