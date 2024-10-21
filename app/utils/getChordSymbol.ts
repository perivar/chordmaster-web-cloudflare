import { getChordInformation } from "./getChordInformation";

export const getChordSymbol = (chord: string): string => {
  // use chord-symbol to parse and replace with new name
  const chordInfo = getChordInformation(chord);
  if (chordInfo.isChord && chordInfo.chordName) {
    return `${chordInfo.chordName}`;
  }
  return chord;
};
