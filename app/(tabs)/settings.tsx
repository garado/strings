import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { useReferencePitch } from "@/contexts/ReferencePitchContext";

export default function SettingsScreen() {
  const { referencePitch } = useReferencePitch();

  return (
    <ContentContainer headerTitle="Settings" hideBackButton>
      <SelectorButton
        label="Reference Pitch"
        value={referencePitch === 440 ? "A440" : `Custom (A${referencePitch})`}
        href="/settings/calibration"
      />
    </ContentContainer>
  );
}
