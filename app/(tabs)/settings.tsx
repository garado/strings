import * as Application from "expo-application";
import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useReferencePitch } from "@/contexts/ReferencePitchContext";
import { useHaptic } from "@/contexts/HapticContext";
import { useNoteDisplay } from "@/contexts/NoteDisplayContext";

export default function SettingsScreen() {
  const { referencePitch } = useReferencePitch();
  const { hapticEnabled, setHapticEnabled } = useHaptic();
  const { noteDisplay, setNoteDisplay } = useNoteDisplay();
  const version = Application.nativeApplicationVersion;

  return (
    <ContentContainer headerTitle={`Settings (v${version})`} hideBackButton>
      <SelectorButton
        label="Reference Pitch"
        value={referencePitch === 440 ? "A440" : `Custom (A${referencePitch})`}
        href="/settings/calibration"
      />
      <ToggleSwitch
        label="Use Flats"
        value={noteDisplay === "flat"}
        onValueChange={(v) => setNoteDisplay(v ? "flat" : "sharp")}
      />
      <ToggleSwitch
        label="In-Tune Haptic"
        value={hapticEnabled}
        onValueChange={setHapticEnabled}
      />
    </ContentContainer>
  );
}
