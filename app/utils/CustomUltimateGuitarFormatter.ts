import ChordSheetJS, {
  ChordLyricsPair,
  Comment,
  Line,
  Literal,
  Song,
  Tag,
  Ternary,
} from "chordsheetjs";

import {
  ARTIST,
  CAPO,
  COMMENT,
  END_OF_CHORUS,
  END_OF_TAB,
  END_OF_VERSE,
  START_OF_CHORUS,
  START_OF_TAB,
  START_OF_VERSE,
  SUBTITLE,
  TITLE,
} from "../lib/ChordSheetConstants";

// have to copy this from the chordsheetjs main.d.ts since it's not exported
type Item = ChordLyricsPair | Comment | Tag | Ternary | Literal;

export const hasChordContents = (line: Line) =>
  line.items.some(
    item => item instanceof ChordSheetJS.ChordLyricsPair && !!item.chords
  );

export const hasLyricsContents = (line: Line) =>
  line.items.some(
    item => item instanceof ChordSheetJS.ChordLyricsPair && !!item.lyrics
  );

export const hasRenderableItems = (line: Line) =>
  line.items.some(
    item =>
      (item instanceof ChordSheetJS.ChordLyricsPair && !!item.chords) ||
      (item instanceof ChordSheetJS.ChordLyricsPair && !!item.lyrics) ||
      (item instanceof ChordSheetJS.Tag && !!item.name)
  );

export const isEvaluatable = (item: Item): boolean =>
  "evaluate" in item && typeof item.evaluate === "function";

export const hasTextContents = (line: Line): boolean =>
  line.items.some(
    item =>
      (item instanceof ChordSheetJS.ChordLyricsPair &&
        !isEmptyString(item.lyrics)) ||
      (item instanceof ChordSheetJS.Tag && item.isRenderable()) ||
      isEvaluatable(item)
  );

export const isHeaderTag = (item: Item) => {
  return (
    item instanceof ChordSheetJS.Tag &&
    [TITLE, SUBTITLE, ARTIST].indexOf(item.name) !== -1
  );
};

export const padLeft = (string: string, length: number): string => {
  let paddedString = string;
  for (let l = string.length; l < length; l += 1, paddedString += " ");
  return paddedString;
};

export const isEmptyString = (string: string | null | undefined): boolean => {
  return string === null || string === undefined || string === "";
};

export const chordLyricsPairLength = (chordLyricsPair: ChordLyricsPair) => {
  const chords = chordLyricsPair.chords;
  const { lyrics } = chordLyricsPair;
  const chordsLength = (chords || "").length;
  const lyricsLength = (lyrics || "").length;

  if (chordsLength >= lyricsLength) {
    return chordsLength + 1;
  }

  return Math.max(chordsLength, lyricsLength);
};

const NEW_LINE = "\n";

/**
 * Formats a song into a ultimate song format
 * Ultimate Guitar uses a two line format,
 * with the chords above the lyrics and has metadata annotations
 * such as [Verse 1] and [Chorus] in square brackets.
 * @see https://www.ultimate-guitar.com/contribution/help/rubric#iii
 */
export class CustomUltimateGuitarFormatter {
  /**
   * Formats a song into a ultimate song format
   * @param {Song} song The song to be formatted
   * @returns {string} The contents as string
   */
  format(song: Song): string {
    // cannot use the song paragraphs since they don't include all the
    // comments and tags
    // therefore use the lines instead
    return this.formatLines(song);
  }

  formatHeaderTags(song: Song): string {
    const { title, subtitle, artist } = song;
    return `{title: ${title}}${NEW_LINE}{subtitle: ${subtitle}}${NEW_LINE}{artist: ${artist}}${NEW_LINE}`;
  }

  formatLines(song: Song): string {
    const { lines } = song;

    // filter out the lines we don't want to render already here
    return (
      lines
        .filter(line => this.isRenderableLine(line))
        // .filter(line => line.hasRenderableItems())
        .map(line => this.formatLine(line))
        .join("\n")
    );
  }

  formatLine(line: Line): string {
    const parts = [this.formatLineTop(line), this.formatLineBottom(line)];

    return parts
      .filter(p => !isEmptyString(p))
      .map(part => (part || "").trimEnd())
      .join("\n");
  }

  formatLineTop(line: Line): string | undefined {
    if (hasChordContents(line)) {
      return this.formatLineWithFormatter(line, this.formatItemTop);
    } else {
      const ls: string[] = [];
      line.items.forEach(item => {
        const formattedItem = this.formatItem(item);
        if (formattedItem) {
          ls.push(formattedItem);
        }
      });

      if (ls.length > 0) {
        return ls.join("");
      }
    }

    return undefined;
  }

  formatLineBottom(line: Line): string | undefined {
    if (hasLyricsContents(line)) {
      return this.formatLineWithFormatter(line, this.formatItemBottom);
    }

    return undefined;
  }

  formatLineWithFormatter(
    line: Line,
    formatter: (item: Item) => string
  ): string {
    return line.items.map(item => formatter.call(this, item)).join("");
  }

  formatItemTop(item: Item): string {
    if (item instanceof ChordSheetJS.Tag && item.isRenderable()) {
      return padLeft(item.value, 0);
    }

    if (item instanceof ChordSheetJS.ChordLyricsPair) {
      return padLeft(item.chords, chordLyricsPairLength(item));
    }

    return "";
  }

  formatItemBottom(item: Item): string {
    if (item instanceof ChordSheetJS.Tag && item.isRenderable()) {
      return item.value || "";
    }

    if (item instanceof ChordSheetJS.ChordLyricsPair) {
      return padLeft(item.lyrics || "", chordLyricsPairLength(item));
    }

    return "";
  }

  formatItem(item: Item): string | undefined {
    if (isHeaderTag(item)) {
      // do not output header tags as they are shown in another way
      return undefined;
    } else if (item instanceof ChordSheetJS.Tag) {
      return this.formatTag(item);
    } else if (item instanceof ChordSheetJS.Comment) {
      return item.content ? `# ${item.content.trimStart()}` : undefined;
    } else if (item instanceof ChordSheetJS.Literal) {
      // tab contents is stored as Literal, in the string field
      return item.string;
    } else {
      // ignore other fields
      return undefined;
    }
  }

  formatTag(tag: Tag): string | undefined {
    switch (tag.name) {
      case START_OF_CHORUS:
        return tag.hasValue() ? `[Chorus ${tag.value}]` : "[Chorus]";
      case START_OF_VERSE:
        return tag.hasValue() ? `[Verse ${tag.value}]` : "[Verse]";
      case COMMENT:
      case CAPO:
        return tag.hasValue() ? `[${tag.value}]` : undefined;
      case START_OF_TAB:
      case END_OF_TAB:
      case END_OF_CHORUS:
      case END_OF_VERSE:
        // we should not get if isRenderableLine() works correctly
        // we are not using anything to identify start and end of tabs
        return undefined;
      default:
        return tag.hasValue()
          ? `[${tag.originalName}: ${tag.value}]`
          : `[${tag.originalName}]`;
    }
  }

  isRenderableLine(line: Line): boolean {
    return (
      line.items.some(item => {
        // these will not add a newline if found
        return (
          (item instanceof ChordSheetJS.ChordLyricsPair && !!item.chords) ||
          (item instanceof ChordSheetJS.ChordLyricsPair && !!item.lyrics) ||
          (item instanceof ChordSheetJS.Comment && !!item.content) ||
          (item instanceof ChordSheetJS.Literal && !!item.string) || // tab contents is stored as Literal, in the string field
          (item instanceof ChordSheetJS.Tag &&
            [START_OF_TAB, END_OF_TAB, END_OF_CHORUS, END_OF_VERSE].indexOf(
              item.name
            ) === -1) // include START_OF_TAB as we do not use anything to identify the start and end of tabs
        );
      }) || line.items.length === 0 // likely a newline
    );
  }
}
