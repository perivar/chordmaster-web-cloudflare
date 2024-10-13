import he from "he";

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

export const cleanupUltimateGuitarContent = (
  content: string,
  isRemoveTabs = false
) => {
  let cleanedContent = content;
  // console.log(cleanedContent);

  cleanedContent = cleanupUltimateGuitarTab(cleanedContent);
  // console.log(cleanedContent);

  if (isRemoveTabs) {
    cleanedContent = removeTabs(cleanedContent);
    // console.log(cleanedContent);
  }

  cleanedContent = removeCarriageReturn(cleanedContent);
  // console.log(cleanedContent);

  // covered by the cleanupUltimateGuitarTab method
  // cleanedContent = cleanupChords(cleanedContent);
  // // console.log(cleanedContent);

  cleanedContent = cleanupHeaders(cleanedContent);
  // console.log(cleanedContent);

  cleanedContent = cleanupDoubleChordLines(cleanedContent);
  // console.log(cleanedContent);

  return cleanedContent;
};

export const cleanupAZChordsContent = (
  content: string,
  isRemoveTabs = false
) => {
  let cleanedContent = content;
  // console.log(cleanedContent);

  if (isRemoveTabs) {
    cleanedContent = removeTabs(cleanedContent);
    // console.log(cleanedContent);
  }

  cleanedContent = removeCarriageReturn(cleanedContent);
  // console.log(cleanedContent);

  cleanedContent = cleanupChords(cleanedContent);
  // console.log(cleanedContent);

  cleanedContent = cleanupHeaders(cleanedContent);
  // console.log(cleanedContent);

  cleanedContent = cleanupDoubleChordLines(cleanedContent);
  // console.log(cleanedContent);

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
  // console.log('artist:', artist);

  const regexAggregateRating =
    /<span itemprop="aggregateRating".*?>([\s\S]+?)<\/span>/g;
  const aggregateRating = regexAggregateRating.exec(htmlResult)?.[1];
  // console.log('aggregateRating:', aggregateRating);

  let songName: string | undefined;
  if (aggregateRating) {
    const regexSongName = /<meta itemprop="name"\s+content\s+=\s+"(.+?)"/g;
    songName = regexSongName.exec(aggregateRating)?.[1];
    // console.log('songName:', songName);
  }

  const regexContent = /<pre id="content">([\s\S]+?)<\/pre>/g;
  const content = regexContent.exec(htmlResult)?.[1];
  // console.log('content:', content);

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

  // first fix H and Hm chords
  const regexH = /\[ch\][H|h](m?.*?)\[\/ch\]/g;
  removed = removed.replace(regexH, "[ch]B$1[/ch]");

  // then first the /H chords
  const regexSlashH =
    /(?:\[ch\](?:([A-H][#b]?[^/\s]*)\/[hH]([#b]?))\[\/ch\])+/g;
  removed = removed.replace(regexSlashH, "[ch]$1/B$2[/ch]");

  // replace M with maj
  const regexM =
    /\[ch\]([A-G](?:b|#)?)M([0-9]*(?:sus)?[0-9]*(?:b|#)?[0-9]*(\/[A-G](?:b|#)?)?)\[\/ch\]/g;
  removed = removed.replace(regexM, "[ch]$1maj$2[/ch]");

  // remove the parenthesis from chords like C7(b9) and Eb7(b5)
  const regexParenth =
    /\[ch\]([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(?:\()(sus)?([0-9]*)(b|#)?([0-9]*)(?:\))(\/[A-G](?:b|#)?)?\[\/ch\]/g;
  removed = removed.replace(regexParenth, "[ch]$1$2$3$4$5$6$7$8$9[/ch]");

  // replace - with b from chords like F#m7-5
  const regexMinus =
    /\[ch\]([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?([0-9]*)(?:-)([0-9]*)(\/[A-G](?:b|#)?)?\[\/ch\]/g;
  removed = removed.replace(regexMinus, "[ch]$1$2$3$4$5$6b$7$8[/ch]");

  // replace + with # from chords like F#m7+5
  const regexPlus =
    /\[ch\]([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?([0-9]*)(?:\+)([0-9]*)(\/[A-G](?:b|#)?)?\[\/ch\]/g;
  removed = removed.replace(regexPlus, "[ch]$1$2$3$4$5$6#$7$8[/ch]");

  // replace - with b and + with # from chords like E7+5-9
  const regexMinus2 =
    /\[ch\]([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?(?:\+)([0-9]*)(?:-)([0-9]*)(\/[A-G](?:b|#)?)?\[\/ch\]/g;
  removed = removed.replace(regexMinus2, "[ch]$1$2$3$4#$5$6b$7$8[/ch]");

  // replace - with b and + with # from chords like E7-5+9
  const regexPlus2 =
    /\[ch\]([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?(?:-)([0-9]*)(?:\+)([0-9]*)(\/[A-G](?:b|#)?)?\[\/ch\]/g;
  removed = removed.replace(regexPlus2, "[ch]$1$2$3$4b$5$6#$7$8[/ch]");

  return removed;
};

// const testRemoveTabs = () => {
//   const testContent = `
// I'll take you just the way you are
// [Intro]

// e|--------2---3------------|----2---7----5-----------|
// B|------3-----3------------|---3----8----7-----------|
// G|----2-------3------------|--2-----7----7-----------|
// D|--0----------------------|-0-----------------------| x2. Let the D string sound
// A|-------------------------|-------------------------|
// E|-------------------------|-------------------------|

// [Verse 3]

// Riff 4:
// (Dm        E)
// e|-------1--------0--|
// B|-----3--------0----|
// G|---2--------1------|
// D|-0--------2--------|
// A|-------------------|
// E|-------------------|

// [Verse 2]

// Chords:
//     F     F6    Fmaj7   C9     Bb6   Bbmaj7 C7/F
// e --1--  --1--  --0--  --3--  --3--  --1--  --x--
// B --1--  --3--  --1--  --3--  --3--  --3--  --1--
// G --2--  --2--  --2--  --3--  --0--  --2--  --3--
// D --3--  --3--  --3--  --2--  --3--  --3--  --2--
// A --x--  --x--  --x--  --3--  --1--  --1--  --3--
// E --x--  --x--  --x--  --x--  --x--  --x--  --1--

// |E|-x---x---x---x---5---3---x---x---x---12---10---7---8---6---x--|
// |B|-6---6---5---5---5---3---1---x---3---10---9----8---6---5---4--|
// |G|-5---7---5---5---3---3---2---5---3---10---9----9---7---6---4--|
// |D|-7---6---5---4---3---2---2---6---3--(10)-(9)---x--(5)--x---4--|
// |A|-5---7---x---x---x--(3)--x---7---x--(12)-(7)--(0)--x---x---x--|
// |E|-x---x---5---5---x---x---1---0---3--(10)-(0)---x---x---x---4--|
// `;

//   return removeTabs(testContent);
// };

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
  const regex1 =
    /([A-G](?:b|#)?)M([0-9]*(?:sus)?[0-9]*(?:b|#)?[0-9]*(\/[A-G](?:b|#)?)?)/g;

  removed = removed.replace(regex1, "$1maj$2");

  // replace 7/9 with only 9
  const regex2 =
    /([A-G](?:b|#)?(?:maj|min|m|M|\+|-|dim|aug)?)([0-9]+)\/([0-9]+)/g;

  removed = removed.replace(regex2, "$1$3");

  // remove the parenthesis from chords like C7(b9) and Eb7(b5)
  const regex3 =
    /([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(?:\()(sus)?([0-9]*)(b|#)?([0-9]*)(?:\))(\/[A-G](?:b|#)?)?/g;

  removed = removed.replace(regex3, "$1$2$3$4$5$6$7$8$9");

  // replace - with b from chords like F#m7-5
  const regex4 =
    /([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?([0-9]*)(?:-)([0-9]*)(\/[A-G](?:b|#)?)?/g;

  removed = removed.replace(regex4, "$1$2$3$4$5$6b$7$8");

  // replace + with # from chords like F#m7+5
  const regex5 =
    /([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?([0-9]*)(?:\+)([0-9]*)(\/[A-G](?:b|#)?)?/g;

  removed = removed.replace(regex5, "$1$2$3$4$5$6#$7$8");

  // replace - with b and + with # from chords like E7+5-9
  const regex6 =
    /([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?(?:\+)([0-9]*)(?:-)([0-9]*)(\/[A-G](?:b|#)?)?/g;

  removed = removed.replace(regex6, "$1$2$3$4#$5$6b$7$8");

  // replace - with b and + with # from chords like E7-5+9
  const regex7 =
    /([A-G])(#|b)?(maj|min|m|M|\+|-|dim|aug)?([0-9]*)(sus)?(?:-)([0-9]*)(?:\+)([0-9]*)(\/[A-G](?:b|#)?)?/g;

  removed = removed.replace(regex7, "$1$2$3$4b$5$6#$7$8");

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
  let removed = content;

  // const regChord =
  //   /(?:[A-G])(?:#|b)?(?:maj|min|m|M|\+|-|dim|aug)?[0-9]*(?:sus)?[0-9]*(?:b|#)?[0-9]*(?:\/[A-G](?:b|#)?)?/gm;

  // const chordLine =
  //   /^[^\S\r\n]*(?:(?:(?:[A-G])(?:#|b)?(?:maj|min|m|M|\+|-|dim|aug)?[0-9]*(?:sus)?[0-9]*(?:b|#)?[0-9]*(?:\/[A-G](?:b|#)?)?)(?:[^\S\r\n]|$)+)+/gm;

  // this regex matches two chordlines with just one newline between them
  const regDoubleChordLines =
    /(^[^\S\r\n]*(?:(?:(?:[A-G])(?:#|b)?(?:maj|min|m|M|\+|-|dim|aug)?[0-9]*(?:sus)?[0-9]*(?:b|#)?[0-9]*(?:\/[A-G](?:b|#)?)?)(?:[^\S\r\n]|$)+)+)\n(^[^\S\r\n]*(?:(?:(?:[A-G])(?:#|b)?(?:maj|min|m|M|\+|-|dim|aug)?[0-9]*(?:sus)?[0-9]*(?:b|#)?[0-9]*(?:\/[A-G](?:b|#)?)?)(?:[^\S\r\n]|$)+)+)/gm;

  removed = removed.replace(regDoubleChordLines, "$1\n\n$2");

  return removed;
};

// const cleanupComments = (content: string) => {
//   let removed = content;

//   // replace [comment] with # comment
//   // when using /gm we can use ^ and $ to match single lines
//   const regex = /^\[([\w\s]{3,})\][\s|\r|\n]*$/gm;

//   removed = removed.replace(regex, '# $1');

//   return removed;
// };
