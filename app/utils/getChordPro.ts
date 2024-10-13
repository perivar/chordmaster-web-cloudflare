import { ISong } from "~/lib/firestoreQueries";

export const getChordPro = (song: ISong) => {
  let headerlessContent = song.content;
  headerlessContent = headerlessContent.replace(/{artist:[^}]*}\n/g, "");
  headerlessContent = headerlessContent.replace(/{title:[^}]*}\n/g, "");
  const header = `{title: ${song.title}}\n` + `{artist: ${song.artist.name}}\n`;
  return header + headerlessContent;
};
