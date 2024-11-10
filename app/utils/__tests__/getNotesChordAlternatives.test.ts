import { getChordInformation } from "../getChordInformation";
import { getChordInformationTonal } from "../getChordInformationTonal";
import { getNotesChordAlternatives } from "../getNotesChordAlternatives";

// set this to true to debug the outputs as objects
const DO_DEBUG_OBJECT = false;

test("getNotesChordAlternatives1", () => {
  const actual = getNotesChordAlternatives("G/F#", getChordInformation, true);
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: ["G", "B", "D"],
    chordNames: ["G/F#", "GMaj7/F#"],
    chordIntervals: ["1", "3", "5"],
    chordSemitones: [0, 4, 7],
    rootNote: "G",
    bassNote: "F#",
    midiNotes: [42, 55, 59, 62],
  });
});

test("getNotesChordAlternativesTonal1", () => {
  const actual = getNotesChordAlternatives(
    "G/F#",
    getChordInformationTonal,
    false
  );
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: ["F#", "G", "B", "D"],
    chordNames: ["G/F#", "Gmaj7/F#"],
    chordIntervals: ["-2m", "1P", "3M", "5P"],
    chordSemitones: [-1, 0, 4, 7],
    rootNote: "G",
    bassNote: "F#",
    midiNotes: [42, 54, 55, 59, 62],
  });
});

test("getNotesChordAlternatives2", () => {
  const actual = getNotesChordAlternatives("G11", getChordInformation, true);
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: ["G", "D", "F", "A", "C"],
    chordNames: ["G11", "G9sus", "Dm7add11/G", "F69/G"],
    chordIntervals: ["1", "5", "b7", "9", "11"],
    chordSemitones: [0, 7, 10, 14, 17],
    rootNote: "G",
    bassNote: undefined,
    midiNotes: [55, 62, 65, 69, 72],
  });
});

test("getNotesChordAlternativesTonal2", () => {
  const actual = getNotesChordAlternatives(
    "G11",
    getChordInformationTonal,
    false
  );
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: ["G", "D", "F", "A", "C"],
    chordNames: ["G11", "G9sus4", "Dm7add11/G", "F6add9/G"],
    chordIntervals: ["1P", "5P", "7m", "9M", "11P"],
    chordSemitones: [0, 7, 10, 14, 17],
    rootNote: "G",
    bassNote: "",
    midiNotes: [55, 62, 65, 69, 72],
  });
});

test("getNotesChordAlternatives3", () => {
  const actual = getNotesChordAlternatives(
    "Cm7b5/Gb",
    getChordInformation,
    true
  );
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: ["C", "Eb", "Gb", "Bb"],
    chordNames: ["Cm7b5/Gb", "Ebm6/Gb"],
    chordIntervals: ["1", "b3", "b5", "b7"],
    chordSemitones: [0, 3, 6, 10],
    rootNote: "C",
    bassNote: "Gb",
    midiNotes: [42, 48, 51, 54, 58],
  });
});

test("getNotesChordAlternativesTonal3", () => {
  const actual = getNotesChordAlternatives(
    "Cm7b5/Gb",
    getChordInformationTonal,
    false
  );
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: ["Gb", "Bb", "C", "Eb"],
    chordNames: ["Cm7b5/Gb", "Ebm6/Gb"],
    chordIntervals: ["5d", "7m", "8P", "10m"],
    chordSemitones: [6, 10, 12, 15],
    rootNote: "C",
    bassNote: "Gb",
    midiNotes: [42, 54, 58, 60, 63],
  });
});

test("getNotesChordAlternatives4", () => {
  const actual = getNotesChordAlternatives(
    "Dm7b5/Gb",
    getChordInformation,
    true
  );
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: ["D", "F", "Ab", "C"],
    chordNames: ["Dm7b5/Gb"],
    chordIntervals: ["1", "b3", "b5", "b7"],
    chordSemitones: [0, 3, 6, 10],
    rootNote: "D",
    bassNote: "Gb",
    midiNotes: [42, 50, 53, 56, 60],
  });
});

test("getNotesChordAlternativesTonal4", () => {
  const actual = getNotesChordAlternatives(
    "Dm7b5/Gb",
    getChordInformationTonal,
    false
  );
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: ["Gb", "D", "F", "Ab", "C"],
    chordNames: ["Dm7b5/Gb"],
    chordIntervals: ["-5A", "1P", "3m", "5d", "7m"],
    chordSemitones: [-8, 0, 3, 6, 10],
    rootNote: "D",
    bassNote: "Gb",
    midiNotes: [42, 50, 53, 56, 60],
  });
});

test("getNotesChordAlternatives5", () => {
  const actual = getNotesChordAlternatives(
    "C°7(addM7,11,b13)",
    getChordInformation,
    true
  );
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: ["C", "Eb", "Gb", "A", "B", "F", "Ab"],
    chordNames: ["C°7(addM7,11,b13)", "B13b9#11/C"],
    chordIntervals: ["1", "b3", "b5", "bb7", "7", "11", "b13"],
    chordSemitones: [0, 3, 6, 9, 11, 17, 20],
    rootNote: "C",
    bassNote: undefined,
    midiNotes: [48, 51, 54, 57, 59, 65, 68],
  });
});

test("getNotesChordAlternativesTonal5", () => {
  const actual = getNotesChordAlternatives(
    "C°7(addM7,11,b13)",
    getChordInformationTonal,
    false
  );
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: [],
    chordNames: ["C°7(addM7,11,b13)"],
    chordIntervals: [],
    chordSemitones: [],
    rootNote: undefined,
    bassNote: undefined,
    midiNotes: undefined,
  });
});

test("getNotesChordAlternatives6", () => {
  const actual = getNotesChordAlternatives(
    "C13(b9,#9)/Bb",
    getChordInformation,
    true
  );
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: ["C", "E", "G", "Bb", "Db", "Eb", "A"],
    chordNames: ["C13(b9,#9)/Bb", "Eb13b9#11/Bb"],
    chordIntervals: ["1", "3", "5", "b7", "b9", "#9", "13"],
    chordSemitones: [0, 4, 7, 10, 13, 15, 21],
    rootNote: "C",
    bassNote: "Bb",
    midiNotes: [46, 48, 52, 55, 58, 61, 63, 69],
  });
});

test("getNotesChordAlternativesTonal6", () => {
  const actual = getNotesChordAlternatives(
    "C13(b9,#9)/Bb",
    getChordInformationTonal,
    false
  );
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual({
    chordNotes: [],
    chordNames: ["C13(b9,#9)/Bb"],
    chordIntervals: [],
    chordSemitones: [],
    rootNote: undefined,
    bassNote: undefined,
    midiNotes: undefined,
  });
});
