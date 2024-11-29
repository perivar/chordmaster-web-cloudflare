import ChordSheetJS from "chordsheetjs";

import {
  CHORUS,
  COMMENT,
  END_OF_CHORUS,
  END_OF_TAB,
  END_OF_VERSE,
  NONE,
  START_OF_CHORUS,
  START_OF_TAB,
  START_OF_VERSE,
  TAB,
  VERSE,
} from "../lib/ChordSheetConstants";
import { getChordLineRegex } from "./getChordRegex";

type ParagraphType = "verse" | "chorus" | "none" | "indeterminate" | "tab";

// see https://github.com/martijnversluis/ChordSheetJS/blob/master/src/parser/ultimate_guitar_parser.ts
// const VERSE_HEADER_REGEX = /^\[Verse(.*?)\]/i;
// const CHORUS_HEADER_REGEX = /^\[Chorus(.*?)\]/i;
const HEADER_BRACKETS_REGEX = /^\[([^\]]+)\]/i;

// match first and last line of tabs
// originally when matching several lines we could not use global flags since multiple test on the same regex is broken
// https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
const GUITAR_TAB_LINE_REGEX = /^(?:\|?e(?:\s|\|)?-[^\n\r]+)$/i;

const startSectionTags: Record<string, string> = {
  [VERSE]: START_OF_VERSE,
  [CHORUS]: START_OF_CHORUS,
  [TAB]: START_OF_TAB,
};

const endSectionTags: Record<string, string> = {
  [VERSE]: END_OF_VERSE,
  [CHORUS]: END_OF_CHORUS,
  [TAB]: END_OF_TAB,
};

// const CHORD_LINE_REGEX =
//   /^\s*([A-H][b#]?(?:(?:5|dim(5|7)?|aug5?|\+5?|-5?)|(?:(?:mi?n?)?(?:(?:2|4|6|7|9|11|13|6\/9)|(?:maj?|Ma?j?)?(?:6|7|9|11|13))?)(?:\\((?:[b-](5|6|9|13)|[#+](4|5|9|11))\\)|(?:[b-](5|6|9|13)|[#+](4|5|9|11)))*(?:sus(2|4|24|2sus4)?)?(?:\\((?:[b-](5|6|9|13)|[#+](4|5|9|11))\\)|(?:[b-](5|6|9|13)|[#+](4|5|9|11)))*(?:add[b#]?(?:2|4|6|7|9|11|13))?)(?:\/[A-H][b#]?)?(?=$| )(\s|$)+)+(\s|$)+/gi;
const CHORD_LINE_REGEX = getChordLineRegex("gi");

/**
 * Parses an Ultimate Guitar chord sheet with metadata
 * Note that ChordSheetParser is deprecated in the master branch, and we are asked to use ChordsOverWordsParser instead.
 * ChordsOverWordsParser aims to support any kind of chord, whereas ChordSheetParser lacks
 * support for many variations. Besides that, some chordpro feature have been ported back
 * to ChordsOverWordsParser, which adds some interesting functionality.
 */
export class CustomUltimateGuitarParser extends ChordSheetJS.ChordSheetParser {
  // this is used to find sections that end with a newline
  private currentSectionType: string | null = null;

  // this is used to check whether we are processing tabs
  private waitEndOfGuitarTabs = false;

  /**
   * Instantiate a chord sheet parser
   * @param {Object} [options={}] options
   * @param {boolean} [options.preserveWhitespace=true] whether to preserve trailing whitespace for chords
   */
  constructor({
    preserveWhitespace = true,
  }: { preserveWhitespace?: boolean } = {}) {
    super({ preserveWhitespace }, false);
  }

  override parseLine(line: string) {
    if (HEADER_BRACKETS_REGEX.test(line)) {
      this.parseHeaderLine(line, HEADER_BRACKETS_REGEX);
    } else {
      this.songLine = this.songBuilder.addLine();

      if (line.trim().length === 0) {
        this.chordLyricsPair = null;
      } else {
        this.parseNonEmptyLine(line);
      }
    }
  }

  private parseHeaderLine(line: string, REGEX: RegExp) {
    this.startNewLine();
    this.endSection();
    const comment = line.match(REGEX)?.[1];

    if (!this.songLine) throw new Error("Expected this.songLine to be present");

    this.songLine.addTag(new ChordSheetJS.Tag(COMMENT, comment));
  }

  override parseNonEmptyLine(line: string) {
    if (!this.songLine) throw new Error("Expected this.songLine to be present");

    this.chordLyricsPair = this.songLine.addChordLyricsPair();

    // if the line look like the first guitar tab line, do not process as lyrics
    if (GUITAR_TAB_LINE_REGEX.test(line) && !this.waitEndOfGuitarTabs) {
      this.waitEndOfGuitarTabs = true;

      // start a guitar tab section
      this.startSection(TAB);

      // and add the guitar tab line as lyrics
      this.songLine = this.songBuilder.addLine();
      this.chordLyricsPair = this.songLine.addChordLyricsPair();
      this.parseLyricsRaw(line);

      // if the line look like the last guitar tab line, do not process as lyrics
    } else if (GUITAR_TAB_LINE_REGEX.test(line) && this.waitEndOfGuitarTabs) {
      this.waitEndOfGuitarTabs = false;

      this.parseLyricsRaw(line);
      this.startNewLine();
      this.endSection({ addNewLine: false });

      // check for chord line
    } else if (CHORD_LINE_REGEX.test(line) && this.hasNextLine()) {
      const nextLine = this.readLine();

      // if nextLine also is a chord line, do not process as lyrics
      if (CHORD_LINE_REGEX.test(nextLine)) {
        // first add the chords
        this.parseLyricsWithChordsRaw(line, "");

        // then make sure to add the second line of chords without any lyrics
        this.songLine = this.songBuilder.addLine();
        this.chordLyricsPair = this.songLine.addChordLyricsPair();
        this.parseLyricsWithChordsRaw(nextLine, "");

        // if nextLine look like a guitar tab line, do not process as lyrics
      } else if (
        GUITAR_TAB_LINE_REGEX.test(nextLine) &&
        !this.waitEndOfGuitarTabs
      ) {
        this.waitEndOfGuitarTabs = true;

        // first add the chords
        this.parseLyricsWithChordsRaw(line, "");

        // then start a guitar tab section
        this.startSection(TAB);

        // and add the guitar tab line as lyrics
        this.songLine = this.songBuilder.addLine();
        this.chordLyricsPair = this.songLine.addChordLyricsPair();
        this.parseLyricsRaw(nextLine);

        // nextLine is likely lyrics
      } else {
        // add a normal chord and lyrics line
        this.parseLyricsWithChordsRaw(line, nextLine);
      }

      // lines that do not contain chords
    } else {
      // we check for a chord line with a second line above, but if it's the very last line, we process it here
      if (CHORD_LINE_REGEX.test(line)) {
        // add the chords
        this.parseLyricsWithChordsRaw(line, "");

        //if the line is not a guitar tab line it's probably just a text line
      } else {
        // add a normal lyrics line
        this.parseLyricsRaw(line);
      }
    }
  }

  private startSection(sectionType: ParagraphType, sectionValue?: string) {
    if (this.currentSectionType) {
      this.endSection();
    }

    this.currentSectionType = sectionType;
    this.songBuilder.setCurrentProperties(sectionType);

    if (sectionType in startSectionTags) {
      this.songBuilder.addTag(
        new ChordSheetJS.Tag(startSectionTags[sectionType], sectionValue)
      );
    }
  }

  private endSection({ addNewLine = true } = {}) {
    if (
      this.currentSectionType !== null &&
      this.currentSectionType in endSectionTags
    ) {
      this.songBuilder.addTag(
        new ChordSheetJS.Tag(endSectionTags[this.currentSectionType])
      );

      if (addNewLine) {
        this.startNewLine();
      }
    }

    this.songBuilder.setCurrentProperties(NONE);
    this.currentSectionType = null;
  }

  private startNewLine() {
    this.songLine = this.songBuilder.addLine();
  }

  override endOfSong() {
    if (
      this.currentSectionType !== null &&
      this.currentSectionType in endSectionTags
    ) {
      this.startNewLine();
    }
    this.endSection({ addNewLine: false });
  }

  private parseLyricsRaw = (rawLyricsLine: string) => {
    if (!this.chordLyricsPair)
      throw new Error("Expected this.chordLyricsPair to be present");

    let lyricsLine = rawLyricsLine;

    // remove tags and trim end
    lyricsLine = lyricsLine.trimEnd();

    this.chordLyricsPair.lyrics = `${lyricsLine}`;
  };

  private parseLyricsWithChordsRaw(
    rawChordsLine: string,
    rawLyricsLine: string
  ) {
    let chordsLine = rawChordsLine;

    // remove tags and trim end
    chordsLine = chordsLine.trimEnd();

    let lyricsLine = rawLyricsLine;

    // remove tags and trim end
    lyricsLine = lyricsLine.trimEnd();

    this.parseLyricsWithChords(chordsLine, lyricsLine);
  }

  override parseLyricsWithChords(chordsLine: string, lyricsLine: string) {
    this.processCharacters(chordsLine, lyricsLine);

    if (!this.chordLyricsPair)
      throw new Error("Expected this.chordLyricsPair to be present");

    this.chordLyricsPair.lyrics += lyricsLine.substring(chordsLine.length);
    this.chordLyricsPair.chords = this.chordLyricsPair.chords.trim();

    // if (this.chordLyricsPair.lyrics) {
    // trimming does not seem to work for lyrics that have chords between words?!
    // this.chordLyricsPair.lyrics = this.chordLyricsPair.lyrics.trim();
    // this.chordLyricsPair.lyrics = trimMultiple(this.chordLyricsPair.lyrics);
    // }

    if (!lyricsLine.trim().length) {
      this.songLine = this.songBuilder.addLine();
    }
  }
}
