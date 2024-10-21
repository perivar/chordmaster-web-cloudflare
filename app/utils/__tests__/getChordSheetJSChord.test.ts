import { Chord } from "chordsheetjs";

import { getChordSheetJSChord } from "../getChordSheetJSChord";

const chordTestOrig = `
[ch]Fadd9[/ch]        [ch]Dm7add11[/ch]     [ch]Am7add11[/ch]
[ch]Am7+11[/ch]
[ch]A7+5[/ch]        [ch]AM7[/ch]
[ch]G7-5[/ch]
[ch]Cmi7(add b9,#9)[/ch]
[ch]H[/ch]       [ch]F#[/ch]      [ch]Hadd9/F[/ch]
[ch]Hm7-5[/ch]
[ch]Hm7+5[/ch]
[ch]A/H[/ch]       [ch]Gm/H[/ch]
[ch]Em7[/ch]
[ch]C7(b9)[/ch]      [ch]Eb7(b5)[/ch]
[ch]E7+5-9[/ch]
[ch]E7-5+9[/ch]
`;

const chordTestResult = `
[ch]F2[/ch]        [ch]Dm7[/ch]     [ch]Am7[/ch]
[ch]Am7+11[/ch]
[ch]A7+5[/ch]        [ch]AM7[/ch]
[ch]G7-5[/ch]
[ch]Cm7[/ch]
[ch]B[/ch]       [ch]F#[/ch]      [ch]B2/F[/ch]
[ch]Bm7b5[/ch]
[ch]Bm7#5[/ch]
[ch]A/B[/ch]       [ch]Gm/B[/ch]
[ch]Em7[/ch]
[ch]C7(b9)[/ch]      [ch]Eb7(b5)[/ch]
[ch]E7+5-9[/ch]
[ch]E7-5+9[/ch]
`;

const cleanupChordSheetChords = (
  content: string,
  getChord: (chord: string) => Chord | null
) => {
  const replacer = (substring: string, ...args: any[]): string => {
    const match = args[0];
    // console.log(`Found: ${match} within ${substring}`);
    return `[ch]${getChord(match)}[/ch]`;
  };

  const chordsRegExp = /\[ch\]([^[]+)\[\/ch\]/g;
  return content.replace(chordsRegExp, replacer);
};

test("getChordSheetJSChord", () => {
  expect(cleanupChordSheetChords(chordTestOrig, getChordSheetJSChord)).toBe(
    chordTestResult
  );
});
