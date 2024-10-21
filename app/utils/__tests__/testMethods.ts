import fs from "fs";
import { Song } from "chordsheetjs";

export const writeSongAsJson = (
  song: Song,
  doDebugToFile: boolean,
  filePath = "debug/debugSong.json"
) => {
  if (doDebugToFile) {
    fs.writeFileSync(filePath, JSON.stringify(song, null, 2));
  }
};

export const writeSongAsText = (
  plainText: string,
  doDebugToFile: boolean,
  filePath = "debug/debugSong.txt"
) => {
  if (doDebugToFile) {
    fs.writeFileSync(filePath, plainText);
  }
};
