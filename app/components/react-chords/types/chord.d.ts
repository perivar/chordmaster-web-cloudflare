declare module "ChordModule" {
  type ChordType = {
    frets: number[]; // which fret is which finger at: 1 - 4 or, 0 = open, -1 = non-used
    fingers?: number[]; // fingers: 1 - 4 or 0 = no finger
    baseFret: number; // which fret do we start with, normally 1
    barres?: number[]; // one or more fingers is pressed onto multiple strings, 1 - 4
    capo?: boolean; // whether the barres overlaps the whole fretboard
    midi: number[]; // midi notes
    notes?: string[]; // the notes as note names
  };

  type InstrumentType = {
    tunings: {
      standard: string[];
    };
    strings: number;
    fretsOnChord: number;
  };

  type ChordProps = {
    chord: ChordType;
    instrument: InstrumentType;
    lite?: boolean;
    dark?: boolean;
    handleKeyDown?: (midiNote: number) => void;
    selectedSamples?: number[];
  };
}
