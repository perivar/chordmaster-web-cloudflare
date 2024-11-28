import he from "he";

import {
  getChordLineRegex,
  getChordRegex,
  getDoubleChordLinesRegex,
  getHeaderRegex,
} from "./getChordRegex";

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

  // Replace european H with B
  const regexH = /\[ch\][Hh](.*?)\[\/ch\]/g;
  removed = removed.replace(regexH, "[ch]B$1[/ch]");

  // Replace european /H with /B
  const regexSlashH = /\[ch\]([^\[]*?)\/[Hh]([#b])?\[\/ch\]/g;
  removed = removed.replace(regexSlashH, "[ch]$1/B$2[/ch]");

  // Replace isolated "M" with "Maj" (unless it's already "Maj")
  const regexM = /\[ch\]([^\[]*?)M(?!aj)([^\[]*?)\[\/ch\]/g;
  removed = removed.replace(regexM, "[ch]$1maj$2[/ch]");

  // replace chords like E7+ with E7+5
  const regexPlusMissing5 =
    /\[ch\]([^\[]*?)(\+|aug)(?![0-9])([^\[]*?)\[\/ch\]/g;
  removed = removed.replace(regexPlusMissing5, "[ch]$1$25$3[/ch]");

  // Remove unwanted characters like parentheses, commas, and spaces
  // from chords like Dm(maj7), C7(b9) and Eb7(b5)
  const regexUnwanted = /\[ch\]([^\[]+?)\[\/ch\]/g;
  removed = removed.replace(regexUnwanted, (_match, chord) => {
    // Remove unwanted characters like parentheses, commas, and spaces
    const cleanedChord = chord.replace(/[\(\),\s]+/g, "");
    return `[ch]${cleanedChord}[/ch]`;
  });

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

  // this version uses a variant found on:
  // https://github.com/briancaffey/briancaffey.github.io/blob/master/content/2018/04/26/generating-music-from-guitar-tabs-with-python.html.md
  // added \|? to also support |E| type of tabs
  const regTabLine = /(?:\|?[EBGDA-]+\|.+?\|.*\r?\n|\r){6}/gim;

  removed = removed.replace(regTabLine, "");

  return removed;
};

export const cleanupChords = (content: string) => {
  let cleaned = content;

  const replaceChords = (chords_content: string) => {
    const regexChord = getChordRegex();
    return chords_content.replace(regexChord, chord => {
      let removed = chord;

      // Replace european H with B
      const regexH = /H/g;
      removed = removed.replace(regexH, "B");

      // Replace isolated "M" with "Maj" (unless it's already "Maj")
      const regexM = /M(?!aj)/g;
      removed = removed.replace(regexM, "maj");

      // Remove unwanted characters like parentheses, commas, and spaces
      const regexUnwanted = /[\(\),\s]+/g;
      removed = removed.replace(regexUnwanted, "");

      return removed;
    });
  };

  cleaned = replaceChords(cleaned);

  // replace 7/9 with only 9
  const regex79 = /([A-H][b#]?.*?)(?:[0-9]+)\/([0-9]+)/g;
  cleaned = cleaned.replace(regex79, "$1$2");

  // replace chords like E7+ with E7+5
  const regexPlusMissing5 = /([A-H][b#]?.*?\+)(?![0-9])/g;
  cleaned = cleaned.replace(regexPlusMissing5, "$15");

  return cleaned;
};

export const cleanupHeaders = (content: string) => {
  let removed = content;

  // match a pattern of [something] + one or more newlines and a chord line
  // used to remove several newlines before a chord line

  const regHeader = getHeaderRegex();
  const regLineBreak = /(?:\r?\n|\r){2,}/; // Match two or more consecutive line breaks
  const chordLinePattern = getChordLineRegex(); // Match a chord line (e.g., C#m7, F#7/G#)

  const regHeaderChordLine = new RegExp(
    `(${regHeader.source})${regLineBreak.source}(${chordLinePattern.source})`,
    "gm"
  );

  removed = removed.replace(regHeaderChordLine, "$1\n$2");

  return removed;
};

export const cleanupDoubleChordLines = (content: string) => {
  let result = content;

  // define the regex for double chord lines (two chord lines separated by exactly one newline)
  // this regex matches two chord lines with just one newline between them
  const regDoubleChordLines = getDoubleChordLinesRegex("gm");

  // Replace all pairs of chord lines with exactly one newline between them with two newlines
  // We continue to replace any occurrences of exactly one newline between chord lines
  while (regDoubleChordLines.test(result)) {
    result = result.replace(regDoubleChordLines, "$1\n\n$2");
  }

  return result;
};
