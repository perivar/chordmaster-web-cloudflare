import { FunctionComponent } from "react";
import { ChordElement, ChordPosition } from "~/utils/getGuitarChordMap";
import { useTheme } from "remix-themes";
import { Midi } from "tonal";

import usePlaySound from "~/hooks/usePlaySound";

import Chord from "./react-chords";

interface GuitarChordProps {
  name: string;
  chord?: ChordElement;
  tuning?: string[];
  lite?: boolean;
}

const getChordFreqs = (chord: ChordPosition): number[] | undefined => {
  if (chord && chord.midi) {
    // get the midi notes
    const midiNotes = chord.midi;

    const chordFreqs = midiNotes.map(midiNote => Midi.midiToFreq(midiNote));
    return chordFreqs;
  }
};

const GuitarChord: FunctionComponent<GuitarChordProps> = ({
  name,
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

  const chordFreqs = getChordFreqs(chordElement);
  const { playChordAndArpFast, playNote } = usePlaySound(
    "guitar",
    chordFreqs || []
  );

  return (
    <div className="min-w-52">
      <Chord
        chord={chordElement}
        instrument={instrument}
        lite={lite}
        dark={theme === "dark"}
        playNote={playNote}
      />
      <div role="button" tabIndex={0} onMouseDown={() => playChordAndArpFast()}>
        <div className="text-center text-sm">{name}</div>
      </div>
    </div>
  );
};

export default GuitarChord;
