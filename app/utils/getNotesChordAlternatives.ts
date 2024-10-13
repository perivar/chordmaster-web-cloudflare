import { getChordAlternatives } from "./getChordAlternatives";
import { ChordInformation } from "./getChordInformation";

export interface NotesChordAlternatives {
  chordNotes: string[];
  chordNames: string[];
  chordIntervals: string[];
  rootNote?: string;
  bassNote?: string;
}

export const getNotesChordAlternatives = (
  chordName: string,
  getChordInfo: (value: string) => ChordInformation,
  doFixAlternativeChordNames: boolean = true
) => {
  const notesChordAlternatives: NotesChordAlternatives = {
    chordNotes: [],
    chordNames: [],
    chordIntervals: [],
    rootNote: undefined,
    bassNote: undefined,
  };

  const chordInfo = getChordInfo(chordName);
  notesChordAlternatives.rootNote = chordInfo.rootNote;
  notesChordAlternatives.bassNote = chordInfo.bassNote;
  notesChordAlternatives.chordNotes = chordInfo.notes;
  notesChordAlternatives.chordIntervals = chordInfo.intervals;

  // add base note as first note if it exist
  const altChordNotes = [...notesChordAlternatives.chordNotes];
  if (notesChordAlternatives.bassNote) {
    altChordNotes.unshift(notesChordAlternatives.bassNote);
  }

  // lookup alternative chord names
  const alternatives = getChordAlternatives(altChordNotes);
  if (alternatives.chordNames) {
    notesChordAlternatives.chordNames = alternatives.chordNames;
  }

  // read and fix alternative chord names
  if (doFixAlternativeChordNames) {
    notesChordAlternatives.chordNames = notesChordAlternatives.chordNames.map(
      name => {
        const chordAlternativeInfo = getChordInfo(name);
        if (chordAlternativeInfo.isChord) {
          return `${chordAlternativeInfo.chordName}`;
        } else {
          // failed parsing chord
          return `${name}`;
        }
      }
    );
  }

  // and add the original chord if its not already added
  // use some and toLowerCase for case insensitive search
  const alreadyAdded = notesChordAlternatives.chordNames.some(element => {
    return element.toLowerCase() === chordName.toLowerCase();
  });

  if (!alreadyAdded) {
    // add chord as first chord if it does not already exist
    notesChordAlternatives.chordNames.unshift(chordName);
  }

  return notesChordAlternatives;
};
