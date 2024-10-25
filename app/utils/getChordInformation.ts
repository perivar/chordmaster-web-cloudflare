import {
  Chord,
  ChordParseFailure,
  chordParserFactory,
  chordRendererFactory,
  MaybeChord,
} from "chord-symbol";

export interface ChordInformation {
  /**
   * - whether the input text could be parsed as a chord
   */
  isChord: boolean;
  /**
   * - the full chord name Ex: `Cm7b5/Gb`
   */
  chordName: string;
  /**
   * - the normalized root note in english notation. Ex: `C`
   */
  rootNote?: string;
  /**
   * - the normalized bass note in english notation. Ex: `Gb`
   */
  bassNote?: string;
  /**
   * - list of intervals composing the chord. Ex: `['1', 'b3', 'b5', 'b7']` for `Cm7b5/Gb`
   */
  intervals: string[];
  /**
   * - list of notes composing the chord. Ex: `['C', 'Eb', 'Gb', 'Bb']` for `Cm7b5/Gb`
   */
  notes: string[];
  /**
   * - list of semitones composing the chord. Ex: `[0, 4, 7, 11]` for `CMaj7`
   */
  semitones: number[];
  /**
   * - error object
   */
  error: unknown;
}

export const getChordInformation = (
  value: string,
  simplify?: boolean
): ChordInformation => {
  let isChord: boolean = false;
  let chordName: string = value;

  let notes: string[] = [];
  let intervals: string[] = [];
  let semitones: number[] = [];

  let rootNote: string | undefined;
  let bassNote: string | undefined;

  let error: unknown;

  try {
    const maybeChord: MaybeChord = parseChord(chordName);

    if ((maybeChord as Chord).normalized) {
      isChord = true;
      const chord = maybeChord as Chord;
      rootNote = chord.normalized?.rootNote;
      bassNote = chord.normalized?.bassNote;
      notes = chord.normalized?.notes ?? [];
      intervals = chord.normalized?.intervals ?? [];
      semitones = chord.normalized?.semitones ?? [];

      // render chord name using chord-symbol
      if (simplify) {
        chordName = renderChordSimple(chord);
      } else {
        chordName = renderChord(chord);
      }
    } else if ((maybeChord as ChordParseFailure).error) {
      const chordError = maybeChord as ChordParseFailure;
      error = chordError.error;
    }
  } catch (e) {
    error = e;
  }

  return {
    isChord,
    chordName,
    rootNote,
    bassNote,
    intervals,
    semitones,
    notes,
    error,
  };
};

export const chordSymbolUltimateGuitarRenderer = (chord: Chord) => {
  chord.formatted.symbol = chord.formatted.symbol
    .replace(/[(), ]/g, "") // Remove unwanted characters like parentheses, commas, and spaces
    .replace(/mM(?!aj)/g, "mMaj") // Ensure "mM" gets replaced with "mMaj" only when it's not already "mMaj"
    .replace(/M(?!aj)/g, "Maj") // Replace isolated "M" with "Maj" (unless it's already "Maj")
    .replace("°", "dim"); // Replace the degree symbol with "dim"

  return chord;
};

const parseChord = chordParserFactory({
  altIntervals: ["b5", "#5", "b9", "#9", "#11", "b13"],
  notationSystems: ["english", "german"],
});

const renderChord = chordRendererFactory({
  customFilters: [chordSymbolUltimateGuitarRenderer],
  useShortNamings: true,
});

const renderChordSimple = chordRendererFactory({
  customFilters: [chordSymbolUltimateGuitarRenderer],
  useShortNamings: true,
  simplify: "core",
});
