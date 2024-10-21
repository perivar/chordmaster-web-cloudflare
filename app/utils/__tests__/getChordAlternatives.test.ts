import { getChordInformation } from "../getChordInformation";
import { getChordInformationTonal } from "../getChordInformationTonal";
import { getNotesChordAlternatives } from "../getNotesChordAlternatives";

test("getChordAlternatives1", () => {
  expect(
    getNotesChordAlternatives("G/F#", getChordInformation, true)
  ).toStrictEqual({
    bassNote: "F#",
    chordIntervals: ["1", "3", "5"],
    chordNames: ["G/F#", "GMaj7/F#"],
    chordNotes: ["G", "B", "D"],
    rootNote: "G",
  });
});

test("getChordAlternativesTonal2", () => {
  expect(
    getNotesChordAlternatives("G/F#", getChordInformationTonal, false)
  ).toStrictEqual({
    bassNote: "F#",
    chordIntervals: ["-2m", "1P", "3M", "5P"],
    chordNames: ["G/F#", "Gmaj7/F#"],
    chordNotes: ["F#", "G", "B", "D"],
    rootNote: "G",
  });
});

test("getChordAlternatives2", () => {
  expect(
    getNotesChordAlternatives("G11", getChordInformation, true)
  ).toStrictEqual({
    bassNote: undefined,
    chordIntervals: ["1", "5", "b7", "9", "11"],
    chordNames: ["G11", "G9sus", "Dm7add11/G", "F69/G"],
    chordNotes: ["G", "D", "F", "A", "C"],
    rootNote: "G",
  });
});

test("getChordAlternativesTonal2", () => {
  expect(
    getNotesChordAlternatives("G11", getChordInformationTonal, false)
  ).toStrictEqual({
    bassNote: "",
    chordIntervals: ["1P", "5P", "7m", "9M", "11P"],
    chordNames: ["G11", "G9sus4", "Dm7add11/G", "F6add9/G"],
    chordNotes: ["G", "D", "F", "A", "C"],
    rootNote: "G",
  });
});

test("getChordAlternatives3", () => {
  expect(
    getNotesChordAlternatives("Cm7b5/Gb", getChordInformation, true)
  ).toStrictEqual({
    bassNote: "Gb",
    chordIntervals: ["1", "b3", "b5", "b7"],
    chordNames: ["Cm7b5/Gb", "Ebm6/Gb"],
    chordNotes: ["C", "Eb", "Gb", "Bb"],
    rootNote: "C",
  });
});

test("getChordAlternativesTonal3", () => {
  expect(
    getNotesChordAlternatives("Cm7b5/Gb", getChordInformationTonal, false)
  ).toStrictEqual({
    bassNote: "Gb",
    chordIntervals: ["5d", "7m", "8P", "10m"],
    chordNames: ["Cm7b5/Gb", "Ebm6/Gb"],
    chordNotes: ["Gb", "Bb", "C", "Eb"],
    rootNote: "C",
  });
});

test("getChordAlternatives4", () => {
  expect(
    getNotesChordAlternatives("Dm7b5/Gb", getChordInformation, true)
  ).toStrictEqual({
    bassNote: "Gb",
    chordIntervals: ["1", "b3", "b5", "b7"],
    chordNames: ["Dm7b5/Gb"],
    chordNotes: ["D", "F", "Ab", "C"],
    rootNote: "D",
  });
});

test("getChordAlternativesTonal4", () => {
  expect(
    getNotesChordAlternatives("Dm7b5/Gb", getChordInformationTonal, false)
  ).toStrictEqual({
    bassNote: "Gb",
    chordIntervals: ["-5A", "1P", "3m", "5d", "7m"],
    chordNames: ["Dm7b5/Gb"],
    chordNotes: ["Gb", "D", "F", "Ab", "C"],
    rootNote: "D",
  });
});

test("getChordAlternatives5", () => {
  expect(
    getNotesChordAlternatives("C°7(addM7,11,b13)", getChordInformation, true)
  ).toStrictEqual({
    bassNote: undefined,
    chordIntervals: ["1", "b3", "b5", "bb7", "7", "11", "b13"],
    chordNames: ["C°7(addM7,11,b13)", "B13b9#11/C"],
    chordNotes: ["C", "Eb", "Gb", "A", "B", "F", "Ab"],
    rootNote: "C",
  });
});

test("getChordAlternativesTonal5", () => {
  expect(
    getNotesChordAlternatives(
      "C°7(addM7,11,b13)",
      getChordInformationTonal,
      false
    )
  ).toStrictEqual({
    bassNote: undefined,
    chordIntervals: [],
    chordNames: ["C°7(addM7,11,b13)"],
    chordNotes: [],
    rootNote: undefined,
  });
});

test("getChordAlternatives6", () => {
  expect(
    getNotesChordAlternatives("C13(b9,#9)/Bb", getChordInformation, true)
  ).toStrictEqual({
    bassNote: "Bb",
    chordIntervals: ["1", "3", "5", "b7", "b9", "#9", "13"],
    chordNames: ["C13(b9,#9)/Bb", "Eb13b9#11/Bb"],
    chordNotes: ["C", "E", "G", "Bb", "Db", "Eb", "A"],
    rootNote: "C",
  });
});

test("getChordAlternativesTonal6", () => {
  expect(
    getNotesChordAlternatives("C13(b9,#9)/Bb", getChordInformationTonal, false)
  ).toStrictEqual({
    bassNote: undefined,
    chordIntervals: [],
    chordNames: ["C13(b9,#9)/Bb"],
    chordNotes: [],
    rootNote: undefined,
  });
});
