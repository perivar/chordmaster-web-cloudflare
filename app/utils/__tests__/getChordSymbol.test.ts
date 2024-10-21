import { getChordSymbol } from "../getChordSymbol";
import { getChordSymbolTonal } from "../getChordSymbolTonal";

const chordTestOrig = `
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
[ch]A7+[/ch]        [ch]AMaj7[/ch]
[ch]G7b5[/ch]
[ch]Cm7addb9#9[/ch]
[ch]B[/ch]       [ch]F#[/ch]      [ch]B2/F[/ch]
[ch]Bm7b5[/ch]
[ch]Bm7#5[/ch]
[ch]A/B[/ch]       [ch]Gm/B[/ch]
[ch]Em7[/ch]
[ch]C7b9[/ch]      [ch]Eb7b5[/ch]
[ch]Em9#5[/ch]
[ch]E9b5#5[/ch]
`;

const chordTestResultTonal = `
[ch]A7+5[/ch]        [ch]Amaj7[/ch]
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

const cleanupUltimateGuitarChordSymbolsRaw = (
  content: string,
  getChord: (chord: string) => string
) => {
  const replacer = (substring: string, ...args: any[]): string => {
    const match = args[0];
    // console.log(`Found: ${match} within ${substring}`);
    return `[ch]${getChord(match)}[/ch]`;
  };

  const chordsRegExp = /\[ch\]([^[]+)\[\/ch\]/g;
  return content.replace(chordsRegExp, replacer);
};

test("getChordSymbol", () => {
  expect(
    cleanupUltimateGuitarChordSymbolsRaw(chordTestOrig, getChordSymbol)
  ).toBe(chordTestResult);
});

test("getChordSymbolTonal", () => {
  expect(
    cleanupUltimateGuitarChordSymbolsRaw(chordTestOrig, getChordSymbolTonal)
  ).toBe(chordTestResultTonal);
});
