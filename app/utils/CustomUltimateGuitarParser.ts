import ChordSheetJS, { ChordLyricsPair, Line, Song } from "chordsheetjs";

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
} from "./ChordSheetConstants";

type ParagraphType = "verse" | "chorus" | "none" | "indeterminate" | "tab";

// for good example using several regex'es see
// https://github.com/martijnversluis/ChordSheetJS/blob/check-chord-parsing/src/chord.ts

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

// see https://github.com/martijnversluis/ChordSheetJS/blob/master/src/parser/chord_sheet_parser.ts
const WHITE_SPACE = /\s/;

// https://gist.github.com/hyvyys/a8601e11af1ba145595f82896393d6f1
const CHORD_LINE_REGEX =
  /^\s*([A-H][b#]?(?:(?:5|dim(5|7)?|aug5?|\+5?|-5?)|(?:(?:mi?n?)?(?:(?:2|4|6|7|9|11|13|6\/9)|(?:maj?|Ma?j?)?(?:6|7|9|11|13))?)(?:\\((?:[b-](5|6|9|13)|[#+](4|5|9|11))\\)|(?:[b-](5|6|9|13)|[#+](4|5|9|11)))*(?:sus(2|4|24|2sus4)?)?(?:\\((?:[b-](5|6|9|13)|[#+](4|5|9|11))\\)|(?:[b-](5|6|9|13)|[#+](4|5|9|11)))*(?:add[b#]?(?:2|4|6|7|9|11|13))?)(?:\/[A-H][b#]?)?(?=$| )(\s|$)+)+(\s|$)+/gi;

/**
 * Parses an Ultimate Guitar chord sheet with metadata
 * Note that ChordSheetParser is deprecated in the master branch, and we are asked to use ChordsOverWordsParser instead.
 * ChordsOverWordsParser aims to support any kind of chord, whereas ChordSheetParser lacks
 * support for many variations. Besides that, some chordpro feature have been ported back
 * to ChordsOverWordsParser, which adds some interesting functionality.
 */
class CustomUltimateGuitarParser {
  // this is used to find sections that end with a newline
  currentSectionType: string | null = null;

  // this is used to check whether we are processing tabs
  waitEndOfGuitarTabs: boolean = false;

  song: Song = new ChordSheetJS.Song();
  lines: string[] = [];
  songLine: Line | null = null;
  chordLyricsPair: ChordLyricsPair | null = null;
  currentLine = 0;
  lineCount = 0;
  processingText = true;
  preserveWhitespace = true;

  /**
   * all of the following is a copy of
   * https://github.com/martijnversluis/ChordSheetJS/blob/master/src/parser/ultimate_guitar_parser.ts
   * except that we check for titles in the Verse and Chorus sections
   * and support Tab sections
   */

  parseUltimateGuitarLine(line: string) {
    // if (this.isSectionEnd()) {
    //   this.endSection();
    // }

    // if (this.isStartOfVerseHeader(line)) {
    //   this.startNewLine();
    //   const verse = line.match(VERSE_HEADER_REGEX)?.[1];
    //   // console.log('Found verse:', verse);
    //   this.startSection(VERSE, verse);
    // } else if (this.isStartOfChorusHeader(line)) {
    //   this.startNewLine();
    //   const chorus = line.match(CHORUS_HEADER_REGEX)?.[1];
    //   // console.log('Found chorus:', chorus);
    //   this.startSection(CHORUS, chorus);
    // } else
    if (HEADER_BRACKETS_REGEX.test(line)) {
      this.parseHeaderLine(line, HEADER_BRACKETS_REGEX);
    } else {
      this.songLine = this.song.addLine();

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

  isSectionEnd(): boolean {
    return (
      this.songLine !== null &&
      this.songLine.isEmpty() &&
      this.song.previousLine !== null &&
      !this.song.previousLine.isEmpty()
    );
  }

  endOfSong() {
    if (
      this.currentSectionType !== null &&
      this.currentSectionType in endSectionTags
    ) {
      this.startNewLine();
    }
    this.endSection({ addNewLine: false });
  }

  startSection(sectionType: ParagraphType, sectionValue?: string) {
    if (this.currentSectionType) {
      this.endSection();
    }

    this.currentSectionType = sectionType;
    this.song.setCurrentProperties(sectionType);

    if (sectionType in startSectionTags) {
      this.song.addTag(
        new ChordSheetJS.Tag(startSectionTags[sectionType], sectionValue)
      );
    }
  }

  endSection({ addNewLine = true } = {}) {
    if (
      this.currentSectionType !== null &&
      this.currentSectionType in endSectionTags
    ) {
      this.song.addTag(
        new ChordSheetJS.Tag(endSectionTags[this.currentSectionType])
      );

      if (addNewLine) {
        this.startNewLine();
      }
    }

    this.song.setCurrentProperties(NONE);
    this.currentSectionType = null;
  }

  startNewLine() {
    this.songLine = this.song.addLine();
  }

  /**
   * all of the following is a copy of
   * https://github.com/martijnversluis/ChordSheetJS/blob/master/src/parser/chord_sheet_parser.ts
   * except that we check for tabs in the parse method
   */

  /**
   * Instantiate a chord sheet parser
   * @param {Object} options options
   * @param {boolean} options.preserveWhitespace whether to preserve trailing whitespace for chords
   */
  constructor({ preserveWhitespace = true } = {}) {
    this.preserveWhitespace = preserveWhitespace === true;
  }

  /**
   * Parses a chord sheet into a song
   * @param {string} chordSheet The ChordPro chord sheet
   * @param {Object} options Optional parser options
   * @param {Song} options.song The {@link Song} to store the song data in
   * @returns {Song} The parsed song
   */
  parse(chordSheet: string, { song }: { song?: Song } = {}): Song {
    this.initialize(chordSheet, song);

    while (this.hasNextLine()) {
      const line = this.readLine();
      this.parseUltimateGuitarLine(line);
    }

    this.endOfSong();
    return this.song;
  }

  parseNonEmptyLine(line: string) {
    // console.log(`${line}`);

    if (!this.songLine) throw new Error("Expected this.songLine to be present");

    this.chordLyricsPair = this.songLine.addChordLyricsPair();

    // if the line look like the first guitar tab line, do not process as lyrics
    if (GUITAR_TAB_LINE_REGEX.test(line) && !this.waitEndOfGuitarTabs) {
      // console.log('^ This is a first guitar line!');
      this.waitEndOfGuitarTabs = true;

      // start a guitar tab section
      this.startSection(TAB);

      // and add the guitar tab line as lyrics
      this.songLine = this.song.addLine();
      this.chordLyricsPair = this.songLine.addChordLyricsPair();
      this.parseLyricsRaw(line);

      // if the line look like the last guitar tab line, do not process as lyrics
    } else if (GUITAR_TAB_LINE_REGEX.test(line) && this.waitEndOfGuitarTabs) {
      // console.log('^ This is a last guitar line!');
      this.waitEndOfGuitarTabs = false;

      this.parseLyricsRaw(line);
      this.startNewLine();
      this.endSection({ addNewLine: false });

      // check for chord line
    } else if (CHORD_LINE_REGEX.test(line) && this.hasNextLine()) {
      // console.log('^ This is a chord line and there is another line');

      const nextLine = this.readLine();

      // if nextLine also is a chord line, do not process as lyrics
      if (CHORD_LINE_REGEX.test(nextLine)) {
        // console.log(`${nextLine}`);
        // console.log('^ Second line is also a chord line!');

        // first add the chords
        this.parseLyricsWithChordsRaw(line, "");

        // then make sure to add the second line of chords without any lyrics
        this.songLine = this.song.addLine();
        this.chordLyricsPair = this.songLine.addChordLyricsPair();
        this.parseLyricsWithChordsRaw(nextLine, "");

        // if nextLine look like a guitar tab line, do not process as lyrics
      } else if (
        GUITAR_TAB_LINE_REGEX.test(nextLine) &&
        !this.waitEndOfGuitarTabs
      ) {
        // console.log(`${nextLine}`);
        // console.log('^ Second line is a first guitar line!');
        this.waitEndOfGuitarTabs = true;

        // first add the chords
        this.parseLyricsWithChordsRaw(line, "");

        // then start a guitar tab section
        this.startSection(TAB);

        // and add the guitar tab line as lyrics
        this.songLine = this.song.addLine();
        this.chordLyricsPair = this.songLine.addChordLyricsPair();
        this.parseLyricsRaw(nextLine);

        // nextLine is likely lyrics
      } else {
        // console.log(`${nextLine}`);
        // console.log(
        //   '^ Second line is likely lyrics - adding chord lyrics line!'
        // );

        // add a normal chord and lyrics line
        this.parseLyricsWithChordsRaw(line, nextLine);
      }

      // lines that do not contain chords
    } else {
      // we check for a chord line with a second line above, but if it's the very last line, we process it here
      if (CHORD_LINE_REGEX.test(line)) {
        // console.log('^ This is a chord line as the last line!');

        // add the chords
        this.parseLyricsWithChordsRaw(line, "");

        //if the line is not a guitar tab line it's probably just a text line
      } else {
        // console.log('^ This is a normal text line!');

        // add a normal lyrics line
        this.parseLyricsRaw(line);
      }
    }
  }

  initialize(document: string, song: Song | null = null) {
    if (song) {
      this.song = song;
    }

    this.lines = this.normalizeLineEndings(document).split("\n");
    this.currentLine = 0;
    this.lineCount = this.lines.length;
    this.processingText = true;
  }

  readLine() {
    const line = this.lines[this.currentLine];
    this.currentLine += 1;
    return line;
  }

  hasNextLine() {
    return this.currentLine < this.lineCount;
  }

  parseLyricsRaw = (rawLyricsLine: string) => {
    if (!this.chordLyricsPair)
      throw new Error("Expected this.chordLyricsPair to be present");

    let lyricsLine = rawLyricsLine;

    // remove tags and trim end
    lyricsLine = lyricsLine.trimEnd();

    this.chordLyricsPair.lyrics = `${lyricsLine}`;
  };

  parseLyricsWithChordsRaw(rawChordsLine: string, rawLyricsLine: string) {
    let chordsLine = rawChordsLine;

    // remove tags and trim end
    chordsLine = chordsLine.trimEnd();

    let lyricsLine = rawLyricsLine;

    // remove tags and trim end
    lyricsLine = lyricsLine.trimEnd();

    this.parseLyricsWithChords(chordsLine, lyricsLine);
  }

  parseLyricsWithChords(chordsLine: string, lyricsLine: string) {
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
      this.songLine = this.song.addLine();
    }
  }

  processCharacters(chordsLine: string, lyricsLine: string) {
    for (let c = 0, charCount = chordsLine.length; c < charCount; c += 1) {
      const chr = chordsLine[c];
      const nextChar = chordsLine[c + 1];
      const isWhiteSpace = WHITE_SPACE.test(chr);
      this.addCharacter(chr, nextChar);

      if (!this.chordLyricsPair)
        throw new Error("Expected this.chordLyricsPair to be present");

      this.chordLyricsPair.lyrics += lyricsLine[c] || "";
      this.processingText = !isWhiteSpace;
    }
  }

  addCharacter(chr: string, nextChar: string) {
    const isWhiteSpace = WHITE_SPACE.test(chr);

    if (!isWhiteSpace) {
      this.ensureChordLyricsPairInitialized();
    }

    if (!isWhiteSpace || this.shouldAddCharacterToChords(nextChar)) {
      if (!this.chordLyricsPair)
        throw new Error("Expected this.chordLyricsPair to be present");
      this.chordLyricsPair.chords += chr;
    }
  }

  shouldAddCharacterToChords(nextChar: string) {
    return nextChar && WHITE_SPACE.test(nextChar) && this.preserveWhitespace;
  }

  ensureChordLyricsPairInitialized() {
    if (!this.processingText) {
      if (!this.songLine)
        throw new Error("Expected this.songLine to be present");
      this.chordLyricsPair = this.songLine.addChordLyricsPair();
      this.processingText = true;
    }
  }

  normalizeLineEndings(string: string): string {
    return string.replace(/\r\n?/g, "\n");
  }
}

export default CustomUltimateGuitarParser;
