import { Chord } from "chordsheetjs";

import { getChordSymbol } from "./getChordSymbol";

export const getChordAsString = (chord: Chord) => {
  return getChordSymbol(chord.toString());
};
