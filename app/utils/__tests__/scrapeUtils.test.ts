import {
  cleanupChords,
  cleanupDoubleChordLines,
  cleanupHeaders,
  cleanupUltimateGuitarChordsRaw,
  removeTabs,
} from "../scrapeUtils";

describe("cleanupChords", () => {
  it("should replace M with maj", () => {
    expect(cleanupChords("CM7")).toBe("Cmaj7");
    expect(cleanupChords("DM9")).toBe("Dmaj9");
  });

  it("should replace 7/9 with only 9", () => {
    expect(cleanupChords("C7/9")).toBe("C9");
    expect(cleanupChords("G13/9")).toBe("G9");
  });

  it("should remove parentheses from chords", () => {
    expect(cleanupChords("C7(b9)")).toBe("C7b9");
    expect(cleanupChords("Eb7(b5)")).toBe("Eb7b5");
  });

  it('should replace "-" with "b" for flat notes', () => {
    expect(cleanupChords("F#m7-5")).toBe("F#m7b5");
  });

  it('should replace "+" with "#" for sharp notes', () => {
    expect(cleanupChords("F#m7+5")).toBe("F#m7#5");
  });

  it("should handle chords like E7+5-9", () => {
    expect(cleanupChords("E7+5-9")).toBe("E7#5b9");
  });

  it("should handle chords like E7-5+9", () => {
    expect(cleanupChords("E7-5+9")).toBe("E7b5#9");
  });

  it("should work with mixed chords", () => {
    expect(cleanupChords("Cmaj7")).toBe("Cmaj7");
    expect(cleanupChords("Bb7/9")).toBe("Bb9");
    expect(cleanupChords("Am7-5")).toBe("Am7b5");
    expect(cleanupChords("G+7")).toBe("G#7");
    expect(cleanupChords("Fdim7+5")).toBe("Fdim7#5");
  });

  it("should not modify chords without patterns", () => {
    expect(cleanupChords("C")).toBe("C");
    expect(cleanupChords("G#m")).toBe("G#m");
  });
});

describe("cleanupUltimateGuitarChordsRaw", () => {
  it("should replace [ch]H[/ch] with [ch]B[/ch]", () => {
    const input = "[ch]H[/ch] [ch]Hm[/ch]";
    const expected = "[ch]B[/ch] [ch]Bm[/ch]";
    expect(cleanupUltimateGuitarChordsRaw(input)).toBe(expected);
  });

  it("should replace chords with /H to /B", () => {
    const input = "[ch]A/H[/ch] [ch]G#/H[/ch]";
    const expected = "[ch]A/B[/ch] [ch]G#/B[/ch]";
    expect(cleanupUltimateGuitarChordsRaw(input)).toBe(expected);
  });

  it("should replace M with maj", () => {
    const input = "[ch]CM7[/ch] [ch]F#M9[/ch]";
    const expected = "[ch]Cmaj7[/ch] [ch]F#maj9[/ch]";
    expect(cleanupUltimateGuitarChordsRaw(input)).toBe(expected);
  });

  it("should remove parentheses from chords like C7(b9)", () => {
    const input = "[ch]C7(b9)[/ch] [ch]Eb7(b5)[/ch]";
    const expected = "[ch]C7b9[/ch] [ch]Eb7b5[/ch]";
    expect(cleanupUltimateGuitarChordsRaw(input)).toBe(expected);
  });

  it("should handle E7+5-9 case", () => {
    const input = "[ch]E7+5-9[/ch]";
    const expected = "[ch]E7#5b9[/ch]";
    expect(cleanupUltimateGuitarChordsRaw(input)).toBe(expected);
  });

  it("should handle E7-5+9 case", () => {
    const input = "[ch]E7-5+9[/ch]";
    const expected = "[ch]E7b5#9[/ch]";
    expect(cleanupUltimateGuitarChordsRaw(input)).toBe(expected);
  });

  it("should replace - with b in chords like F#m7-5", () => {
    const input = "[ch]F#m7-5[/ch]";
    const expected = "[ch]F#m7b5[/ch]";
    expect(cleanupUltimateGuitarChordsRaw(input)).toBe(expected);
  });

  it("should replace + with # in chords like F#m7+5", () => {
    const input = "[ch]F#m7+5[/ch]";
    const expected = "[ch]F#m7#5[/ch]";
    expect(cleanupUltimateGuitarChordsRaw(input)).toBe(expected);
  });

  it("should handle combined + and - with slashes", () => {
    const input = "[ch]A7+5-9/G[/ch]";
    const expected = "[ch]A7#5b9/G[/ch]";
    expect(cleanupUltimateGuitarChordsRaw(input)).toBe(expected);
  });
});

describe("removeTabs", () => {
  const tabtsContent = `
I'll take you just the way you are
[Intro]

e|--------2---3------------|----2---7----5-----------|
B|------3-----3------------|---3----8----7-----------|
G|----2-------3------------|--2-----7----7-----------|
D|--0----------------------|-0-----------------------| x2. Let the D string sound
A|-------------------------|-------------------------|
E|-------------------------|-------------------------|

[Verse 3]

Riff 4:
(Dm        E)
e|-------1--------0--|
B|-----3--------0----|
G|---2--------1------|
D|-0--------2--------|
A|-------------------|
E|-------------------|

[Verse 2]

Chords:
    F     F6    Fmaj7   C9     Bb6   Bbmaj7 C7/F
e --1--  --1--  --0--  --3--  --3--  --1--  --x--
B --1--  --3--  --1--  --3--  --3--  --3--  --1--
G --2--  --2--  --2--  --3--  --0--  --2--  --3--
D --3--  --3--  --3--  --2--  --3--  --3--  --2--
A --x--  --x--  --x--  --3--  --1--  --1--  --3--
E --x--  --x--  --x--  --x--  --x--  --x--  --1--

|E|-x---x---x---x---5---3---x---x---x---12---10---7---8---6---x--|
|B|-6---6---5---5---5---3---1---x---3---10---9----8---6---5---4--|
|G|-5---7---5---5---3---3---2---5---3---10---9----9---7---6---4--|
|D|-7---6---5---4---3---2---2---6---3--(10)-(9)---x--(5)--x---4--|
|A|-5---7---x---x---x--(3)--x---7---x--(12)-(7)--(0)--x---x---x--|
|E|-x---x---5---5---x---x---1---0---3--(10)-(0)---x---x---x---4--|
`;

  it("should remove standard guitar tab lines", () => {
    const input = tabtsContent;
    const expected = `
I'll take you just the way you are
[Intro]


[Verse 3]

Riff 4:
(Dm        E)

[Verse 2]

Chords:
    F     F6    Fmaj7   C9     Bb6   Bbmaj7 C7/F
e --1--  --1--  --0--  --3--  --3--  --1--  --x--
B --1--  --3--  --1--  --3--  --3--  --3--  --1--
G --2--  --2--  --2--  --3--  --0--  --2--  --3--
D --3--  --3--  --3--  --2--  --3--  --3--  --2--
A --x--  --x--  --x--  --3--  --1--  --1--  --3--
E --x--  --x--  --x--  --x--  --x--  --x--  --1--

`;
    expect(removeTabs(input)).toBe(expected);
  });
});

describe("cleanupHeaders", () => {
  it("should remove multiple newlines before a chord line with complex chords", () => {
    const input = `[Header]\n\n\nCmaj7 G7b9 Am6 F#7b5\nD7 A9 E7sus4\n`;
    const expected = `[Header]\nCmaj7 G7b9 Am6 F#7b5\nD7 A9 E7sus4\n`;
    expect(cleanupHeaders(input)).toBe(expected);
  });

  it("should handle multiple headers with newlines before complex chord lines", () => {
    const input = `[Intro]\n\nCmaj7 G7b9 Am6\n\n[Chorus]\n\nD7 A9 E7sus4\n`;
    const expected = `[Intro]\nCmaj7 G7b9 Am6\n\n[Chorus]\nD7 A9 E7sus4\n`;
    expect(cleanupHeaders(input)).toBe(expected);
  });

  it("should keep one newline after a header and before a chord line with complex chords", () => {
    const input = `[Bridge]\n\nCmaj7 G#7b13\nA9 Dm7\n`;
    const expected = `[Bridge]\nCmaj7 G#7b13\nA9 Dm7\n`;
    expect(cleanupHeaders(input)).toBe(expected);
  });

  it("should not modify content without newlines before chords", () => {
    const input = `[Verse]\nCmaj7 G7 Am9\nBdim7 F#m7\n`;
    const expected = `[Verse]\nCmaj7 G7 Am9\nBdim7 F#m7\n`;
    expect(cleanupHeaders(input)).toBe(expected);
  });

  it("should remove excessive newlines even with complex chord patterns", () => {
    const input = `[Chorus]\n\nCmaj7 F#7b9\nAm6 Gm7b5/D\n\n[Bridge]\n\nAmaj7 Dm9\n`;
    const expected = `[Chorus]\nCmaj7 F#7b9\nAm6 Gm7b5/D\n\n[Bridge]\nAmaj7 Dm9\n`;
    expect(cleanupHeaders(input)).toBe(expected);
  });

  it("should handle complex chords with slash notation", () => {
    const input = `[Verse]\n\nFmaj7/A C#7b5/F\nGm9/Bb Dm7/C\n`;
    const expected = `[Verse]\nFmaj7/A C#7b5/F\nGm9/Bb Dm7/C\n`;
    expect(cleanupHeaders(input)).toBe(expected);
  });

  it("should handle content with multiple header sections and complex chords", () => {
    const input = `[Verse]\n\nCmaj7 G7b9\nAm6 Dm9\n[Chorus]\n\nF#7b5 Bm7b5\nCmaj7/G Gm7\n`;
    const expected = `[Verse]\nCmaj7 G7b9\nAm6 Dm9\n[Chorus]\nF#7b5 Bm7b5\nCmaj7/G Gm7\n`;
    expect(cleanupHeaders(input)).toBe(expected);
  });
});

describe("cleanupDoubleChordLines", () => {
  it("should add an additional newline between two chord lines", () => {
    const input = `Cmaj7 G7b9\nAm6 F#7b5\n`;
    const expected = `Cmaj7 G7b9\n\nAm6 F#7b5\n`;
    expect(cleanupDoubleChordLines(input)).toBe(expected);
  });

  it("should not change the content if there are already two newlines between the chord lines", () => {
    const input = `Cmaj7 G7b9\n\nAm6 F#7b5\n`;
    const expected = `Cmaj7 G7b9\n\nAm6 F#7b5\n`;
    expect(cleanupDoubleChordLines(input)).toBe(expected);
  });

  it("should handle multiple chord lines with complex chords", () => {
    const input = `Cmaj7 G7b9\nAm6 F#7b5\nBm7b5 E7sus4\n`;
    const expected = `Cmaj7 G7b9\n\nAm6 F#7b5\n\nBm7b5 E7sus4\n`;
    expect(cleanupDoubleChordLines(input)).toBe(expected);
  });

  it("should not modify the content if the lines do not have a single newline between them", () => {
    const input = `Cmaj7 G7b9\nAm6 F#7b5\n\nBm7b5 E7sus4\n`;
    const expected = `Cmaj7 G7b9\n\nAm6 F#7b5\n\nBm7b5 E7sus4\n`;
    expect(cleanupDoubleChordLines(input)).toBe(expected);
  });

  it("should handle complex chords with extensions and slash chords", () => {
    const input = `Cmaj7 G7b9\nAm6 F#7b5\nFmaj7/A C#7b5/F\n`;
    const expected = `Cmaj7 G7b9\n\nAm6 F#7b5\n\nFmaj7/A C#7b5/F\n`;
    expect(cleanupDoubleChordLines(input)).toBe(expected);
  });

  it("should not modify a single chord line", () => {
    const input = `Cmaj7 G7b9\n`;
    const expected = `Cmaj7 G7b9\n`;
    expect(cleanupDoubleChordLines(input)).toBe(expected);
  });

  it("should handle chords with various symbols like #, b, +, sus, etc.", () => {
    const input = `C#7b9 Gm7sus4\nBm7b5 F#maj7\n`;
    const expected = `C#7b9 Gm7sus4\n\nBm7b5 F#maj7\n`;
    expect(cleanupDoubleChordLines(input)).toBe(expected);
  });
});
