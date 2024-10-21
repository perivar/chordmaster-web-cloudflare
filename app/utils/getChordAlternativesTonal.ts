import { Chord as ChordTonal } from "tonal";

export interface ChordAlternatives {
  chordNames: string[];
  error: unknown;
}

export const getChordAlternativesTonal = (
  chordNotes: string[]
): ChordAlternatives => {
  let chordNames: string[] = [];
  let error: unknown;

  try {
    // lookup alternative chord names
    chordNames = ChordTonal.detect(chordNotes);
  } catch (e) {
    error = e;
  }

  return {
    chordNames,
    error,
  };
};
