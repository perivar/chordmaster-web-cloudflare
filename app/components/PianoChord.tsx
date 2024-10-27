import { FunctionComponent, useState } from "react";
import { NotesChordAlternatives } from "~/utils/getNotesChordAlternatives";

import { SampleStart } from "~/hooks/usePlaySound";

interface PianoChordProps {
  notesChordAlternatives: NotesChordAlternatives | undefined;
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

interface KeyboardChordProps {
  notesChordAlternatives: NotesChordAlternatives | undefined;
  handleKeyDown: (midiNote: number) => void;
  selectedSamples: number[];
}

const KeyboardChord: React.FC<KeyboardChordProps> = ({
  notesChordAlternatives,
  handleKeyDown,
  selectedSamples,
}) => {
  if (!notesChordAlternatives) return null;

  const isSimilarKey = (
    keyMidi1: number,
    keyMidi2?: number | number[],
    doExactCheck: boolean = false
  ): boolean => {
    // Return false if keyMidi2 is undefined or empty
    if (keyMidi2 === undefined) {
      return false;
    }

    // Convert keyMidi2 to an array for uniform handling
    const keyMidi2Arr = Array.isArray(keyMidi2) ? keyMidi2 : [keyMidi2];

    if (doExactCheck) {
      // If exact equality check is required, return true if any key in keyMidi2Arr matches keyMidi1
      return keyMidi2Arr.includes(keyMidi1);
    } else {
      // Function to calculate the note key by getting the remainder of division by 12
      const getNoteKey = (key: number) => key % 12;

      // Calculate the note key for keyMidi1
      const noteKey1 = getNoteKey(keyMidi1);

      // Calculate note keys for keyMidi2 and check for matches by note key
      return keyMidi2Arr.some(key => getNoteKey(key) === noteKey1);
    }
  };

  interface PianoKey {
    name: string;
    key: string;
    color: string;
    midi: number;
    note: string;
  }

  const pianoKeys: PianoKey[] = [
    { name: "C", key: "A", color: "white", midi: 48, note: "C4" },
    { name: "C#", key: "W", color: "black", midi: 49, note: "C#4" },
    { name: "D", key: "S", color: "white", midi: 50, note: "D4" },
    { name: "D#", key: "E", color: "black", midi: 51, note: "D#4" },
    { name: "E", key: "D", color: "white", midi: 52, note: "E4" },
    { name: "F", key: "F", color: "white", midi: 53, note: "F4" },
    { name: "F#", key: "T", color: "black", midi: 54, note: "F#4" },
    { name: "G", key: "G", color: "white", midi: 55, note: "G4" },
    { name: "G#", key: "Y", color: "black", midi: 56, note: "G#4" },
    { name: "A", key: "H", color: "white", midi: 57, note: "A4" },
    { name: "A#", key: "U", color: "black", midi: 58, note: "A#4" },
    { name: "B", key: "J", color: "white", midi: 59, note: "B4" },
    { name: "C", key: "K", color: "white", midi: 60, note: "C5" },
  ];

  const getNoteNameForMidi = (keyMidi: number): string | null => {
    const { midiNotes, chordNotes, bassNote } = notesChordAlternatives;

    // if we have a bass note, we need to add this to the chord notes array
    const chordNotesArr = [...chordNotes];
    if (bassNote) {
      chordNotesArr.unshift(bassNote);
    }

    // Ensure midiNotes and chordNotes are defined and of equal length
    if (
      midiNotes &&
      chordNotesArr &&
      midiNotes.length === chordNotesArr.length
    ) {
      // Pre-process midiNotes to use pitch classes (0-11)
      const pitchClasses = midiNotes.map(midiNote => midiNote % 12);

      // Calculate the target pitch class for keyMidi
      const targetPitchClass = keyMidi % 12;

      // Find the index where the pitch class matches in pre-processed pitchClasses
      const noteIndex = pitchClasses.indexOf(targetPitchClass);

      // Return the corresponding chord note if found
      if (noteIndex !== -1) {
        return chordNotesArr[noteIndex];
      }
    }

    // Fallback: search for the note name in pianoKeys
    // const pianoKey = pianoKeys.find(key => key.midi === keyMidi);
    // return pianoKey ? pianoKey.name : null;
    return null;
  };

  // Piano key layout (7 white keys + upper "C" and 5 black keys for an octave)
  // const whiteKeys = ["C", "D", "E", "F", "G", "A", "B", "C"];
  // const blackKeys = ["C#", "D#", "F#", "G#", "A#"];
  const whiteKeys = pianoKeys.filter(key => key.color === "white");
  const blackKeys = pianoKeys.filter(key => key.color === "black");

  const whiteKeyWidth = 200 / 8; // 200 / 8 white keys (C to upper C)
  const whiteKeyHeight = 100;
  const blackKeyWidth = 18; // Thinner black keys
  const blackKeyHeight = 60;
  const cornerRadius = 3; // Adjust for more or less rounding

  return (
    <svg
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMin meet"
      viewBox="0 0 200 120">
      {/* Draw white keys including upper "C" */}
      {whiteKeys.map((key, index) => (
        <g
          key={key.midi}
          className="cursor-pointer"
          onPointerDown={() => handleKeyDown(key.midi)}>
          <rect
            x={index * whiteKeyWidth}
            y={0}
            width={whiteKeyWidth}
            height={whiteKeyHeight}
            fill={
              isSimilarKey(key.midi, selectedSamples)
                ? "#a9a9a9"
                : isSimilarKey(key.midi, notesChordAlternatives.midiNotes)
                  ? "#add8e6"
                  : "#f9f9f9"
            }
            stroke="#777"
            strokeWidth={1}
            rx={cornerRadius}
            ry={cornerRadius}
          />

          {isSimilarKey(key.midi, notesChordAlternatives.midiNotes) && (
            <text
              x={index * whiteKeyWidth + whiteKeyWidth / 2} // Centered below the key
              y={whiteKeyHeight - 10} // Positioning below the keys
              fontSize="0.5rem"
              fill={"#000"}
              fontFamily="Verdana"
              textAnchor="middle">
              {getNoteNameForMidi(key.midi)}
            </text>
          )}
        </g>
      ))}

      {/* Add a black C# key at the top for visual reference */}
      <rect
        x={8 * whiteKeyWidth - blackKeyWidth / 2 - 3} // Position above C
        y={0}
        width={blackKeyWidth}
        height={blackKeyHeight}
        fill="black"
        rx={cornerRadius}
        ry={cornerRadius}
      />

      {/* Draw black keys */}
      {blackKeys.map((key, index) => {
        const xPosition =
          index < 2
            ? (index + 1) * whiteKeyWidth - blackKeyWidth / 2
            : (index + 2) * whiteKeyWidth - blackKeyWidth / 2; // Offset for black keys
        return (
          <g
            key={key.midi}
            className="cursor-pointer"
            onPointerDown={() => handleKeyDown(key.midi)}>
            <rect
              x={xPosition}
              y={0}
              width={blackKeyWidth}
              height={blackKeyHeight}
              fill={
                isSimilarKey(key.midi, selectedSamples)
                  ? "#a9a9a9"
                  : isSimilarKey(key.midi, notesChordAlternatives.midiNotes)
                    ? "#30819c"
                    : "#202020"
              }
              stroke="#000"
              strokeWidth={0.5}
              rx={cornerRadius}
              ry={cornerRadius}
            />
            {isSimilarKey(key.midi, notesChordAlternatives.midiNotes) && (
              <text
                x={xPosition + blackKeyWidth / 2} // Centered above the key
                y={blackKeyHeight - 10} // Positioning for the black key labels
                fontSize="0.5rem"
                fill="white"
                fontFamily="Verdana"
                textAnchor="middle">
                {getNoteNameForMidi(key.midi)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const PianoChord: FunctionComponent<PianoChordProps> = ({
  notesChordAlternatives,
  playChord,
  playMidiNote,
}) => {
  // support selecting several samples at once
  const [selectedSamples, setSelectedSamples] = useState<number[]>([]);

  if (!notesChordAlternatives) return null;

  return (
    <>
      <KeyboardChord
        notesChordAlternatives={notesChordAlternatives}
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
      {/* Piano Notes */}
      <div className="px-4">
        <div className="flex justify-between font-semibold dark:text-gray-300">
          {notesChordAlternatives.chordNotes.map((note, index) => (
            <div
              role="button"
              tabIndex={0}
              key={note}
              className="w-6 text-center"
              onPointerDown={() => {
                if (notesChordAlternatives.midiNotes) {
                  const midiNote = notesChordAlternatives.bassNote
                    ? notesChordAlternatives.midiNotes[index + 1]
                    : notesChordAlternatives.midiNotes[index];

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
                }
              }}>
              <p className="text-base">{note}</p>
            </div>
          ))}
          {/* If Bass Note exist */}
          {notesChordAlternatives.bassNote && (
            <div
              role="button"
              tabIndex={0}
              className="w-6 text-center dark:text-gray-300"
              onPointerDown={() => {
                if (notesChordAlternatives.midiNotes) {
                  const midiNote = notesChordAlternatives.midiNotes[0];

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
                }
              }}>
              <p className="text-base">/{notesChordAlternatives.bassNote}</p>
            </div>
          )}
        </div>

        {/* Piano Intervals */}
        <div className="flex justify-between">
          {notesChordAlternatives.chordIntervals.map(interval => (
            <div key={interval} className="w-6 text-center dark:text-gray-300">
              <p className="text-sm">{interval}</p>
            </div>
          ))}
          {notesChordAlternatives.bassNote && (
            <div className="w-6 text-center" />
          )}
        </div>

        {/* Piano Chord Names */}
        <div className="pt-2 text-center">
          <div
            role="button"
            tabIndex={0}
            onPointerDown={() => {
              if (notesChordAlternatives.midiNotes) {
                playChord(
                  notesChordAlternatives.midiNotes,
                  (sample: SampleStart) => {
                    setSelectedSamples(prevSamples =>
                      prevSamples.includes(sample.note as number)
                        ? prevSamples
                        : [...prevSamples, sample.note as number]
                    );
                  },
                  (sample: SampleStart) => {
                    setSelectedSamples(prevSamples =>
                      prevSamples.filter(note => note !== sample.note)
                    );
                  }
                );
              }
            }}>
            {notesChordAlternatives.chordNames.map(chord => (
              <p key={chord} className="text-sm">
                {chord}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PianoChord;
