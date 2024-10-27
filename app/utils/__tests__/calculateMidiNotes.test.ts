import { calculateMidiNotes } from "../calculateMidiNotes";

// set this to true to debug the outputs as objects
const DO_DEBUG_OBJECT = false;

// Am13/G
test("calculateMidiNotes1", () => {
  const actual = calculateMidiNotes("A", [0, 3, 7, 10, 14, 17, 21], "G");
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual([43, 57, 60, 64, 67, 71, 74, 78]);
});

// C7
test("calculateMidiNotes2", () => {
  const actual = calculateMidiNotes("C", [0, 4, 7, 10]);
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual([48, 52, 55, 58]);
});

// C11
test("calculateMidiNotes3", () => {
  const actual = calculateMidiNotes("C", [0, 7, 10, 14, 17]);
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual([48, 55, 58, 62, 65]);
});

// G
test("calculateMidiNotes4", () => {
  const actual = calculateMidiNotes("G", [0, 4, 7]);
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual([55, 59, 62]);
});

// Am7/D
test("calculateMidiNotes5", () => {
  const actual = calculateMidiNotes("A", [0, 3, 7, 10], "D");
  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(actual, null, 2));
  expect(actual).toStrictEqual([38, 57, 60, 64, 67]);
});
