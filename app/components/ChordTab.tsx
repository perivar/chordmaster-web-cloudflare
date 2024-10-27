import { FunctionComponent, useEffect, useRef } from "react";
import { getChordInformation } from "~/utils/getChordInformation";
import { getChordSymbol } from "~/utils/getChordSymbol";
import {
  ChordElement,
  getGuitarChordMap,
  GuitarChords,
} from "~/utils/getGuitarChordMap";
import {
  getNotesChordAlternatives,
  NotesChordAlternatives,
} from "~/utils/getNotesChordAlternatives";
import { Chord } from "chordsheetjs";

import usePlaySound from "~/hooks/usePlaySound";

import GuitarChord from "./GuitarChord";
import { MyDrawer } from "./MyDrawer";
import PianoChord from "./PianoChord";
import { Button } from "./ui/button";

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

  const { playArpFastAndArp, playChordAndArp, playMidiNote } = usePlaySound();

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

  const renderPianoChord = (
    notesChordAlternatives: NotesChordAlternatives | undefined
  ) => {
    return (
      <div className="flex min-w-52 flex-col p-3">
        <PianoChord
          notesChordAlternatives={notesChordAlternatives}
          playChord={playChordAndArp}
          playMidiNote={playMidiNote}
        />
      </div>
    );
  };

  const renderGuitarChord = (
    guitarChord: ChordElement | undefined,
    guitarChordLookup: string
  ) => {
    return (
      <div className="py-2">
        <GuitarChord
          chord={guitarChord}
          name={guitarChordLookup}
          playChord={playArpFastAndArp}
          playMidiNote={playMidiNote}
        />
      </div>
    );
  };

  const chordMap = getGuitarChordMap(guitarChords);

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
          const chordName = getChordSymbol(item.toString());
          const selectedChordName = getChordSymbol(selectedChord.toString());
          const isSelected = chordName === selectedChordName;

          // keep track of what chord and the lookup value we are using to lookup the guitar tab
          let guitarChordLookup = chordName;
          let guitarChord: ChordElement | undefined = undefined;

          // If showPiano is false, lookup the guitar chords
          if (!showPiano) {
            // lookup using normal rendering
            const lookupChordInfo = getChordInformation(chordName);
            if (lookupChordInfo.isChord) {
              guitarChord = chordMap.get(lookupChordInfo.chordName);
              guitarChordLookup = lookupChordInfo.chordName;
            }
            // lookup again using simple rendering
            if (!guitarChord) {
              const lookupChordInfoSimple = getChordInformation(
                chordName,
                true
              );
              if (lookupChordInfoSimple.isChord) {
                guitarChord = chordMap.get(lookupChordInfoSimple.chordName);
                guitarChordLookup = lookupChordInfoSimple.chordName;
              }
            }
            // lookup again without the bassNote
            if (!guitarChord && lookupChordInfo.chordName.includes("/")) {
              const split = lookupChordInfo.chordName.split("/");
              const chordNameNoBass = split[0];
              guitarChord = chordMap.get(chordNameNoBass);
              guitarChordLookup = chordNameNoBass;
            }
          }

          // Get piano alternatives only if showPiano is true
          const notesChordAlternatives = showPiano
            ? getNotesChordAlternatives(chordName, getChordInformation, true)
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
