import { Chord as ChordTonal, Note as NoteTonal } from "tonal";

import { ChordInformation } from "./getChordInformation";

export const getChordInformationTonal = (value: string): ChordInformation => {
  let isChord: boolean = false;
  let chordName: string = value;

  let notes: string[] = [];
  let intervals: string[] = [];
  let rootNote: string | undefined;
  let bassNote: string | undefined;

  let error: unknown;

  try {
    // get notes for this chord
    const chordTonal = ChordTonal.get(chordName);
    if (!chordTonal.empty) {
      isChord = true;
      rootNote = chordTonal.root;
      bassNote = chordTonal.bass;
      notes = chordTonal.notes;
      intervals = chordTonal.intervals;

      // Construct the chordName using aliases, tonic, and bass note
      const { aliases, tonic, symbol, bass } = chordTonal;

      if (aliases?.[0]) {
        // If alias exists, construct the name using tonic + alias
        chordName = `${tonic}${aliases[0]}`;

        // Append the bass note if it exists
        if (bass) {
          chordName += `/${bass}`;
        }
      } else {
        // Otherwise, use the symbol
        chordName = `${symbol}`;
      }

      chordName = chordSymbolUltimateGuitarRenderer(chordName);
    }

    // normalize note names
    // like Fb to E and C## to D
    // tonal calls this simplify
    notes = notes.map(note => {
      const normalizedChord = NoteTonal.simplify(note);
      return normalizedChord;
    });
  } catch (e) {
    error = e;
  }

  return {
    isChord,
    chordName,
    rootNote,
    bassNote,
    intervals,
    notes,
    error,
  };
};

const chordSymbolUltimateGuitarRenderer = (chordName: string) => {
  return chordName
    .replace(/[(), ]/g, "") // Remove unwanted characters like parentheses, commas, and spaces
    .replace(/mM(?!aj)/g, "mMaj") // Ensure "mM" gets replaced with "mMaj" only when it's not already "mMaj"
    .replace(/M(?!aj)/g, "Maj") // Replace isolated "M" with "Maj" (unless it's already "Maj")
    .replace(/Maj(?!\d)/g, "") // Remove "Maj" unless it is followed by a number
    .replace("°", "dim"); // Replace the degree symbol with "dim"
};
