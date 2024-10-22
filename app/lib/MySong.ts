import { chordSymbolUltimateGuitarRenderer } from "~/utils/getChordInformation";
import {
  Chord,
  ChordParseFailure,
  chordParserFactory,
  chordRendererFactory,
  MaybeChord,
} from "chord-symbol";

export type MyItem = MyChordLyricsPair | MyComment | MyTag | MyLiteral;

export class MyChordLyricsPair {
  chords: string | null;
  lyrics: string | null;

  constructor(chords: string | null, lyrics: string | null) {
    this.chords = chords;
    this.lyrics = lyrics;
  }
}

export class MyComment {
  content: string;

  constructor(content: string) {
    this.content = content;
  }
}

export class MyTag {
  name: string;
  value: string;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}

export class MyLiteral {
  string: string;

  constructor(string: string) {
    this.string = string;
  }
}

export class MyLine {
  items: MyItem[];

  constructor(items: MyItem[]) {
    this.items = items;
  }
}

export class MySong {
  lines: MyLine[];

  constructor(lines: MyLine[]) {
    this.lines = lines;
  }

  /**
   * Transposes the song by the specified delta.
   * @param {number} delta The number of semitones (positive or negative) to transpose with
   * @returns {MySong} The transposed song
   */
  transpose(delta: number): MySong {
    return transposeMySong(this, delta);
  }

  getChords(): string[] {
    return getChords(this);
  }
}

const processMyChord = (
  item: MyItem,
  chordProcessor: (chord: string) => string
) => {
  if (item instanceof MyChordLyricsPair) {
    if (item.chords) {
      const parsedChord = item.chords;
      const processedChord = chordProcessor(parsedChord);

      // return a MyChordLyricsPair where the chords have been processed
      const processedChordLyricsPair = new MyChordLyricsPair(
        processedChord,
        item.lyrics
      );
      return processedChordLyricsPair;
    }
  }

  return item;
};

const parseChord = chordParserFactory({
  altIntervals: ["b5", "#5", "b9", "#9", "#11", "b13"],
  notationSystems: ["english", "german"],
});

const renderChordWithTranspose = (transposeValue: number) => {
  const renderChordFactory = chordRendererFactory({
    customFilters: [chordSymbolUltimateGuitarRenderer],
    useShortNamings: true,
    accidental: "original",
    transposeValue,
  });
  return renderChordFactory;
};

const transformMySong = (
  song: MySong,
  chordProcessor: (chord: string) => string
) => {
  song.lines = song.lines.map(line => {
    const items = line.items.map(item => processMyChord(item, chordProcessor));
    line.items = items;
    return line;
  });
  return song;
};

const transposeMySong = (song: MySong, transposeDelta: number) => {
  // method to transpose the chord
  const chordTransposer = (c: string): string => {
    let chordName = "";

    try {
      const maybeChord: MaybeChord = parseChord(c);
      if ((maybeChord as Chord).normalized) {
        const chord = maybeChord as Chord;
        const renderChord = renderChordWithTranspose(transposeDelta);
        chordName = renderChord(chord);
      } else if ((maybeChord as ChordParseFailure).error) {
        const chordError = maybeChord as ChordParseFailure;
        throw chordError.error;
      }
    } catch (e) {
      console.error(e);
    }

    return chordName;
  };

  return transformMySong(song, chordTransposer);
};

const getChords = (song: MySong): string[] => {
  const allChords: string[] = [];

  song.lines.forEach(line => {
    line.items.forEach(item => {
      if (item instanceof MyChordLyricsPair) {
        if (item.chords) {
          const parsedChord = item.chords;

          // only add chord if not already exists
          if (!allChords.some(c => c === parsedChord)) {
            allChords.push(parsedChord);
          }
        }
      }
    });
  });

  return allChords;
};
