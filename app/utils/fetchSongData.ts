import ChordSheetJS from "chordsheetjs";

import { CustomUltimateGuitarParser } from "./CustomUltimateGuitarParser";
import { CustomUltimateGuitarRawParser } from "./CustomUltimateGuitarRawParser";
import {
  getAZChordContent,
  getNorTabsChordContent,
  parseUltimateGuitar,
} from "./scrapeUtils";

export const fetchSongData = async (
  query: string
): Promise<{
  artist: string;
  songName: string;
  chordPro: string;
  url: string;
  source: string;
}> => {
  // example urls:

  // www.chordie.com:
  // https://www.chordie.com/chord.pere/www.azchords.com/b/billyjoel-tabs-473/justthewayyouare-tabs-894021.html

  // www.azchords.com:
  // const url =
  //   'https://www.azchords.com/b/billyjoel-tabs-473/justthewayyouare-tabs-894021.html';
  // const url =
  //   'https://www.azchords.com/r/robbiewilliams-tabs-3334/somethingstupid-tabs-510860.html';
  // const url =
  //   'https://www.azchords.com/c/catstevens-tabs-722/moonshadow1-tabs-451195.html';
  // const url =
  //   'https://www.azchords.com/c/catstevens-tabs-722/moonshadow-tabs-211671.html';

  // tabs.ultimate-guitar.com:
  // const url = 'https://tabs.ultimate-guitar.com/tab/266333';
  // const url =
  //   'https://tabs.ultimate-guitar.com/tab/cat-stevens/wild-world-chords-992169';
  // const url =
  //   'https://tabs.ultimate-guitar.com/tab/celine-dion/all-by-myself-chords-66364';
  // const url =
  // 'https://tabs.ultimate-guitar.com/tab/frank-sinatra/the-way-you-look-tonight-chords-742402';
  // const url =
  //   'https://tabs.ultimate-guitar.com/tab/elton-john/sorry-seems-to-be-the-hardest-word-chords-998401';
  // const url =
  //   'https://tabs.ultimate-guitar.com/tab/michael_jackson/man_in_the_mirror_chords_517579';
  // const url =
  //   'https://tabs.ultimate-guitar.com/tab/sinach/way-maker-chords-2405347';
  // const url =
  //   'https://tabs.ultimate-guitar.com/tab/chris-tomlin/how-great-is-our-god-chords-166109';

  // nortabs.net:
  // const url =
  //   'https://nortabs.net/tab/6878/';

  // pathawks/Christmas-Songs:
  // const url =
  //   'https://raw.githubusercontent.com/pathawks/Christmas-Songs/master/Angels%20From%20The%20Realms%20Of%20Glory.cho';
  // const url =
  //   'https://raw.githubusercontent.com/pathawks/Christmas-Songs/master/First%20Nowell.cho';
  // const url =
  //   'https://raw.githubusercontent.com/pathawks/Christmas-Songs/master/Hark%20the%20Herald%20Angels%20Sing.cho';

  // to avoid truncating log files, log to a json server
  // step 1:  install json server globally:
  //          yarn global add json-server
  // step 2:  create a new file for logs:
  //          echo '{"logs": []}'> logs.json
  // step 3:  start json-server:
  //          json-server logs.json
  // step 4:  log to server from client app:
  // axios.post('http://localhost:3000/logs', {
  //   date: new Date(),
  //   msg: content,
  // });

  const url = query;
  const header = {
    method: "GET",
    headers: {},
  };

  const fetchResult = await fetch(url, header);

  if (url.startsWith("https://www.azchords.com")) {
    const htmlResult = await fetchResult.text();

    const { artist, songName, cleanedContent } = getAZChordContent(htmlResult);
    if (!artist || !songName || !cleanedContent) {
      throw new Error("Returned undefined for artist, song name or content!");
    }

    const chordSheetSong = new CustomUltimateGuitarParser({
      preserveWhitespace: false,
    }).parse(cleanedContent);

    const chordPro = new ChordSheetJS.ChordProFormatter().format(
      chordSheetSong
    );

    return { artist, songName, chordPro, url, source: "azchords" };
  } else if (url.startsWith("https://tabs.ultimate-guitar.com/")) {
    const htmlResult = await fetchResult.text();

    // const { artist, songName, cleanedContent } =
    //   getUltimateGuitarContent(htmlResult);

    // let chordSheetSong = new CustomUltimateGuitarParser({
    //   preserveWhitespace: false,
    // }).parse(cleanedContent);

    // converted to use raw ultimate guitar format (i.e. with [tab] and [ch] tags)
    const { artist, songName, content } = parseUltimateGuitar(htmlResult);

    if (!artist || !songName || !content) {
      throw new Error("Returned undefined for artist, song name or content!");
    }

    const chordSheetSong = new CustomUltimateGuitarRawParser({
      preserveWhitespace: false,
    }).parse(content);

    const chordPro = new ChordSheetJS.ChordProFormatter().format(
      chordSheetSong
    );

    return { artist, songName, chordPro, url, source: "ultimate-guitar" };
  } else if (url.startsWith("https://raw.githubusercontent.com/pathawks/")) {
    const chordPro = await fetchResult.text();
    const s = new ChordSheetJS.ChordProParser().parse(chordPro);

    const title = Array.isArray(s.title) ? s.title[0] : (s.title ?? "");
    const artist = Array.isArray(s.artist)
      ? s.artist[0]
      : (s.artist ?? "Public Domain");

    return {
      artist,
      songName: title,
      chordPro,
      url,
      source: "Public Domain Christmas Songs",
    };
  } else if (url.startsWith("https://nortabs.net")) {
    const htmlResult = await fetchResult.text();

    const { artist, songName, cleanedContent } =
      getNorTabsChordContent(htmlResult);

    if (!artist || !songName || !cleanedContent) {
      throw new Error("Returned undefined for artist, song name or content!");
    }

    const chordSheetSong = new CustomUltimateGuitarParser({
      preserveWhitespace: false,
    }).parse(cleanedContent);

    const chordPro = new ChordSheetJS.ChordProFormatter().format(
      chordSheetSong
    );

    return { artist, songName, chordPro, url, source: "nortabs" };
  } else {
    throw new Error("Unsupported URL");
  }
};
