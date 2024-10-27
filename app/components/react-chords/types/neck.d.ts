declare module "NeckModules" {
  type Offsets = {
    [key: number]: {
      x: number;
      y: number;
      length: number;
    };
  };

  // Define props for the Neck component
  interface NeckProps {
    tuning: string[];
    frets: number[];
    capo?: boolean;
    strings: number;
    baseFret: number; //0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
    fretsOnChord: number;
    midi: number[]; // midi notes
    notes?: string[]; // the notes as note names
    lite?: boolean;
    dark?: boolean;
    handleKeyDown?: (midiNote: number) => void;
    selectedSamples?: number[];
  }
}
