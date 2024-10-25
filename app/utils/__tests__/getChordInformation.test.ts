import { getChordInformation } from "../getChordInformation";
import { getChordInformationTonal } from "../getChordInformationTonal";

test("getChordInformation1", () => {
  expect(getChordInformation("Cmaj7")).toStrictEqual({
    isChord: true,
    chordName: "CMaj7",
    rootNote: "C",
    intervals: ["1", "3", "5", "7"],
    notes: ["C", "E", "G", "B"],
    semitones: [0, 4, 7, 11],
    bassNote: undefined,
    error: undefined,
  });
});

test("getChordInformationTonal1", () => {
  expect(getChordInformationTonal("Cmaj7")).toStrictEqual({
    isChord: true,
    chordName: "Cmaj7",
    rootNote: "C",
    intervals: ["1P", "3M", "5P", "7M"],
    notes: ["C", "E", "G", "B"],
    semitones: [0, 4, 7, 11],
    bassNote: "",
    error: undefined,
  });
});

test("getChordInformation2", () => {
  expect(getChordInformation("Cmaj7/B")).toStrictEqual({
    isChord: true,
    chordName: "CMaj7/B",
    rootNote: "C",
    bassNote: "B",
    intervals: ["1", "3", "5", "7"],
    notes: ["C", "E", "G", "B"],
    semitones: [0, 4, 7, 11],
    error: undefined,
  });
});

test("getChordInformationTonal2", () => {
  expect(getChordInformationTonal("Cmaj7/B")).toStrictEqual({
    isChord: true,
    chordName: "Cmaj7/B",
    rootNote: "C",
    bassNote: "B",
    intervals: ["7M", "8P", "10M", "12P"],
    notes: ["B", "C", "E", "G"],
    semitones: [11, 12, 16, 19],
    error: undefined,
  });
});

test("getChordInformation3", () => {
  expect(getChordInformation("Am13/G")).toStrictEqual({
    isChord: true,
    chordName: "Am13/G",
    rootNote: "A",
    bassNote: "G",
    intervals: ["1", "b3", "5", "b7", "9", "11", "13"],
    notes: ["A", "C", "E", "G", "B", "D", "Gb"],
    semitones: [0, 3, 7, 10, 14, 17, 21],
    error: undefined,
  });
});

test("getChordInformationTonal3", () => {
  expect(getChordInformationTonal("Am13/G")).toStrictEqual({
    isChord: true,
    chordName: "Am13/G",
    rootNote: "A",
    bassNote: "G",
    intervals: ["7m", "9M", "13M", "8P", "10m", "12P"],
    notes: ["G", "B", "F#", "A", "C", "E"],
    semitones: [10, 14, 21, 12, 15, 19],
    error: undefined,
  });
});

test("getChordInformation4", () => {
  expect(getChordInformation("Cm7b5/Gb")).toStrictEqual({
    isChord: true,
    chordName: "Cm7b5/Gb",
    rootNote: "C",
    bassNote: "Gb",
    intervals: ["1", "b3", "b5", "b7"],
    notes: ["C", "Eb", "Gb", "Bb"],
    semitones: [0, 3, 6, 10],
    error: undefined,
  });
});

test("getChordInformationTonal4", () => {
  expect(getChordInformationTonal("Cm7b5/Gb")).toStrictEqual({
    isChord: true,
    chordName: "Cm7b5/Gb",
    rootNote: "C",
    bassNote: "Gb",
    intervals: ["5d", "7m", "8P", "10m"],
    notes: ["Gb", "Bb", "C", "Eb"],
    semitones: [6, 10, 12, 15],
    error: undefined,
  });
});
