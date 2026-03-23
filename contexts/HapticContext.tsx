import { createContext, useContext, useState, ReactNode } from "react";
import * as Haptics from "expo-haptics";

const HapticContext = createContext<{
  triggerHaptic: () => void;
  hapticEnabled: boolean;
  setHapticEnabled: (enabled: boolean) => void;
}>({
  triggerHaptic: () => {},
  hapticEnabled: true,
  setHapticEnabled: () => {},
});

export const useHaptic = () => useContext(HapticContext);

export const HapticProvider = ({ children }: { children: ReactNode }) => {
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const triggerHaptic = () => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <HapticContext.Provider value={{ triggerHaptic, hapticEnabled, setHapticEnabled }}>
      {children}
    </HapticContext.Provider>
  );
};
