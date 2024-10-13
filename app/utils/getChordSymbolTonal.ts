import { getChordInformationTonal } from "./getChordInformationTonal";

export const getChordSymbolTonal = (chord: string) => {
  // use @tonaljs/tonal to parse and replace with new name
  const chordInfo = getChordInformationTonal(chord);
  if (chordInfo.isChord && chordInfo.chordName) {
    return `${chordInfo.chordName}`;
  }
  return chord;
};
