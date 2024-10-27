import { FunctionComponent, useState } from "react";
import { calculateMidiNotes } from "~/utils/calculateMidiNotes";
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

const getMidiNotes = (
  notesChordAlternatives: NotesChordAlternatives | undefined
): number[] | undefined => {
  if (notesChordAlternatives && notesChordAlternatives.rootNote) {
    // get the midi notes
    const midiNotes = calculateMidiNotes(
      notesChordAlternatives.rootNote,
      notesChordAlternatives.chordSemitones
    );

    return midiNotes;
  }
};

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

  // Enharmonic equivalent mapping (sharp to flat)
  const enharmonicMap: { [key: string]: string } = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb",
  };

  // Function to determine if a note is pressed, including flat equivalents
  const isNotePressed = (note: string) => {
    const flatEquivalent = enharmonicMap[note] || note;
    return (
      notesChordAlternatives.chordNotes.includes(note) ||
      notesChordAlternatives.chordNotes.includes(flatEquivalent) ||
      (notesChordAlternatives.bassNote &&
        (notesChordAlternatives.bassNote === note ||
          notesChordAlternatives.bassNote === flatEquivalent))
    );
  };

  const isSameKey = (keyMidi1: number, keyMidi2?: number[]) => {
    if (!keyMidi2 || keyMidi2.length === 0) {
      return false;
    }

    // Calculate the note name by getting the remainder of division by 12
    const noteKey1 = keyMidi1 % 12;

    // Check if any key in keyMidi2 matches noteKey1
    return keyMidi2.some(key => key % 12 === noteKey1);
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
              isSameKey(key.midi, selectedSamples)
                ? "#a9a9a9"
                : isNotePressed(key.name)
                  ? "#add8e6"
                  : "#f9f9f9"
            }
            stroke="#777"
            strokeWidth={1}
            rx={cornerRadius}
            ry={cornerRadius}
          />

          {isNotePressed(key.name) && (
            <text
              x={index * whiteKeyWidth + whiteKeyWidth / 2} // Centered below the key
              y={whiteKeyHeight - 10} // Positioning below the keys
              fontSize="0.5rem"
              fill={"#000"}
              fontFamily="Verdana"
              textAnchor="middle">
              {key.name}
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
                isSameKey(key.midi, selectedSamples)
                  ? "#a9a9a9"
                  : isNotePressed(key.name)
                    ? "#30819c"
                    : "#202020"
              }
              stroke="#000"
              strokeWidth={0.5}
              rx={cornerRadius}
              ry={cornerRadius}
            />
            {isNotePressed(key.name) && (
              <text
                x={xPosition + blackKeyWidth / 2} // Centered above the key
                y={blackKeyHeight - 10} // Positioning for the black key labels
                fontSize="0.5rem"
                fill="white"
                fontFamily="Verdana"
                textAnchor="middle">
                {key.name}
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

  const midiNotes = getMidiNotes(notesChordAlternatives);

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
                if (midiNotes)
                  playMidiNote(
                    midiNotes[index],
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
              <p className="text-base">{note}</p>
            </div>
          ))}
          {notesChordAlternatives.bassNote && (
            <div className="w-6 text-center dark:text-gray-300">
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
              if (midiNotes)
                playChord(
                  midiNotes,
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
