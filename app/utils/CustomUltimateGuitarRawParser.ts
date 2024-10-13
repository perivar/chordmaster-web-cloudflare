import ChordSheetJS, { ChordLyricsPair, Line, Song } from "chordsheetjs";

import {
  COMMENT,
  END_OF_TAB,
  NONE,
  START_OF_TAB,
  TAB,
} from "./ChordSheetConstants";
import { getChordSymbol } from "./getChordSymbol";
import { trimMultiple } from "./trimMultiple";

type ParagraphType = "verse" | "chorus" | "none" | "indeterminate" | "tab";

const startSectionTags: Record<string, string> = {
  [TAB]: START_OF_TAB,
};

const endSectionTags: Record<string, string> = {
  [TAB]: END_OF_TAB,
};

// for good example using several regex'es see
// https://github.com/martijnversluis/ChordSheetJS/blob/check-chord-parsing/src/chord.ts

// see https://github.com/martijnversluis/ChordSheetJS/blob/master/src/parser/ultimate_guitar_parser.ts
// if adding a ^ at the start we only care about headers that start on a newline instead of in the middle of a sentence?
// adding \s*$ at the end we only care about metadata without any suffix
const HEADER_BRACKETS_REGEX = /^(?!\[\/?(?:tab|ch)\])\[([^\]]+)\]/i;
const HEADER_COLON_REGEX = /^\s*([\w]+):\s*$/i;
const HEADER_PARANT_REGEX =
  /^\s*\(((?:intro|verse|chorus|bridge|outro)[\w\s]+)\)\s*$/i;

// match first and last line of tabs
// originally when matching several lines we could not use global flags since multiple test on the same regex is broken
// https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
const GUITAR_TAB_LINE_REGEX = /^(?:\|?e(?:\s|\|)?-[^\n\r]+)$/i;

// see https://github.com/martijnversluis/ChordSheetJS/blob/master/src/parser/chord_sheet_parser.ts
const WHITE_SPACE = /\s/;

// as long as it contains at least one [ch][/ch] tag, it's a chord line
const CHORD_LINE_REGEX = /\[ch\]([^[]+)\[\/ch\]/;

/**
 * Parses an Ultimate Guitar chord sheet with metadata
 * Note that ChordSheetParser is deprecated in the master branch, and we are asked to use ChordsOverWordsParser instead.
 * ChordsOverWordsParser aims to support any kind of chord, whereas ChordSheetParser lacks
 * support for many variations. Besides that, some chordpro feature have been ported back
 * to ChordsOverWordsParser, which adds some interesting functionality.
 */
class CustomUltimateGuitarRawParser {
  // this is used to find sections that end with a newline
  currentSectionType: string | null = null;

  // this is used to check whether we are processing guitar tabs
  waitEndOfGuitarTabs: boolean = false;

  // this is used to check whether we are processing tab sections
  waitEndOfTabSection: boolean = false;

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

  groups: string[][] = [];
  currentGroup: string[] | null = null;

  /**
   * Parses a UltimateGuitar chord sheet into a song
   * @param {string} chordSheet The UltimateGuitar chord sheet
   * @param {Object} options Optional parser options
   * @param {Song} options.song The {@link Song} to store the song data in
   * @returns {Song} The parsed song
   */
  parse(chordSheet: string, { song }: { song?: Song } = {}): Song {
    this.initialize(chordSheet, song);

    while (this.hasNextLine()) {
      const line = this.readLine();

      if (this.waitEndOfTabSection) {
        if (/^(.*?)\[\/tab\]$/i.test(line)) {
          // console.log('found tab  end:', line);
          this.waitEndOfTabSection = false;

          const cleanedLine = line.match(/^(.*?)\[\/tab\]$/i)?.[1] ?? "";
          this.addToCurrentGroup(cleanedLine);

          this.endGroup();

          // remember to add all lines to the group
        } else {
          this.addToCurrentGroup(line);
        }
      }

      // check if this is a tab start
      else if (/^\[tab\](.*?)$/i.test(line)) {
        // console.log('found tab  start:', line);
        this.waitEndOfTabSection = true;

        this.startGroup();
        const cleanedLine = line.match(/^\[tab\](.*?)$/i)?.[1] ?? "";
        this.addToCurrentGroup(cleanedLine);

        // neither tab start or tab end, add to current group
      } else {
        this.addToCurrentGroup(line);
      }
    }

    // now process all the groups
    this.groups.forEach(group => {
      this.processGroup(group);
    });

    this.endOfSong();

    // now replace all chords with correct chords
    this.song.lines.forEach(line => {
      line.items.forEach(item => {
        if (item instanceof ChordSheetJS.ChordLyricsPair) {
          if (item.chords) item.chords = getChordSymbol(item.chords);
        }
      });
    });

    return this.song;
  }

  private addToCurrentGroup(line: string) {
    if (!this.currentGroup) {
      this.startGroup();
    }
    // console.log('adding to current group: ', line);
    if (this.currentGroup) this.currentGroup.push(line);
  }

  private startGroup() {
    if (this.currentGroup) {
      this.endGroup();
    }

    // console.log('starting new group ...');
    this.currentGroup = [];
    this.groups.push(this.currentGroup);
  }

  private endGroup() {
    // console.log('ending group ...');
    this.currentGroup = null;
  }

  private processGroup(group: string[]) {
    // console.log(group);

    for (let i = 0; i < group.length; i++) {
      const line = group[i];
      const nextLine = group[i + 1];

      if (HEADER_BRACKETS_REGEX.test(line)) {
        this.parseHeaderLine(line, HEADER_BRACKETS_REGEX);
      } else if (HEADER_COLON_REGEX.test(line)) {
        this.parseHeaderLine(line, HEADER_COLON_REGEX);
      } else if (HEADER_PARANT_REGEX.test(line)) {
        this.parseHeaderLine(line, HEADER_PARANT_REGEX);
      } else {
        this.startNewLine();

        if (line.trim().length === 0) {
          this.chordLyricsPair = null;
        } else {
          const hasUsedNextLine = this.parseNonEmptyLine(line, nextLine);
          if (hasUsedNextLine) i++;
        }
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

  parseNonEmptyLine(line: string, nextLine: string | undefined) {
    // console.log(`${line}`);

    let hasUsedNextLine = false;

    if (!this.songLine) throw new Error("Expected this.songLine to be present");

    this.chordLyricsPair = this.songLine.addChordLyricsPair();

    // we found a chord line
    if (CHORD_LINE_REGEX.test(line) && nextLine !== undefined) {
      // console.log('^ First line is a chord line!');

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

        hasUsedNextLine = true;

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

        hasUsedNextLine = true;

        // nextLine is likely lyrics
      } else {
        // console.log(`${nextLine}`);
        // console.log(
        //   '^ Second line is likely lyrics - adding chord lyrics line!'
        // );

        // add a normal chord and lyrics line
        this.parseLyricsWithChordsRaw(line, nextLine);

        hasUsedNextLine = true;
      }

      // lines that do not contain chords
    } else {
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

        // we check for a chord line with a second line above, but if it's the very last line, we process it here
      } else if (CHORD_LINE_REGEX.test(line)) {
        // console.log('^ This is a chord line as the last line in group!');

        // add the chords
        this.parseLyricsWithChordsRaw(line, "");

        //if the line is not a guitar tab line it's probably just a text line
      } else {
        // console.log('^ This is a normal text line!');

        // add a normal lyrics line
        this.parseLyricsRaw(line);
      }
    }

    return hasUsedNextLine;
  }

  // remove all characters from a chord line except the chords themselves
  cleanupChordLine = (line: string) => {
    // https://matthaliski.com/blog/regex-match-for-spaces-outside-of-html-tags

    let cleanedLine = line;
    cleanedLine = cleanedLine.replace(/[^\]](?![^[]*\]|[^[\]]*\[\/)/g, " ");

    return cleanedLine;
  };

  // remove tab and chord tags
  cleanupTabAndChordTags = (line: string) => {
    let cleanedLine = line;

    cleanedLine = cleanedLine.replace(/\[\/?tab\]/g, "");
    cleanedLine = cleanedLine.replace(/\[\/?ch\]/g, "");

    // trim the end
    cleanedLine = cleanedLine.trimEnd();

    // and unescape UTF8 strings like %27
    cleanedLine = this.unescapeUTF8(cleanedLine);

    return cleanedLine;
  };

  unescapeUTF8 = (str: string) => {
    return str.replace(/%([0-9]{2})/g, (match, numStr) => {
      const num = parseInt(numStr, 16); // read num as normal number
      return String.fromCharCode(num);
    });
  };

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
    lyricsLine = this.cleanupTabAndChordTags(lyricsLine);

    this.chordLyricsPair.lyrics = `${lyricsLine}`;
  };

  parseLyricsWithChordsRaw(rawChordsLine: string, rawLyricsLine: string) {
    let chordsLine = rawChordsLine;

    // remove everything except the chords themselves
    chordsLine = this.cleanupChordLine(chordsLine);

    // remove tags and trim end
    chordsLine = this.cleanupTabAndChordTags(chordsLine);

    let lyricsLine = rawLyricsLine;

    // remove tags and trim end
    lyricsLine = this.cleanupTabAndChordTags(lyricsLine);

    this.parseLyricsWithChords(chordsLine, lyricsLine);
  }

  parseLyricsWithChords(chordsLine: string, lyricsLine: string) {
    this.processCharacters(chordsLine, lyricsLine);

    if (!this.chordLyricsPair)
      throw new Error("Expected this.chordLyricsPair to be present");

    this.chordLyricsPair.lyrics += lyricsLine.substring(chordsLine.length);
    this.chordLyricsPair.chords = this.chordLyricsPair.chords.trim();

    if (this.chordLyricsPair.lyrics) {
      // trimming does not seem to work for lyrics that have chords between words?!
      // this.chordLyricsPair.lyrics = this.chordLyricsPair.lyrics.trim();
      this.chordLyricsPair.lyrics = trimMultiple(this.chordLyricsPair.lyrics);
    }

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
    // const isNonChordCharacter = /[?|()*,]/.test(chr); // do not add question mark, pipe etc to chords

    if (!isWhiteSpace) {
      this.ensureChordLyricsPairInitialized();
    }

    if (
      // do not need this if we are removing everything except the chords within ch tags:
      // !isNonChordCharacter && // remember to have the two next or'ed arguments in parenthesis
      !isWhiteSpace ||
      this.shouldAddCharacterToChords(nextChar)
    ) {
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

export default CustomUltimateGuitarRawParser;
