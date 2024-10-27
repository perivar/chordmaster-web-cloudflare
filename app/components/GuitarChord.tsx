import { FunctionComponent, useState } from "react";
import { ChordElement, ChordPosition } from "~/utils/getGuitarChordMap";
import { useTheme } from "remix-themes";

import { SampleStart } from "~/hooks/usePlaySound";

import Chord from "./react-chords";

interface GuitarChordProps {
  name: string;
  chord?: ChordElement;
  tuning?: string[];
  lite?: boolean;
  playChord: (
    midiNotes: number[],
    onStart?: (sample: SampleStart) => void,
    onEnded?: (sample: SampleStart) => void
  ) => void;
  playMidiNote: (
    midiNote: number,
    onStart?: (sample: SampleStart) => void,
    onEnded?: (sample: SampleStart) => void
  ) => void;
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
  playMidiNote={(midiNote: number) => console.log(midiNote)}
/>; */
}
const GuitarChord: FunctionComponent<GuitarChordProps> = ({
  name,
  chord,
  tuning = ["E", "A", "D", "G", "B", "E"],
  lite = false, // defaults to false if omitted
  playChord,
  playMidiNote,
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

  // support selecting several samples at once
  const [selectedSamples, setSelectedSamples] = useState<number[]>([]);

  return (
    <div className="min-w-52">
      <div className="max-h-52 overflow-y-auto">
        {/* Scrollable container */}
        {chord?.positions && chord?.positions.length > 0 ? (
          chord.positions.map((position, index) => (
            <>
              <Chord
                key={index}
                chord={position}
                instrument={instrument}
                lite={lite}
                dark={theme === "dark"}
                handleKeyDown={(midiNote: number) => {
                  playMidiNote(
                    midiNote,
                    (sample: SampleStart) => {
                      setSelectedSamples(prevSamples =>
                        prevSamples.includes(sample.note as number)
                          ? prevSamples
                          : [...prevSamples, sample.note as number]
                      );
                    },
                    (sample: SampleStart) => {
                      setSelectedSamples(prevSamples =>
                        prevSamples.filter(n => n !== sample.note)
                      );
                    }
                  );
                }}
                selectedSamples={selectedSamples}
              />
              <div
                role="button"
                tabIndex={0}
                onPointerDown={() => {
                  playChord(
                    position.midi,
                    (sample: SampleStart) => {
                      setSelectedSamples(prevSamples =>
                        prevSamples.includes(sample.note as number)
                          ? prevSamples
                          : [...prevSamples, sample.note as number]
                      );
                    },
                    (sample: SampleStart) => {
                      setSelectedSamples(prevSamples =>
                        prevSamples.filter(n => n !== sample.note)
                      );
                    }
                  );
                }}>
                <div className="text-center text-sm">{name}</div>
              </div>
            </>
          ))
        ) : (
          <Chord
            chord={chordElement}
            instrument={instrument}
            lite={lite}
            dark={theme === "dark"}
          />
        )}
      </div>
    </div>
  );
};

export default GuitarChord;
