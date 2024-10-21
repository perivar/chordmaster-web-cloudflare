import ChordSheetJS, { Chord } from "chordsheetjs";

import { getChordInformation } from "./getChordInformation";

export const getChordSheetJSChord = (chordTry1: string): Chord | null => {
  const parsedChordTry1 = ChordSheetJS.Chord.parse(chordTry1);

  if (parsedChordTry1) {
    return parsedChordTry1;
  } else {
    // we cannot parse this chord
    console.warn(
      `Warning chordsheetjs could not parse chord ${chordTry1}. Therefore trying another parsing library ...`
    );

    // use another library to read the chord and try again
    const chordInfoTry2 = getChordInformation(chordTry1);
    if (chordInfoTry2.isChord && chordInfoTry2.chordName) {
      const chordTry2 = `${chordInfoTry2.chordName}`;
      const parsedChordTry2 = ChordSheetJS.Chord.parse(chordTry2);

      if (parsedChordTry2) {
        console.log(`Succesfully parsed ${chordTry2} using chordsheetjs`);
        return parsedChordTry2;
      } else {
        // we still cannot parse this chord
        console.warn(
          `Warning chordsheetjs could still not parse chord ${chordTry2}. Therefore trying to simplify before trying again ...`
        );

        // use another library to simplify the chord and try again
        const chordInfoTry3 = getChordInformation(chordTry1, true);
        if (chordInfoTry3.isChord && chordInfoTry3.chordName) {
          const chordTry3 = `${chordInfoTry3.chordName}`;
          const parsedChordTry3 = ChordSheetJS.Chord.parse(chordTry3);

          if (parsedChordTry3) {
            console.log(`Succesfully parsed ${chordTry3} using chordsheetjs`);
            return parsedChordTry3;
          } else {
            // we still cannot parse this chord
            console.error(
              `Error chordsheetjs could not parse chord ${chordTry3}.`
            );
          }
        }
      }
    }

    return null;
  }
};
