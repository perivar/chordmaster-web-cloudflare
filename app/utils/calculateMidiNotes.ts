// Define a map for note names to their MIDI numbers
const midiNoteMap: Record<string, number> = {
  C: 48,
  "C#": 49,
  Db: 49,
  D: 50,
  "D#": 51,
  Eb: 51,
  E: 52,
  F: 53,
  "F#": 54,
  Gb: 54,
  G: 55,
  "G#": 56,
  Ab: 56,
  A: 57,
  "A#": 58,
  Bb: 58,
  B: 59,
};

type Note = keyof typeof midiNoteMap;

/**
 * Calculate MIDI notes based on a root note and semitone intervals.
 * @param rootNote - The root note as a string (e.g., "C", "D#", "Eb").
 * @param semitones - Array of semitone intervals from the root note.
 * @returns Array of MIDI note numbers.
 */
export const calculateMidiNotes = (
  rootNote: Note,
  semitones: number[],
  bassNote?: Note
): number[] => {
  const rootMidi = midiNoteMap[rootNote];
  if (rootMidi === undefined) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }

  // Calculate MIDI notes from semitones
  const midiFromSemitones = semitones.map(semitone => rootMidi + semitone);

  // Check if a valid bass note is provided
  if (bassNote) {
    const maybeBassNoteMidi = midiNoteMap[bassNote];
    if (maybeBassNoteMidi) {
      const bassNoteMidi = maybeBassNoteMidi - 12;
      // Add bass note only if it's not already in midiFromSemitones
      if (!midiFromSemitones.includes(bassNoteMidi)) {
        return [bassNoteMidi, ...midiFromSemitones];
      }
    }
  }

  // Return only the MIDI notes if no valid bass note is found or if it's a duplicate
  return midiFromSemitones;
};
