import ChordSheetJS, { Song } from "chordsheetjs";

import {
  COMMENT,
  END_OF_TAB,
  NONE,
  START_OF_TAB,
  TAB,
} from "../lib/ChordSheetConstants";
import { getChordSymbol } from "./getChordSymbol";
import { trimMultiple } from "./trimMultiple";
import { unescapeUTF8 } from "./unescapeUTF8";

type ParagraphType = "verse" | "chorus" | "none" | "indeterminate" | "tab";

const startSectionTags: Record<string, string> = {
  [TAB]: START_OF_TAB,
};

const endSectionTags: Record<string, string> = {
  [TAB]: END_OF_TAB,
};

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

// as long as it contains at least one [ch][/ch] tag, it's a chord line
const CHORD_LINE_REGEX = /\[ch\]([^[]+)\[\/ch\]/;

// Regex constants for parsing
const TAB_START_REGEX = /^\[tab\](.*?)$/i; // Matches the start of a tab section
const TAB_END_REGEX = /^(.*?)\[\/tab\]$/i; // Matches the end of a tab section

/**
 * Parses an Ultimate Guitar chord sheet with metadata
 * Note that ChordSheetParser is deprecated in the master branch, and we are asked to use ChordsOverWordsParser instead.
 * ChordsOverWordsParser aims to support any kind of chord, whereas ChordSheetParser lacks
 * support for many variations. Besides that, some chordpro feature have been ported back
 * to ChordsOverWordsParser, which adds some interesting functionality.
 */
export class CustomUltimateGuitarRawParser extends ChordSheetJS.ChordSheetParser {
  // this is used to find sections that end with a newline
  private currentSectionType: string | null = null;

  // this is used to check whether we are processing guitar tabs
  private waitEndOfGuitarTabs: boolean = false;

  // this is used to check whether we are processing tab sections
  private waitEndOfTabSection: boolean = false;

  // parse into groups by finding start and end tags
  private groups: string[][] = [];
  private currentGroup: string[] | null = null;

  /**
   * Instantiate a chord sheet parser
   * @param {Object} options options
   * @param {boolean} options.preserveWhitespace whether to preserve trailing whitespace for chords
   */
  constructor({ preserveWhitespace = true } = {}) {
    super({ preserveWhitespace });
  }

  /**
   * Parses a UltimateGuitar chord sheet into a song
   * @param {string} chordSheet The UltimateGuitar chord sheet
   * @param {Object} options Optional parser options
   * @param {Song} options.song The {@link Song} to store the song data in
   * @returns {Song} The parsed song
   */
  override parse(chordSheet: string, { song }: { song?: Song } = {}): Song {
    super.initialize(chordSheet, song);

    while (this.hasNextLine()) {
      const line = this.readLine();

      if (this.waitEndOfTabSection) {
        // Inside a tab section, look for its end marker.
        if (TAB_END_REGEX.test(line)) {
          // Found the end of a tab section.
          this.waitEndOfTabSection = false;

          const cleanedLine = line.match(TAB_END_REGEX)?.[1] ?? "";
          this.addToCurrentGroup(cleanedLine);
          this.endGroup();
        } else {
          // remember to add all lines to the group
          this.addToCurrentGroup(line);
        }
      }

      // check if this is a tab start
      else if (TAB_START_REGEX.test(line)) {
        // Found the start of a tab section.
        this.waitEndOfTabSection = true;

        this.startGroup();
        const cleanedLine = line.match(TAB_START_REGEX)?.[1] ?? "";
        this.addToCurrentGroup(cleanedLine);
      } else {
        // neither tab start or tab end, add to current group
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

    this.currentGroup?.push(line);
  }

  private startGroup() {
    if (this.currentGroup) {
      this.endGroup();
    }

    this.currentGroup = [];
    this.groups.push(this.currentGroup);
  }

  private endGroup() {
    this.currentGroup = null;
  }

  private processGroup(group: string[]) {
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

  override parseNonEmptyLine(line: string, nextLine?: string): boolean {
    let hasUsedNextLine = false;

    if (!this.songLine) throw new Error("Expected this.songLine to be present");

    this.chordLyricsPair = this.songLine.addChordLyricsPair();

    // we found a chord line
    if (CHORD_LINE_REGEX.test(line) && nextLine !== undefined) {
      // first line is a chord line

      // if nextLine also is a chord line, do not process as lyrics
      if (CHORD_LINE_REGEX.test(nextLine)) {
        // second line is also a chord line

        // first add the chords
        this.parseLyricsWithChordsRaw(line, "");

        // then make sure to add the second line of chords without any lyrics
        this.songLine = this.songBuilder.addLine();
        this.chordLyricsPair = this.songLine.addChordLyricsPair();
        this.parseLyricsWithChordsRaw(nextLine, "");

        hasUsedNextLine = true;

        // if nextLine look like a guitar tab line, do not process as lyrics
      } else if (
        GUITAR_TAB_LINE_REGEX.test(nextLine) &&
        !this.waitEndOfGuitarTabs
      ) {
        // second line is a first guitar line
        this.waitEndOfGuitarTabs = true;

        // first add the chords
        this.parseLyricsWithChordsRaw(line, "");

        // then start a guitar tab section
        this.startSection(TAB);

        // and add the guitar tab line as lyrics
        this.songLine = this.songBuilder.addLine();
        this.chordLyricsPair = this.songLine.addChordLyricsPair();
        this.parseLyricsRaw(nextLine);

        hasUsedNextLine = true;

        // nextLine is likely lyrics
      } else {
        // second line is likely lyrics - adding chord lyrics line

        // add a normal chord and lyrics line
        this.parseLyricsWithChordsRaw(line, nextLine);

        hasUsedNextLine = true;
      }

      // lines that do not contain chords
    } else {
      // if the line look like the first guitar tab line, do not process as lyrics
      if (GUITAR_TAB_LINE_REGEX.test(line) && !this.waitEndOfGuitarTabs) {
        // this is a first guitar line
        this.waitEndOfGuitarTabs = true;

        // start a guitar tab section
        this.startSection(TAB);

        // and add the guitar tab line as lyrics
        this.songLine = this.songBuilder.addLine();
        this.chordLyricsPair = this.songLine.addChordLyricsPair();
        this.parseLyricsRaw(line);

        // if the line look like the last guitar tab line, do not process as lyrics
      } else if (GUITAR_TAB_LINE_REGEX.test(line) && this.waitEndOfGuitarTabs) {
        // this is a last guitar line
        this.waitEndOfGuitarTabs = false;

        this.parseLyricsRaw(line);
        this.startNewLine();
        this.endSection({ addNewLine: false });

        // we check for a chord line with a second line above, but if it's the very last line, we process it here
      } else if (CHORD_LINE_REGEX.test(line)) {
        // this is a chord line as the last line in group

        // add the chords
        this.parseLyricsWithChordsRaw(line, "");

        //if the line is not a guitar tab line it's probably just a text line
      } else {
        // this is a normal text line

        // add a normal lyrics line
        this.parseLyricsRaw(line);
      }
    }

    return hasUsedNextLine;
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

  // remove all characters from a chord line except the chords themselves
  private cleanupChordLine = (line: string) => {
    // https://matthaliski.com/blog/regex-match-for-spaces-outside-of-html-tags

    let cleanedLine = line;
    cleanedLine = cleanedLine.replace(/[^\]](?![^[]*\]|[^[\]]*\[\/)/g, " ");

    return cleanedLine;
  };

  // remove tab and chord tags
  private cleanupTabAndChordTags = (line: string) => {
    let cleanedLine = line;

    cleanedLine = cleanedLine.replace(/\[\/?tab\]/g, "");
    cleanedLine = cleanedLine.replace(/\[\/?ch\]/g, "");

    // trim the end
    cleanedLine = cleanedLine.trimEnd();

    // and unescape UTF8 strings like %27
    cleanedLine = unescapeUTF8(cleanedLine);

    return cleanedLine;
  };

  private parseLyricsRaw = (rawLyricsLine: string) => {
    if (!this.chordLyricsPair)
      throw new Error("Expected this.chordLyricsPair to be present");

    let lyricsLine = rawLyricsLine;

    // remove tags and trim end
    lyricsLine = this.cleanupTabAndChordTags(lyricsLine);

    this.chordLyricsPair.lyrics = `${lyricsLine}`;
  };

  private parseLyricsWithChordsRaw(
    rawChordsLine: string,
    rawLyricsLine: string
  ) {
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

  override parseLyricsWithChords(chordsLine: string, lyricsLine: string) {
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
      this.songLine = this.songBuilder.addLine();
    }
  }
}
