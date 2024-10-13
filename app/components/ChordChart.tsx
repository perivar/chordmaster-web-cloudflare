import { FunctionComponent } from "react";
import { useTheme } from "remix-themes";

import { ChordElement, ChordPosition } from "./ChordTab";
import Chord from "./react-chords";

interface Props {
  chord?: ChordElement;
  tuning?: string[];
  lite?: boolean;
}

const ChordChart: FunctionComponent<Props> = ({
  chord,
  tuning = ["E", "A", "D", "G", "B", "E"],
  lite = false, // defaults to false if omitted
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
      />
    </div>
  );
};

export default ChordChart;
