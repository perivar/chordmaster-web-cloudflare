import ChordSheetJS, { Song } from "chordsheetjs";

import {
  MyChordLyricsPair,
  MyComment,
  MyItem,
  MyLine,
  MyLiteral,
  MySong,
  MyTag,
} from "../lib/MySong";

export const convertSongToMySong = (song: Song): MySong => {
  const myLines = song.lines.map(line => {
    const myItems = line.items
      .map(item => {
        if (item instanceof ChordSheetJS.ChordLyricsPair) {
          return new MyChordLyricsPair(item.chords, item.lyrics);
        } else if (item instanceof ChordSheetJS.Comment) {
          return new MyComment(item.content);
        } else if (item instanceof ChordSheetJS.Tag) {
          return new MyTag(item.name, item.value);
        } else if (item instanceof ChordSheetJS.Literal) {
          return new MyLiteral(item.string);
        } else {
          // ignore
          console.warn(`Warning unknown type ${typeof item}. Ignoring ...`);
          return undefined; // Return undefined for unknown types
        }
      })
      .filter((item): item is MyItem => item !== undefined); // Filter out undefined values

    return new MyLine(myItems);
  });

  return new MySong(myLines);
};
