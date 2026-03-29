import { createContext, useContext, useState, ReactNode } from "react";

export type NoteDisplay = "sharp" | "flat";

const FLAT_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

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
  setNoteDisplay: () => {},
});

export const useNoteDisplay = () => useContext(NoteDisplayContext);

export const NoteDisplayProvider = ({ children }: { children: ReactNode }) => {
  const [noteDisplay, setNoteDisplay] = useState<NoteDisplay>("sharp");

  return (
    <NoteDisplayContext.Provider value={{ noteDisplay, setNoteDisplay }}>
      {children}
    </NoteDisplayContext.Provider>
  );
};
