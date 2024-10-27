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

const getNeckFretsPath = (strings: number, fretsOnChord: number) =>
  Array.from({ length: fretsOnChord + 1 })
    .map((_, pos) => getNeckHorizonalLine(pos, strings))
    .join(" ");

const getNeckStringsPath = (strings: number) =>
  Array.from({ length: strings }).map((_, pos) =>
    getNeckVerticalLine(pos, strings)
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
  midi,
  lite = false,
  dark = false,
  handleKeyDown,
  selectedSamples,
}) => {
  // note that to make the generic work in tsx files, add a extra comma
  const getCurrentValue = <T,>(index: number, dataArray: T[]): T | null => {
    if (!dataArray || frets[index] === -1) {
      return null;
    }

    let validFretCount = 0;

    // Count valid frets up to the current index
    for (let i = 0; i <= index; i++) {
      if (frets[i] !== -1) {
        validFretCount++;
      }
    }

    // Use validFretCount - 1 because we want zero-based indexing
    return dataArray[validFretCount - 1];
  };

  // Get current note based on the fret index (zero-based)
  const getCurrentNote = (index: number): string | null => {
    return getCurrentValue<string>(index, notes!);
  };

  // Get current MIDI note based on the fret index (zero-based)
  const getCurrentNoteMidi = (index: number): number | null => {
    return getCurrentValue<number>(index, midi);
  };

  const handleStringClick = (index: number) => {
    if (!handleKeyDown) return;

    const currentNoteMidi = getCurrentNoteMidi(index);
    if (currentNoteMidi) {
      handleKeyDown(currentNoteMidi);
    }
  };

  const isSelectedString = (index: number) => {
    if (!selectedSamples) return false;

    const currentNoteMidi = getCurrentNoteMidi(index);
    if (currentNoteMidi) {
      if (selectedSamples.includes(currentNoteMidi)) return true;
    }

    return false;
  };

  return (
    <g>
      {/* Render the horizontal frets */}
      <path
        stroke={dark ? "#ccc" : "#444"}
        strokeWidth="0.25"
        strokeLinecap="square"
        strokeLinejoin="round"
        d={getNeckFretsPath(strings, fretsOnChord)}
      />

      {/* Render the vertical guitar strings with support for vibrating the strings on click using css */}
      {getNeckStringsPath(strings).map((stringPath, index) => (
        <g key={index}>
          {/* Invisible hitbox with larger strokeWidth */}
          <path
            className="cursor-pointer"
            d={stringPath}
            stroke="transparent"
            strokeWidth="8"
            onPointerDown={() => handleStringClick(index)}
          />
          {/* Visible string path */}
          <path
            d={stringPath}
            className={`string ${isSelectedString(index) ? "vibrating" : ""}`}
            stroke={dark ? "#ccc" : "#444"}
            strokeWidth="0.25"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </g>
      ))}

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
          {/* If notes are provided use the current note name */}
          {notes &&
            frets.map((note, index) => {
              const currentNote = getCurrentNote(index);
              if (currentNote) {
                return (
                  <text
                    key={index}
                    fontSize="0.25rem"
                    fill={dark ? "#ccc" : "#444"}
                    fontFamily="Verdana"
                    textAnchor="middle"
                    x={offsets[strings].x + index * 10}
                    y="53"
                    onPointerDown={() => handleStringClick(index)}>
                    {currentNote}
                  </text>
                );
              }
            })}
          {/* If notes are not provided use tuning notes */}
          {!notes &&
            tuning.slice().map((note, index) => {
              return (
                <text
                  key={index}
                  fontSize="0.25rem"
                  fill={dark ? "#ccc" : "#444"}
                  fontFamily="Verdana"
                  textAnchor="middle"
                  x={offsets[strings].x + index * 10}
                  y="53">
                  {note}
                </text>
              );
            })}
        </g>
      )}
    </g>
  );
};

export default Neck;
