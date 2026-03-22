import React from "react";
import { router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { StyledButton } from "@/components/StyledButton";
import { useReferencePitch } from "@/contexts/ReferencePitchContext";

export default function CalibrationScreen() {
  const { referencePitch, setReferencePitch } = useReferencePitch();

  const selectStandard = () => {
    setReferencePitch(440);
    router.back();
  };

  return (
    <ContentContainer headerTitle="Reference Pitch">
      <StyledButton text="A440" onPress={selectStandard} />
      <StyledButton
        text="Custom"
        onPress={() => router.push("/settings/calibration-custom" as any)}
      />
    </ContentContainer>
  );
}
