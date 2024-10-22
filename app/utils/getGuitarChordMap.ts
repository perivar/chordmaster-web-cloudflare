import { Midi } from "tonal";

import { getChordSymbol } from "./getChordSymbol";

// guitar.json
export interface ChordPosition {
  frets: number[]; // which fret is which finger at: 1 - 4 or, 0 = open, -1 = non-used
  fingers?: number[]; // fingers: 1 - 4 or 0 = no finger
  baseFret: number; // which fret do we start with, normally 1
  barres?: number[]; // one or more fingers is pressed onto multiple strings, 1 - 4
  capo?: boolean; // whether the barres overlaps the whole fretboard
  midi: number[]; // midi notes
  notes?: string[]; // the midi notes as note names
}

export interface ChordElement {
  key: string;
  suffix: string;
  positions: ChordPosition[];
}

interface Chords {
  [key: string]: ChordElement[];
}

interface Tunings {
  standard: string[];
}

interface Main {
  strings: number;
  fretsOnChord: number;
  name: string;
  numberOfChords: number;
}

export interface GuitarChords {
  main: Main;
  tunings: Tunings;
  keys: string[];
  suffixes: string[];
  chords: Chords;
}

export const getGuitarChordMap = (jsonData: GuitarChords) => {
  // Initialize an empty Map
  const chordMap = new Map<string, ChordElement>();

  // Helper function to handle sharp/flat equivalences
  const addChordToMap = (chord: ChordElement, key: string, suffix: string) => {
    const combinedKey = `${key}${suffix}`;
    const combinedKeyNew = getChordSymbol(combinedKey);
    chordMap.set(combinedKeyNew, chord);
  };

  // Mapping of flats to sharps, and the other way around
  // https://github.com/tombatossals/chords-db/issues/24
  // The database has only registered the flat chords, as they are the same as the sharp of the anterior key:
  // A# = Bb, D# = Eb, G# = Ab
  const equivalentMap: Record<string, string> = {
    "C#": "Db",
    "F#": "Gb",
    Eb: "D#",
    Ab: "G#",
    Bb: "A#",
  };

  // Iterate over the keys (C, C#, etc.)
  for (const key in jsonData.chords) {
    // Iterate over each chord (which contains key and suffix)
    jsonData.chords[key].forEach(chord => {
      // Sort the chord positions by baseFret
      chord.positions.sort((a, b) => a.baseFret - b.baseFret);

      // Map midi to note names and add it as the `notes` property
      chord.positions = chord.positions.map(position => ({
        ...position,
        // Add note names as 'notes' property
        notes: position.midi.map(midiNote =>
          Midi.midiToNoteName(midiNote, { sharps: true })
        ),
      }));

      // Add the original chord
      addChordToMap(chord, chord.key, chord.suffix);

      // If the chord key is a flat (Bb, Eb, Ab), add the corresponding sharp equivalent
      if (equivalentMap[chord.key]) {
        const equivalent = equivalentMap[chord.key];
        addChordToMap(chord, equivalent, chord.suffix);
      }
    });
  }

  return chordMap;
};
