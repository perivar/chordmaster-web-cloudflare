import ChordSheetJS from "chordsheetjs";

import { parseUltimateGuitar } from "../../utils/scrapeUtils";
import { CustomUltimateGuitarRawParser } from "../CustomUltimateGuitarRawParser";
import {
  desperadoChordsChordPro,
  enStjerneSkinnerINattChordsChordPro,
} from "./testContent";
import { writeSongAsJson, writeSongAsText } from "./testMethods";

// set this to true to debug the outputs to file
const DO_DEBUG_FILE = false;

const fetchUltimateGuitarSongAndFormatChordPro = async (url: string) => {
  const header = {
    method: "GET",
    headers: {},
  };

  const fetchResult = await fetch(url, header);
  const htmlResult = await fetchResult.text();

  const { content } = parseUltimateGuitar(htmlResult);

  writeSongAsText(content!, DO_DEBUG_FILE, "debug/debugPreParsing.txt");

  const song = new CustomUltimateGuitarRawParser({
    preserveWhitespace: false,
  }).parse(content!);

  writeSongAsJson(song, DO_DEBUG_FILE);

  const chordPro = new ChordSheetJS.ChordProFormatter().format(song);

  writeSongAsText(chordPro, DO_DEBUG_FILE);

  return chordPro;
};

test("CustomUltimateGuitarFetchRaw", async () => {
  expect(
    await fetchUltimateGuitarSongAndFormatChordPro(
      "https://tabs.ultimate-guitar.com/tab/oslo-gospel-choir/en-stjerne-skinner-i-natt-chords-2256903"
    )
  ).toBe(enStjerneSkinnerINattChordsChordPro);
});

test("CustomUltimateGuitarFetchRaw2", async () => {
  expect(
    await fetchUltimateGuitarSongAndFormatChordPro(
      "https://tabs.ultimate-guitar.com/tab/eagles/desperado-chords-144838"
    )
  ).toBe(desperadoChordsChordPro);
});
