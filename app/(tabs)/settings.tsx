import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useReferencePitch } from "@/contexts/ReferencePitchContext";
import { useHaptic } from "@/contexts/HapticContext";

export default function SettingsScreen() {
  const { referencePitch } = useReferencePitch();
  const { hapticEnabled, setHapticEnabled } = useHaptic();

  return (
    <ContentContainer headerTitle="Settings" hideBackButton>
      <SelectorButton
        label="Reference Pitch"
        value={referencePitch === 440 ? "A440" : `Custom (A${referencePitch})`}
        href="/settings/calibration"
      />
      <ToggleSwitch
        label="In-Tune Haptic"
        value={hapticEnabled}
        onValueChange={setHapticEnabled}
      />
    </ContentContainer>
  );
}
