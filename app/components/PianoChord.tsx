import { FunctionComponent } from "react";
import { NotesChordAlternatives } from "~/utils/getNotesChordAlternatives";

interface Props {
  notesChordAlternatives: NotesChordAlternatives | undefined;
}

const PianoChord: FunctionComponent<Props> = ({ notesChordAlternatives }) => {
  const renderPianoChord = () => {
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

    // Piano key layout (7 white keys + upper "C" and 5 black keys for an octave)
    const whiteKeys = ["C", "D", "E", "F", "G", "A", "B", "C"];
    const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

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
            <g key={index}>
              <rect
                x={index * whiteKeyWidth}
                y={0}
                width={whiteKeyWidth}
                height={100}
                fill={isNotePressed(key) ? "#add8e6" : "white"} // Highlight pressed keys
                stroke="#777"
                strokeWidth={1}
                rx={cornerRadius}
                ry={cornerRadius}
              />
              {isNotePressed(key) && (
                <text
                  x={index * whiteKeyWidth + whiteKeyWidth / 2} // Centered below the key
                  y={90} // Positioning below the keys
                  fontSize="0.5rem"
                  fill={"#000"}
                  fontFamily="Verdana"
                  textAnchor="middle">
                  {key}
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
              <g key={key}>
                <rect
                  x={xPosition}
                  y={0}
                  width={blackKeyWidth}
                  height={70}
                  fill={isNotePressed(key) ? "#30819c" : "black"} // Highlight pressed keys
                  stroke="#000"
                  strokeWidth={0.5}
                  rx={cornerRadius}
                  ry={cornerRadius}
                />
                {isNotePressed(key) && (
                  <text
                    x={xPosition + blackKeyWidth / 2} // Centered above the key
                    y={60} // Positioning for the black key labels
                    fontSize="0.5rem"
                    fill="white"
                    fontFamily="Verdana"
                    textAnchor="middle">
                    {key}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Piano Notes */}
        <div className="px-4">
          <div className="flex justify-between font-semibold dark:text-gray-300">
            {notesChordAlternatives.chordNotes.map(note => (
              <div key={note} className="w-6 text-center">
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
            {notesChordAlternatives.chordNames.map(chord => (
              <p key={chord} className="text-sm">
                {chord}
              </p>
            ))}
          </div>
        </div>
      </>
    );
  };

  return <>{renderPianoChord()}</>;
};

export default PianoChord;
