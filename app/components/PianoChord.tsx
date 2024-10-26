import { FunctionComponent } from "react";
import { calculateMidiNotes } from "~/utils/calculateMidiNotes";
import { NotesChordAlternatives } from "~/utils/getNotesChordAlternatives";

interface PianoChordProps {
  notesChordAlternatives: NotesChordAlternatives | undefined;
  playChord: (midiNotes: number[]) => void;
  playMidiNote: (midiNote: number) => void;
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

const PianoChord: FunctionComponent<PianoChordProps> = ({
  notesChordAlternatives,
  playChord,
  playMidiNote,
}) => {
  const renderPianoChord = () => {
    if (!notesChordAlternatives) return null;

    const midiNotes = getMidiNotes(notesChordAlternatives);

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

    const pianoKeys = [
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
    const blackKeyWidth = 16; // Thinner black keys
    const cornerRadius = 3; // Adjust for more or less rounding

    return (
      <>
        <svg
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMinYMin meet"
          viewBox="0 0 200 120">
          {/* Draw white keys including upper "C" */}
          {whiteKeys.map((key, index) => (
            <g key={key.midi} onPointerDown={() => playMidiNote(key.midi)}>
              <rect
                x={index * whiteKeyWidth}
                y={0}
                width={whiteKeyWidth}
                height={100}
                fill={isNotePressed(key.name) ? "#add8e6" : "white"} // Highlight pressed keys
                stroke="#777"
                strokeWidth={1}
                rx={cornerRadius}
                ry={cornerRadius}
              />

              {isNotePressed(key.name) && (
                <text
                  x={index * whiteKeyWidth + whiteKeyWidth / 2} // Centered below the key
                  y={90} // Positioning below the keys
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
            height={70}
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
              <g key={key.midi} onPointerDown={() => playMidiNote(key.midi)}>
                <rect
                  x={xPosition}
                  y={0}
                  width={blackKeyWidth}
                  height={70}
                  fill={isNotePressed(key.name) ? "#30819c" : "black"} // Highlight pressed keys
                  stroke="#000"
                  strokeWidth={0.5}
                  rx={cornerRadius}
                  ry={cornerRadius}
                />
                {isNotePressed(key.name) && (
                  <text
                    x={xPosition + blackKeyWidth / 2} // Centered above the key
                    y={60} // Positioning for the black key labels
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
                  if (midiNotes) playMidiNote(midiNotes[index]);
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
              <div
                key={interval}
                className="w-6 text-center dark:text-gray-300">
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
                if (midiNotes) playChord(midiNotes);
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

  return <>{renderPianoChord()}</>;
};

export default PianoChord;
