import { calculateMidiNotes } from "./calculateMidiNotes";
import { getChordAlternativesTonal } from "./getChordAlternativesTonal";
import { ChordInformation } from "./getChordInformation";

export interface NotesChordAlternatives {
  chordNotes: string[];
  chordNames: string[];
  chordIntervals: string[];
  chordSemitones: number[];
  rootNote?: string;
  bassNote?: string;
  midiNotes?: number[]; // the midi notes corresponding to the chord notes
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
    chordSemitones: [],
    rootNote: undefined,
    bassNote: undefined,
    midiNotes: undefined,
  };

  const chordInfo = getChordInfo(chordName);
  notesChordAlternatives.rootNote = chordInfo.rootNote;
  notesChordAlternatives.bassNote = chordInfo.bassNote;
  notesChordAlternatives.chordNotes = chordInfo.notes;
  notesChordAlternatives.chordIntervals = chordInfo.intervals;
  notesChordAlternatives.chordSemitones = chordInfo.semitones;

  // add base note as first note if it exist
  const lookupChordNotes = [...notesChordAlternatives.chordNotes]; // create new array
  if (notesChordAlternatives.bassNote) {
    lookupChordNotes.unshift(notesChordAlternatives.bassNote);
  }

  // lookup alternative chord names
  const chordAlternatives = getChordAlternativesTonal(lookupChordNotes);
  if (chordAlternatives.chordNames) {
    notesChordAlternatives.chordNames = chordAlternatives.chordNames;
  }

  // read and fix alternative chord names
  // useful since tonaljs returns chord names in a special format
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

  // add the corresponding midi notes to the object as well
  if (notesChordAlternatives.rootNote) {
    notesChordAlternatives.midiNotes = calculateMidiNotes(
      notesChordAlternatives.rootNote,
      notesChordAlternatives.chordSemitones,
      notesChordAlternatives.bassNote
    );
  }

  return notesChordAlternatives;
};
