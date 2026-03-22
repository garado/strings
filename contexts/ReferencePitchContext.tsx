import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_PITCH = 440;

interface ReferencePitchContextType {
  referencePitch: number;
  setReferencePitch: (value: number) => Promise<void>;
}

const ReferencePitchContext = createContext<ReferencePitchContextType>({
  referencePitch: DEFAULT_PITCH,
  setReferencePitch: async () => {},
});

export const useReferencePitch = () => useContext(ReferencePitchContext);

export const ReferencePitchProvider = ({ children }: { children: ReactNode }) => {
  const [referencePitch, setReferencePitchState] = useState(DEFAULT_PITCH);

  useEffect(() => {
    AsyncStorage.getItem("referencePitch").then((value) => {
      if (value !== null) setReferencePitchState(Number(value));
    });
  }, []);

  const setReferencePitch = async (value: number) => {
    setReferencePitchState(value);
    await AsyncStorage.setItem("referencePitch", String(value));
  };

  return (
    <ReferencePitchContext.Provider value={{ referencePitch, setReferencePitch }}>
      {children}
    </ReferencePitchContext.Provider>
  );
};
