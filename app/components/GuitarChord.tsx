import { FunctionComponent } from "react";
import { ChordElement, ChordPosition } from "~/utils/getGuitarChordMap";
import { useTheme } from "remix-themes";

import Chord from "./react-chords";

interface GuitarChordProps {
  name: string;
  chord?: ChordElement;
  tuning?: string[];
  lite?: boolean;
  playChord: (midiNotes: number[]) => void;
  playNote: (note: string) => void;
}

{
  /* The component can be dummy tested like this
  <GuitarChord
  name="G7"
  chord={{
    key: "G",
    suffix: "dim7",
    positions: [
      {
        frets: [3, 1, -1, 3, 2, 0],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 1,
        barres: [],
        midi: [43, 46, 58, 61, 64],
        notes: ["C1", "D2", "E3", "F4", "G5"],
      },
    ],
  }}
  playChord={(midiNotes: number[]) => console.log(midiNotes)}
  playNote={(note: string) => console.log(note)}
/>; */
}
const GuitarChord: FunctionComponent<GuitarChordProps> = ({
  name,
  chord,
  tuning = ["E", "A", "D", "G", "B", "E"],
  lite = false, // defaults to false if omitted
  playChord,
  playNote,
}) => {
  const [theme, _] = useTheme();

  const instrument = {
    strings: 6,
    fretsOnChord: 4,
    name: "Guitar",
    keys: [],
    tunings: {
      standard: tuning,
    },
  };

  const defaultChordPosition: ChordPosition = {
    frets: [],
    fingers: [],
    baseFret: 1,
    barres: [],
    capo: false,
    midi: [],
    notes: [],
  };

  // Find the position with the lowest baseFret or return a default chord if not found
  const chordElement = chord?.positions[0] ?? defaultChordPosition;

  return (
    <div className="min-w-52">
      <Chord
        chord={chordElement}
        instrument={instrument}
        lite={lite}
        dark={theme === "dark"}
        playNote={playNote}
      />
      <div
        role="button"
        tabIndex={0}
        onMouseDown={() => playChord(chordElement.midi)}>
        <div className="text-center text-sm">{name}</div>
      </div>
    </div>
  );
};

export default GuitarChord;
