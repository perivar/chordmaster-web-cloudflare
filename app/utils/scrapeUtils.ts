import he from "he";

import { getDoubleChordLinesRegex } from "./getChordRegex";

export const getAZChordContent = (htmlResult: string, isRemoveTabs = false) => {
  const { artist, songName, content } = parseAZChords(htmlResult);
  const cleanedContent = cleanupAZChordsContent(
    content as string,
    isRemoveTabs
  );
  return { artist, songName, cleanedContent };
};

export const getUltimateGuitarContent = (
  htmlResult: string,
  isRemoveTabs = false
) => {
  const { artist, songName, content } = parseUltimateGuitar(htmlResult);
  const cleanedContent = cleanupUltimateGuitarContent(
    content as string,
    isRemoveTabs
  );
  return { artist, songName, cleanedContent };
};

export const getNorTabsChordContent = (
  htmlResult: string,
  isRemoveTabs = false
) => {
  const { artist, songName, content } = parseNorTabsChords(htmlResult);
  const cleanedContent = cleanupNorTabsChordsContent(
    content as string,
    isRemoveTabs
  );
  return { artist, songName, cleanedContent };
};

export const cleanupUltimateGuitarContent = (
  content: string,
  isRemoveTabs = false
) => {
  let cleanedContent = content;

  cleanedContent = cleanupUltimateGuitarTab(cleanedContent);

  if (isRemoveTabs) {
    cleanedContent = removeTabs(cleanedContent);
  }

  cleanedContent = removeCarriageReturn(cleanedContent);

  // cleanupChords are covered by the cleanupUltimateGuitarTab method
  // cleanedContent = cleanupChords(cleanedContent);
  //

  cleanedContent = cleanupHeaders(cleanedContent);

  cleanedContent = cleanupDoubleChordLines(cleanedContent);

  return cleanedContent;
};

export const cleanupAZChordsContent = (
  content: string,
  isRemoveTabs = false
) => {
  let cleanedContent = content;

  if (isRemoveTabs) {
    cleanedContent = removeTabs(cleanedContent);
  }

  cleanedContent = removeCarriageReturn(cleanedContent);

  cleanedContent = cleanupChords(cleanedContent);

  cleanedContent = cleanupHeaders(cleanedContent);

  cleanedContent = cleanupDoubleChordLines(cleanedContent);

  return cleanedContent;
};

export const cleanupNorTabsChordsContent = (
  content: string,
  isRemoveTabs = false
) => {
  let cleanedContent = content;

  if (isRemoveTabs) {
    cleanedContent = removeTabs(cleanedContent);
  }

  cleanedContent = removeCarriageReturn(cleanedContent);

  cleanedContent = cleanupChords(cleanedContent);

  cleanedContent = cleanupHeaders(cleanedContent);

  cleanedContent = cleanupDoubleChordLines(cleanedContent);

  return cleanedContent;
};

export const parseUltimateGuitar = (
  htmlResult: string
): {
  artist: string | undefined;
  songName: string | undefined;
  content: string | undefined;
} => {
  let artist: string | undefined;
  let songName: string | undefined;
  let content: string | undefined;

  // extract json content from string
  const regexContent =
    /<div class="js-store" data-content="([\s\S]+?)"><\/div>/g;
  const json_store_raw = regexContent.exec(htmlResult)?.[1];

  if (json_store_raw) {
    // make sure the json raw text is true json
    const json_store_clean_quote = json_store_raw.replace(/&quot;/g, '"');

    const json_content = JSON.parse(json_store_clean_quote);
    const page_data = json_content?.store?.page.data;
    const tab = page_data?.tab;
    const tab_view = page_data?.tab_view;

    artist = tab?.artist_name ? he.decode(tab?.artist_name) : "";
    songName = tab?.song_name ? he.decode(tab?.song_name) : "";
    content = tab_view?.wiki_tab?.content
      ? he.decode(tab_view?.wiki_tab?.content)
      : "";
  }

  return { artist, songName, content };
};

export const parseAZChords = (
  htmlResult: string
): {
  artist: string | undefined;
  songName: string | undefined;
  content: string | undefined;
} => {
  const regexArtist = /<a class="h2link pull-left".*?>(.+?)<\/a>/g;
  const artist = regexArtist.exec(htmlResult)?.[1];

  const regexAggregateRating =
    /<span itemprop="aggregateRating".*?>([\s\S]+?)<\/span>/g;
  const aggregateRating = regexAggregateRating.exec(htmlResult)?.[1];

  let songName: string | undefined;
  if (aggregateRating) {
    const regexSongName = /<meta itemprop="name"\s+content\s+=\s+"(.+?)"/g;
    songName = regexSongName.exec(aggregateRating)?.[1];
  }

  const regexContent = /<pre id="content">([\s\S]+?)<\/pre>/g;
  const content = regexContent.exec(htmlResult)?.[1];

  return { artist, songName, content };
};

export const parseNorTabsChords = (
  htmlResult: string
): {
  artist: string | undefined;
  songName: string | undefined;
  content: string | undefined;
} => {
  if (!htmlResult)
    return { artist: undefined, songName: undefined, content: undefined };

  // Extract artist from breadcrumbs
  // <ul class="breadcrumbs"><li><a href="/collections/k/">K</a> » </li><li><a href="/collection/621/">Kari Diesen</a> » </li></ul>
  const regArtist =
    /<ul class="breadcrumbs">.*?<li>.*?<a href="[^"]*?">[^<]*?<\/a>.*?<\/li>.*?<li>.*?<a href="[^"]*?">(?<artist>[^<]+)<\/a>/s;
  const artistMatch = regArtist.exec(htmlResult);
  const artist = artistMatch?.groups?.artist;

  // Extract song title from heading
  // <h2 class="heading">På Hovedøen</h2>
  const regSongTitle = /<h2 class="heading">(?<songTitle>[^<]+)<\/h2>/;
  const songMatch = regSongTitle.exec(htmlResult);
  const songName = songMatch?.groups?.songTitle;

  // Extract content from preformatted body
  const regContent = /<pre class="tab-body">(?<content>[^<]+)<\/pre>/;
  const contentMatch = regContent.exec(htmlResult);
  const content = contentMatch?.groups?.content;

  return { artist, songName, content };
};

export const cleanupUltimateGuitarTab = (content: string) => {
  let removed = content;

  removed = cleanupUltimateGuitarChordsRaw(content);

  // fix chords
  const regexCh = /\[ch\](.*?)\[\/ch\]/g;
  removed = removed.replace(regexCh, "$1");

  // fix tabs
  const regexTab = /\[tab\]([\s\S]*?)\[\/tab\]/g;
  removed = removed.replace(regexTab, "$1");

  return removed;
};

export const cleanupUltimateGuitarChordsRaw = (content: string) => {
  let removed = content;

  // First fix H and Hm chords
  const regexH = /\[ch\][H|h](m?.*?)\[\/ch\]/g;
  removed = removed.replace(regexH, "[ch]B$1[/ch]");

  // Then handle chords with /H
  const regexSlashH =
    /(?:\[ch\](?:([A-H][#b]?[^/\s]*)\/[hH]([#b]?))\[\/ch\])+/g;
  removed = removed.replace(regexSlashH, "[ch]$1/B$2[/ch]");

  // Replace M with maj
  const regexM =
    /\[ch\]([A-G](?:b|#)?)M([0-9]*(?:sus)?[0-9]*(?:b|#)?[0-9]*(\/[A-G](?:b|#)?)?)\[\/ch\]/g;
  removed = removed.replace(regexM, "[ch]$1maj$2[/ch]");

  // replace chords like E7+ with E7+5
  const regexPlusMissing5 =
    /\[ch\]([A-G](?:b|#)?(?:maj|min|m|M)?[0-9]*)(\+|aug)(?![0-9])\[\/ch\]/g;
  removed = removed.replace(regexPlusMissing5, "[ch]$1$25[/ch]");

  // Remove the parenthesis from chords like Dm(maj7), C7(b9) and Eb7(b5)
  const regexParenth =
    /\[ch\]([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(?:\((maj|min|m|M|\+|-|dim|aug|sus)?([0-9]*)(b|#)?([0-9]*)\))?(\/[A-G](?:b|#)?)?\[\/ch\]/g;
  removed = removed.replace(regexParenth, "[ch]$1$2$3$4$5$6$7$8$9[/ch]");

  // Disabled - and + substitution, since we do not have a good way to handle the difference between
  // C+ and C# or E- and Eb
  //
  // Process complex cases first (combined + and - chords) (e.g., E7+5-9 or E7-5+9)
  // Replace - with b and + with # from chords like E7+5-9
  // const regexPlusMinus =
  //   /\[ch\]([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?(?:\+)([0-9]*)(?:-)([0-9]*)(\/[A-G](?:b|#)?)?\[\/ch\]/g;
  // removed = removed.replace(regexPlusMinus, "[ch]$1$2$3$4#$5$6b$7$8[/ch]");

  // Replace - with b and + with # from chords like E7-5+9
  // const regexMinusPlus =
  //   /\[ch\]([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?(?:-)([0-9]*)(?:\+)([0-9]*)(\/[A-G](?:b|#)?)?\[\/ch\]/g;
  // removed = removed.replace(regexMinusPlus, "[ch]$1$2$3$4b$5$6#$7$8[/ch]");

  // Handle simpler cases after combined ones
  // Replace - with b from chords like F#m7-5
  // const regexMinus =
  //   /\[ch\]([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?([0-9]*)(?:-)([0-9]*)(\/[A-G](?:b|#)?)?\[\/ch\]/g;
  // removed = removed.replace(regexMinus, "[ch]$1$2$3$4$5$6b$7$8[/ch]");

  // Replace + with # from chords like F#m7+5
  // const regexPlus =
  //   /\[ch\]([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?([0-9]*)(?:\+)([0-9]*)(\/[A-G](?:b|#)?)?\[\/ch\]/g;
  // removed = removed.replace(regexPlus, "[ch]$1$2$3$4$5$6#$7$8[/ch]");

  return removed;
};

export const removeCarriageReturn = (content: string) => {
  let removed = content;

  const regexCR = /(\r)/gm;

  removed = removed.replace(regexCR, "");

  return removed;
};

export const removeTabs = (content: string) => {
  let removed = content;

  // when using /gm we can use ^ and $ to match single lines
  // const regexTabline = /^(?:e|B|G|D|A|E)\|.+?\|.*\r?\n|\r$/gm;

  // for multi lines we can't
  // const regex = /\w\|.+?\|\s.*/g;
  // const regex = /\w\|.+?\|\s.*[\r|\n]/g;

  // this version removes too much!!
  // const regexTabline = /^(?:e|B|G|D|A|E)(?:\||\s).+?(?:\||\s).*\r?\n|\r$/gm;

  // this version uses a variant found on:
  // https://github.com/briancaffey/briancaffey.github.io/blob/master/content/2018/04/26/generating-music-from-guitar-tabs-with-python.html.md
  // re.findall(r"(?:[E,B,G,D,A,-]+\|[0-9-h|]+\n){6}",contents)
  // added \|? to also support |E| type of tabs
  const regexTabline = /(?:\|?[EBGDA-]+\|.+?\|.*\r?\n|\r){6}/gim;

  removed = removed.replace(regexTabline, "");

  return removed;
};

export const cleanupChords = (content: string) => {
  let removed = content;

  // Chord Regex Examples:
  // const regex =
  //   /[A-G](b|#)?(maj|min|m|M|\+|-|dim|aug)?[0-9]*(sus)?[0-9]*(b|#)?[0-9]*(\/[A-G](b|#)?)?/g;

  // chord with []
  // https://regex101.com/r/wEQajG/1
  // /\[([A-G][#b]?(maj|m)?[27]?(add|aug|dim|sus)?[2-9]?)\]/g

  // from https://github.com/martijnversluis/ChordSheetJS/blob/check-chord-parsing/src/chord.ts
  // const chordRegex =
  //   /^(?<base>[A-G])(?<modifier>#|b)?(?<suffix>[^/\s]*)(\/(?<bassBase>[A-G])(?<bassModifier>#|b)?)?$/i;

  // chords
  // [\s\.\)-\/\]]*([ABCDEFGH][b#]?[m]?[\(]?(2|5|6|7|9|11|13|6\/9|7\-5|7\-9|7\#5|7\#9|7\+5|7\+9|7b5|7b9|7sus2|7sus4|add2|add4|add9|aug|dim|dim7|m\|maj7|m6|m7|m7b5|m9|m11|m13|maj|maj7|maj9|maj11|maj13|mb5|m|sus|sus2|sus4){0,2}(\/[A-H])?(\))?)[^\s\.\)-\/\]]*

  // replace M with maj
  const regexM =
    /([A-G](?:b|#)?)M([0-9]*(?:sus)?[0-9]*(?:b|#)?[0-9]*(\/[A-G](?:b|#)?)?)/g;
  removed = removed.replace(regexM, "$1maj$2");

  // replace 7/9 with only 9
  const regex79 =
    /([A-G](?:b|#)?(?:maj|min|m|M|\+|-|dim|aug)?)([0-9]+)\/([0-9]+)/g;
  removed = removed.replace(regex79, "$1$3");

  // replace chords like E7+ with E7+5
  const regexPlusMissing5 =
    /([A-G](?:b|#)?(?:maj|min|m|M)?[0-9]*)(\+|aug)(?![0-9])/g;
  removed = removed.replace(regexPlusMissing5, "$1$25");

  // Remove the parenthesis from chords like Dm(maj7), C7(b9) and Eb7(b5)
  const regexParenth =
    /([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(?:\((maj|min|m|M|\+|-|dim|aug|sus)?([0-9]*)(b|#)?([0-9]*)\))?(\/[A-G](?:b|#)?)?/g;
  removed = removed.replace(regexParenth, "$1$2$3$4$5$6$7$8$9");

  // Disabled - and + substitution, since we do not have a good way to handle the difference between
  // C+ and C# or E- and Eb

  // Process complex cases first (combined + and - chords) (e.g., E7+5-9 or E7-5+9)
  // Replace - with b and + with # from chords like E7+5-9
  // const regexPlusMinus =
  //   /([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?(?:\+)([0-9]+)(?:-)([0-9]+)(\/[A-G](?:b|#)?)?/g;
  // removed = removed.replace(regexPlusMinus, "$1$2$3$4#$5$6b$7$8");

  // Replace - with b and + with # from chords like E7-5+9
  // const regexMinusPlus =
  //   /([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?(?:-)([0-9]+)(?:\+)([0-9]+)(\/[A-G](?:b|#)?)?/g;
  // removed = removed.replace(regexMinusPlus, "$1$2$3$4b$5$6#$7$8");

  // Handle simpler cases after combined ones
  // Replace - with b from chords like F#m7-5
  // const regexMinus =
  //   /([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?([0-9]*)(?:-)([0-9]+)(\/[A-G](?:b|#)?)?/g;
  // removed = removed.replace(regexMinus, "$1$2$3$4$5$6b$7$8");

  // Replace + with # from chords like F#m7+5
  // const regexPlus =
  //   /([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?([0-9]*)(?:\+)([0-9]+)(\/[A-G](?:b|#)?)?/g;
  // removed = removed.replace(regexPlus, "$1$2$3$4$5$6#$7$8");

  return removed;
};

export const cleanupHeaders = (content: string) => {
  let removed = content;

  // this regex matches a patterns of [something] + one or more newlines and a chord line
  // used to remove several newlines before a chordline
  const regHeader =
    /(\[(?:[^\]]+)\])(?:\r?\n|\r){2,}^([^\S\r\n]*(?:(?:[A-G])(?:#|b)?(?:[^/\s]*)(?:\/(?:[A-G])(?:#|b)?)?))/gm;

  removed = removed.replace(regHeader, "$1\n$2");

  return removed;
};

export const cleanupDoubleChordLines = (content: string) => {
  let result = content;

  // define the regex for double chord lines (two chord lines separated by exactly one newline)
  // this regex matches two chordlines with just one newline between them
  const regDoubleChordLines = getDoubleChordLinesRegex("gm");

  // Replace all pairs of chordlines with exactly one newline between them with two newlines
  // We continue to replace any occurrences of exactly one newline between chordlines
  while (regDoubleChordLines.test(result)) {
    result = result.replace(regDoubleChordLines, "$1\n\n$2");
  }

  return result;
};
