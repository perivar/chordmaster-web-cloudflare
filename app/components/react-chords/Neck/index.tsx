// src/components/Neck.tsx
import React from "react";
import { NeckProps, Offsets } from "NeckModules";

const offsets: Offsets = {
  4: {
    x: 10,
    y: 10,
    length: 40,
  },
  6: {
    x: 0,
    y: 0,
    length: 50,
  },
};

const getNeckHorizonalLine = (pos: number, strings: number): string =>
  `M ${offsets[strings].x} ${12 * pos} H ${offsets[strings].length}`;

const getNeckVerticalLine = (pos: number, strings: number) =>
  `M ${offsets[strings].y + pos * 10} 0 V 48`;

const getNeckPath = (strings: number, fretsOnChord: number) =>
  Array.from({ length: fretsOnChord + 1 })
    .map((_, pos) => getNeckHorizonalLine(pos, strings))
    .join(" ")
    .concat(
      Array.from({ length: strings })
        .map((_, pos) => getNeckVerticalLine(pos, strings))
        .join(" ")
    );

const getBarreOffset = (
  strings: number,
  frets: number[],
  baseFret: number,
  capo: boolean | undefined
) =>
  strings === 6
    ? frets[0] === 1 || capo
      ? baseFret > 9
        ? -12
        : -11
      : baseFret > 9
        ? -10
        : -7
    : frets[0] === 1 || capo
      ? baseFret > 9
        ? -1
        : 0
      : baseFret > 9
        ? 3
        : 4;

const Neck: React.FC<NeckProps> = ({
  tuning,
  frets,
  strings,
  fretsOnChord,
  baseFret = 1,
  capo,
  notes,
  lite = false,
  dark = false,
}) => {
  let noteIndex = 0; // Initialize noteIndex outside the map function

  return (
    <g>
      <path
        stroke={dark ? "#ccc" : "#444"}
        strokeWidth="0.25"
        strokeLinecap="square"
        strokeLinejoin="round"
        d={getNeckPath(strings, fretsOnChord)}
      />
      {baseFret === 1 ? (
        <path
          stroke={dark ? "#ccc" : "#444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d={`M ${offsets[strings].x} 0 H ${offsets[strings].length}`}
        />
      ) : (
        <text
          fontSize="0.25rem"
          fill={dark ? "#ccc" : "#444"}
          fontFamily="Verdana"
          x={getBarreOffset(strings, frets, baseFret, capo)}
          y="8">
          {baseFret}fr
        </text>
      )}
      {!lite && (
        <g>
          {tuning.slice().map((note, index) => {
            // if we have notes, use this instead of the tuning
            if (notes) {
              // Check if the frets array at this index is not -1, then print the corresponding note from the notes array
              return frets[index] !== -1 ? (
                <text
                  key={index}
                  fontSize="0.3rem"
                  fill={dark ? "#ccc" : "#444"}
                  fontFamily="Verdana"
                  textAnchor="middle"
                  x={offsets[strings].x + index * 10}
                  y="53">
                  {notes[noteIndex++]}
                </text>
              ) : null;
            } else {
              // use tuning
              return (
                <text
                  key={index}
                  fontSize="0.3rem"
                  fill={dark ? "#ccc" : "#444"}
                  fontFamily="Verdana"
                  textAnchor="middle"
                  x={offsets[strings].x + index * 10}
                  y="53">
                  {note}
                </text>
              );
            }
          })}
        </g>
      )}
    </g>
  );
};

export default Neck;
