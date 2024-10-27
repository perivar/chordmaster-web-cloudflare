import React from "react";
import { ChordProps, ChordType } from "ChordModule";

import Barre from "./Barre";
import Dot from "./Dot";
import Neck from "./Neck";

const onlyDots = (chord: ChordType) =>
  chord.frets
    .map((f, index) => ({ position: index, value: f }))
    .filter(f => !chord.barres || chord.barres.indexOf(f.value) === -1);

const Chord: React.FC<ChordProps> = ({
  chord,
  instrument,
  lite = false,
  dark = false,
  handleKeyDown,
  selectedSamples,
}) => {
  return chord ? (
    <svg
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMin meet"
      viewBox="0 0 80 70">
      <g transform="translate(13, 13)">
        <Neck
          tuning={instrument.tunings.standard}
          strings={instrument.strings}
          frets={chord.frets}
          capo={chord.capo}
          fretsOnChord={instrument.fretsOnChord}
          baseFret={chord.baseFret}
          midi={chord.midi}
          notes={chord.notes}
          lite={lite}
          dark={dark}
          handleKeyDown={handleKeyDown}
          selectedSamples={selectedSamples}
        />

        {chord.barres &&
          chord.barres.map((barre: number, index: number) => (
            <Barre
              key={index}
              capo={index === 0 && chord.capo}
              barre={barre}
              finger={chord.fingers?.[chord.frets.indexOf(barre)] ?? 0}
              frets={chord.frets}
              lite={lite}
              dark={dark}
            />
          ))}

        {onlyDots(chord).map(fret => (
          <Dot
            key={fret.position}
            string={instrument.strings - fret.position}
            fret={fret.value}
            strings={instrument.strings}
            finger={chord.fingers?.[fret.position] ?? 0}
            lite={lite}
            dark={dark}
          />
        ))}
      </g>
    </svg>
  ) : null;
};

export default Chord;
