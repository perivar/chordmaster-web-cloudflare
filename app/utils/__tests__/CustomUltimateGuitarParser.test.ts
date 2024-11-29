import ChordSheetJS from "chordsheetjs";

import { CustomUltimateGuitarFormatter } from "../CustomUltimateGuitarFormatter";
import { CustomUltimateGuitarParser } from "../CustomUltimateGuitarParser";
import {
  chordTestChordPro2,
  chordTestChordPro3,
  chordTestPlain2,
  chordTestPlain3,
  chordTestPlain4,
  chordTestUGPlain,
} from "./testContent";
import { writeSongAsJson, writeSongAsText } from "./testMethods";

// set this to true to debug the outputs to file
const DO_DEBUG_FILE = false;

const parseUltimateGuitarAndFormat = (content: string) => {
  const song = new CustomUltimateGuitarParser({
    preserveWhitespace: false,
  }).parse(content);

  writeSongAsJson(song, DO_DEBUG_FILE);

  // original text formatter
  // const plainText = new ChordSheetJS.TextFormatter().format(song);

  // use custom ultimate guitar formatter instead of the plaintext formatter
  const plainText = new CustomUltimateGuitarFormatter().format(song);

  writeSongAsText(plainText, DO_DEBUG_FILE);

  return plainText;
};

const parseUltimateGuitarAndFormatChordPro = (content: string) => {
  const song = new CustomUltimateGuitarParser({
    preserveWhitespace: false,
  }).parse(content);

  writeSongAsJson(song, DO_DEBUG_FILE);

  const chordPro = new ChordSheetJS.ChordProFormatter().format(song);

  writeSongAsText(chordPro, DO_DEBUG_FILE);

  return chordPro;
};

const parseChordProAndFormat = (content: string) => {
  const song = new ChordSheetJS.ChordProParser().parse(content);

  writeSongAsJson(song, DO_DEBUG_FILE);

  // original text formatter
  // const plainText = new ChordSheetJS.TextFormatter().format(song);

  // use custom ultimate guitar formatter instead of the plaintext formatter
  const plainText = new CustomUltimateGuitarFormatter().format(song);

  writeSongAsText(plainText, DO_DEBUG_FILE);

  return plainText;
};

const parseChordPro = (content: string) => {
  const song = new ChordSheetJS.ChordProParser().parse(content);

  writeSongAsJson(song, DO_DEBUG_FILE);

  const chordPro = new ChordSheetJS.ChordProFormatter().format(song);

  writeSongAsText(chordPro, DO_DEBUG_FILE);

  return chordPro;
};

test("ParseUltimateGuitarAndFormat", () => {
  expect(parseUltimateGuitarAndFormat(chordTestUGPlain)).toBe(chordTestUGPlain);
});

test("ParseChordProAndFormat2", () => {
  expect(parseChordProAndFormat(chordTestChordPro2)).toBe(chordTestPlain2);
});

test("ParseChordPro2", () => {
  expect(parseChordPro(chordTestChordPro2)).toBe(chordTestChordPro2);
});

test("ParseUltimateGuitarAndFormat2", () => {
  expect(parseUltimateGuitarAndFormat(chordTestPlain2)).toBe(chordTestPlain2);
});

test("ParseUltimateGuitarAndFormatChordPro", () => {
  expect(parseUltimateGuitarAndFormatChordPro(chordTestPlain2)).toBe(
    chordTestChordPro2
  );
});

test("ParseChordPro3", () => {
  expect(parseChordPro(chordTestChordPro3)).toBe(chordTestChordPro3);
});

test("ParseChordProAndFormat3", () => {
  expect(parseChordProAndFormat(chordTestChordPro3)).toBe(chordTestPlain3);
});

test("ParseUltimateGuitarAndFormat3", () => {
  expect(parseUltimateGuitarAndFormat(chordTestPlain3)).toBe(chordTestPlain3);
});

test("ParseUltimateGuitarAndFormat4", () => {
  expect(parseUltimateGuitarAndFormat(chordTestPlain4)).toBe(chordTestPlain4);
});

// https://github.com/reverentgeek/charter/blob/main/tests/chordpro.test.js
test("parses a line with chords ahead of lyrics", () => {
  const res = parseChordProAndFormat(
    `
[Ab] I hold my [Eb]head a bit higher,  [Bb] I lift my [Cm]voice a bit louder`
  );
  const toBe = `
Ab           Eb                   Bb           Cm
   I hold my head a bit higher, ,    I lift my voice a bit louder`;
  expect(res).toBe(toBe);
});
