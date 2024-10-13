import { FunctionComponent, useEffect, useRef } from "react";
import { getChordAsString } from "~/utils/getChordAsString";
import { getChordInformationTonal } from "~/utils/getChordInformationTonal";
import { getChordSymbolTonal } from "~/utils/getChordSymbolTonal";
import {
  getNotesChordAlternatives,
  NotesChordAlternatives,
} from "~/utils/getNotesChordAlternatives";
import { Chord } from "chordsheetjs";
import { Midi } from "tonal";

import { getChordInformation } from "../utils/getChordInformation";
import ChordChart from "./ChordChart";
import { MyDrawer } from "./MyDrawer";
import { Button } from "./ui/button";

// guitar.json
export interface ChordPosition {
  frets: number[]; // which fret is which finger at: 1 - 4 or, 0 = open, -1 = non-used
  fingers?: number[]; // fingers: 1 - 4 or 0 = no finger
  baseFret: number; // which fret do we start with, normally 1
  barres?: number[]; // one or more fingers is pressed onto multiple strings, 1 - 4
  capo?: boolean; // whether the barres overlaps the whole fretboard
  midi: number[]; // midi notes
  notes?: string[]; // the midi notes as note names
}

export interface ChordElement {
  key: string;
  suffix: string;
  positions: ChordPosition[];
}

interface Chords {
  [key: string]: ChordElement[];
}

interface Tunings {
  standard: string[];
}

interface Main {
  strings: number;
  fretsOnChord: number;
  name: string;
  numberOfChords: number;
}

export interface GuitarChords {
  main: Main;
  tunings: Tunings;
  keys: string[];
  suffixes: string[];
  chords: Chords;
}

interface Props {
  guitarChords: GuitarChords;
  showPiano: boolean;
  onShowChange: (checked: boolean) => void;
  showChangeLabel: string;
  selectedChord: Chord | null | undefined;
  allChords: Chord[];
  onPressClose: () => void;
  closeLabel: string;
}

const getChordMap = (jsonData: GuitarChords) => {
  // Initialize an empty Map
  const chordMap = new Map<string, ChordElement>();

  // Helper function to handle sharp/flat equivalences
  const addChordToMap = (chord: ChordElement, key: string, suffix: string) => {
    const combinedKey = `${key}${suffix}`;
    const combinedKeyNew = getChordSymbolTonal(combinedKey);
    chordMap.set(combinedKeyNew, chord);
  };

  // Mapping of flats to sharps, and the other way around
  // https://github.com/tombatossals/chords-db/issues/24
  // The database has only registered the flat chords, as they are the same as the sharp of the anterior key:
  // A# = Bb, D# = Eb, G# = Ab
  const equivalentMap: Record<string, string> = {
    "C#": "Db",
    "F#": "Gb",
    Eb: "D#",
    Ab: "G#",
    Bb: "A#",
  };

  // Iterate over the keys (C, C#, etc.)
  for (const key in jsonData.chords) {
    // Iterate over each chord (which contains key and suffix)
    jsonData.chords[key].forEach(chord => {
      // Sort the chord positions by baseFret
      chord.positions.sort((a, b) => a.baseFret - b.baseFret);

      // Map midi to note names and add it as the `notes` property
      chord.positions = chord.positions.map(position => ({
        ...position,
        // Add note names as 'notes' property
        notes: position.midi.map(midiNote =>
          Midi.midiToNoteName(midiNote, { sharps: true })
        ),
      }));

      // Add the original chord
      addChordToMap(chord, chord.key, chord.suffix);

      // If the chord key is a flat (Bb, Eb, Ab), add the corresponding sharp equivalent
      if (equivalentMap[chord.key]) {
        const equivalent = equivalentMap[chord.key];
        addChordToMap(chord, equivalent, chord.suffix);
      }
    });
  }

  return chordMap;
};

const renderPianoChord = (
  notesChordAlternatives: NotesChordAlternatives | undefined
) => {
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
    <div className="flex min-w-52 flex-col p-3">
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
          {notesChordAlternatives.chordNames.map(chord => (
            <p key={chord} className="text-sm">
              {chord}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

const renderGuitarChord = (
  guitarChord: ChordElement | undefined,
  guitarChordLookup: string
) => {
  return (
    <div className="py-2">
      {/* Guitar Chord Chart */}
      <ChordChart chord={guitarChord} />
      <p className="text-center text-sm">{guitarChordLookup}</p>
    </div>
  );
};

const ChordTab: FunctionComponent<Props> = ({
  guitarChords,
  showPiano,
  onShowChange,
  showChangeLabel,
  selectedChord,
  allChords,
  onPressClose,
  closeLabel,
}) => {
  const columnRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (selectedChord) {
      const index = allChords.findIndex(
        chord => chord.toString() === selectedChord.toString()
      );

      // Delay scroll until DOM is updated
      if (columnRefs.current[index]) {
        setTimeout(() => {
          columnRefs.current[index].scrollIntoView({
            behavior: "auto", // Use "smooth" for smooth scrolling
            block: "nearest", // Scroll to the nearest block position
            inline: "center", // Scroll horizontally
          });
        }, 0); // Delay by 0ms to ensure it's called after the DOM update
      }
    }
  }, [selectedChord, allChords]);

  if (!selectedChord) return null;

  const chordMap = getChordMap(guitarChords);

  return (
    <MyDrawer open={!!selectedChord} onOpenChange={onPressClose}>
      {/* Toggle Button */}
      <Button
        onClick={() => onShowChange(!showPiano)}
        variant="link"
        className="w-full">
        {showChangeLabel}
      </Button>

      {/* Scrollable Chord Area */}
      <div className="flex flex-row overflow-x-auto">
        {allChords.map((item, index) => {
          const chordName = getChordAsString(item);
          const selectedChordName = getChordAsString(selectedChord);
          const isSelected = chordName === selectedChordName;

          let guitarChordLookup = chordName;
          const lookupChordInfo = getChordInformationTonal(chordName);

          let guitarChord: ChordElement | undefined = undefined;
          if (lookupChordInfo.isChord) {
            guitarChord = chordMap.get(lookupChordInfo.chordName);
            guitarChordLookup = lookupChordInfo.chordName;
          }
          if (!guitarChord && lookupChordInfo.chordName.includes("/")) {
            // lookup again without the bassNote
            const split = lookupChordInfo.chordName.split("/");
            const chordNameNoBass = split[0];
            guitarChord = chordMap.get(chordNameNoBass);
            guitarChordLookup = chordNameNoBass;
          }

          // Get piano alternatives only if showPiano is true
          const notesChordAlternatives = showPiano
            ? getNotesChordAlternatives(
                guitarChordLookup,
                getChordInformation,
                true
              )
            : undefined;

          return (
            <div
              key={index}
              ref={el => {
                if (el) {
                  columnRefs.current[index] = el;
                }
              }}
              className={`${isSelected ? "border-2 border-cyan-500" : ""}`}>
              {showPiano
                ? renderPianoChord(notesChordAlternatives)
                : renderGuitarChord(guitarChord, guitarChordLookup)}
            </div>
          );
        })}
      </div>

      {/* Close Button */}
      <Button
        onClick={onPressClose}
        variant="outline"
        className="m-2 p-2 font-sans">
        {closeLabel}
      </Button>
    </MyDrawer>
  );
};

export default ChordTab;
