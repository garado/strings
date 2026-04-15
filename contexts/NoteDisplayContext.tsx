import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NoteDisplay = "sharp" | "flat";

const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function toDisplayNote(note: string, display: NoteDisplay): string {
  const idx = SHARP_NOTES.indexOf(note);
  if (idx === -1) return note;
  return display === "flat" ? FLAT_NOTES[idx] : note;
}

const NoteDisplayContext = createContext<{
  noteDisplay: NoteDisplay;
  setNoteDisplay: (v: NoteDisplay) => void;
}>({
  noteDisplay: "sharp",
  setNoteDisplay: () => { },
});

export const useNoteDisplay = () => useContext(NoteDisplayContext);

export const NoteDisplayProvider = ({ children }: { children: ReactNode }) => {
  const [noteDisplay, setNoteDisplayState] = useState<NoteDisplay>("sharp");

  useEffect(() => {
    AsyncStorage.getItem("noteDisplay").then((value) => {
      if (value === "flat" || value === "sharp") setNoteDisplayState(value);
    });
  }, []);

  const setNoteDisplay = (value: NoteDisplay) => {
    setNoteDisplayState(value);
    AsyncStorage.setItem("noteDisplay", value);
  };

  return (
    <NoteDisplayContext.Provider value={{ noteDisplay, setNoteDisplay }}>
      {children}
    </NoteDisplayContext.Provider>
  );
};
