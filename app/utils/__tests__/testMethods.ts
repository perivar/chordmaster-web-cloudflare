import fs from "fs";

export const writeSongAsJson = (
  song: unknown,
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

export function toPlainObject(obj: unknown): unknown {
  return JSON.parse(JSON.stringify(obj));
}

export const fetchUrl = async (url: string) => {
  const header = {
    method: "GET",
    headers: {},
  };

  const fetchResult = await fetch(url, header);
  const htmlResult = await fetchResult.text();

  return htmlResult;
};
