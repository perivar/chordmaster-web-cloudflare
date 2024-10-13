import ChordSheetJS, { Line, Song } from "chordsheetjs";

import {
  ARTIST,
  COMMENT,
  END_OF_TAB,
  START_OF_CHORUS,
  START_OF_TAB,
  START_OF_VERSE,
  TITLE,
} from "./ChordSheetConstants";

const NEW_LINE = "\n";

export default class CustomHtmlDivFormatter {
  private isStartOfTabs(line: Line) {
    return line.items.some(
      i => i instanceof ChordSheetJS.Tag && i.name === START_OF_TAB
    );
  }

  private isEndOfTabs(line: Line) {
    return line.items.some(
      i => i instanceof ChordSheetJS.Tag && i.name === END_OF_TAB
    );
  }

  private getLyrics(line: Line) {
    let lyrics = "";
    line.items.forEach(item => {
      if (item instanceof ChordSheetJS.ChordLyricsPair) {
        lyrics = lyrics + item.lyrics;
      }
    });
    return lyrics;
  }

  private getTabStringArray(song: Song, startAtIndex: number) {
    const tabArray: string[] = [];
    let line = song.lines[startAtIndex];
    do {
      const tabLine = this.getLyrics(line);
      if (tabLine !== "") {
        tabArray.push(tabLine);
      }
      startAtIndex++;
      line = song.lines[startAtIndex];
    } while (line !== null && !this.isEndOfTabs(line));
    return tabArray;
  }

  private transposeArray(array: string[]) {
    let biggestLine = 0;
    array.forEach(line => (biggestLine = Math.max(line.length, biggestLine)));

    const transposedArray: string[] = [];
    for (let i = 0; i < biggestLine; i++) {
      transposedArray.push("");
    }

    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < biggestLine; j++) {
        const character = array[i][j] ? array[i][j] : " ";
        transposedArray[j] = transposedArray[j] + character;
      }
    }
    return transposedArray;
  }

  format(song: Song, fontSize = 14) {
    const CHORD_SIZE_CLASS = fontSize !== 14 ? ` chord-size-${fontSize}` : "";
    const LYRICS_SIZE_CLASS = fontSize !== 14 ? ` line-size-${fontSize}` : "";
    let html = `<div class="chord-sheet">`;
    let waitEndOfTabs = false;

    song.lines.forEach((l, index) => {
      if (waitEndOfTabs) {
        if (this.isEndOfTabs(l)) {
          waitEndOfTabs = false;
        }
        // Skip line
        return;
      }
      if (this.isStartOfTabs(l)) {
        waitEndOfTabs = true;
        const tabStringArray = this.getTabStringArray(song, index);
        const transposedArray = this.transposeArray(tabStringArray);
        html += `<div class="tab${LYRICS_SIZE_CLASS}">`;
        transposedArray.forEach(tabLine => {
          html += `<div class="tab-line">${tabLine}</div>` + NEW_LINE;
        });
        html += "</div>" + NEW_LINE;
        // Skip line
        return;
      }

      html += `<div class="line${LYRICS_SIZE_CLASS}">`;
      if (l.items && l.items.length > 0) {
        l.items.forEach(item => {
          if (item instanceof ChordSheetJS.ChordLyricsPair) {
            if (item.chords) {
              let { lyrics } = item;
              if (lyrics && lyrics.length <= item.chords.length)
                lyrics =
                  lyrics + " ".repeat(item.chords.length - lyrics.length + 1);
              html += `<div class="chord${CHORD_SIZE_CLASS}">${item.chords}</div>`;
              html += item.lyrics && `<div>${item.lyrics}</div>`;
            } else {
              html += item.lyrics && `<div>${item.lyrics}</div>`;
            }
            // Disable all comments, use tags for viewing instead
            // } else if (item instanceof ChordSheetJS.Comment && item.content) {
            //   // console.log('html format -> comment:', item.content);
            //   let comment = item.content.trim();

            //   // if comment includes chords - format them
            //   comment = comment.replace(/\[([^\]]+)\]/g, (v, c) => {
            //     return `<div class="chord${CHORD_SIZE_CLASS} chord-inline">${c}</div>`;
            //   });

            //   html += `<div class="comment">${comment}</div>`;
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.name === TITLE
          ) {
            html += `<div class="title">${item.value}</div>`;
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.name === ARTIST
          ) {
            html += `<div class="artist">${item.value}</div>`;
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.name === START_OF_VERSE
          ) {
            html += `<div class="comment">${"Verse"} ${item.value ?? ""}</div>`;
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.name === START_OF_CHORUS
          ) {
            html += `<div class="comment">${"Chorus"} ${
              item.value ?? ""
            }</div>`;
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.name === COMMENT
          ) {
            // tag comments have name 'comment' and the comment as value
            html += `<div class="comment">${item.value}</div>`;
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.value &&
            item.value !== null
          ) {
            html += `<div class="meta-label">${item.name}</div><div class="meta-value">${item.value}</div>`;
          } else {
            // ignore
            // console.log('html format -> not handled:', item.toString());
          }
        });
      }
      html += "</div>";

      if (index < song.lines.length - 1) {
        html += NEW_LINE;
      }
    });

    // combine words separated with chords like
    // everyday: 'every<div class="chord">C6</div>day'
    // to single words
    // html = html.replace(/\w+(<div class="chord(.*?)<\/div>\w+)+/g, v => {
    //   return `<div class="word">${v}</div>`;
    // });

    html += "</div>";
    return html;
  }
}
