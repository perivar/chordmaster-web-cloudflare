import ChordSheetJS from "chordsheetjs";

import { CustomUltimateGuitarFormatter } from "../CustomUltimateGuitarFormatter";
import { CustomUltimateGuitarRawParser } from "../CustomUltimateGuitarRawParser";
import {
  chordTestUGChordPro,
  chordTestUGChordsPlan,
  chordTestUGChordsRaw,
  chordTestUGPlain,
  chordTestUGRaw,
} from "./testContent";
import { writeSongAsJson, writeSongAsText } from "./testMethods";

// set this to true to debug the outputs to file
const DO_DEBUG_FILE = false;

const parseUltimateGuitarRaw = (rawContent: string) => {
  const song = new CustomUltimateGuitarRawParser({
    preserveWhitespace: false,
  }).parse(rawContent);

  writeSongAsJson(song, DO_DEBUG_FILE);

  const chordPro = new ChordSheetJS.ChordProFormatter({
    normalizeChords: false,
  }).format(song);

  writeSongAsText(chordPro, DO_DEBUG_FILE);

  return chordPro;
};

const parseUltimateGuitarRawAndFormat = (rawContent: string) => {
  const song = new CustomUltimateGuitarRawParser({
    preserveWhitespace: false,
  }).parse(rawContent);

  writeSongAsJson(song, DO_DEBUG_FILE);

  // use custom ultimate guitar formatter instead of the plaintext formatter
  const plainText = new CustomUltimateGuitarFormatter().format(song);

  writeSongAsText(plainText, DO_DEBUG_FILE);

  return plainText;
};

test("ParseUltimateGuitarRaw", () => {
  expect(parseUltimateGuitarRaw(chordTestUGRaw)).toBe(chordTestUGChordPro);
});

test("ParseUltimateGuitarRawAndFormat", () => {
  expect(parseUltimateGuitarRawAndFormat(chordTestUGRaw)).toBe(
    chordTestUGPlain
  );
});

test("ParseUltimateGuitarRawChords", () => {
  expect(parseUltimateGuitarRawAndFormat(chordTestUGChordsRaw)).toBe(
    chordTestUGChordsPlan
  );
});
