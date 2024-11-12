// https://gist.github.com/hyvyys/a8601e11af1ba145595f82896393d6f1

// Define the regex for a single chord
export function getChordRegex(flags = "g") {
  const note = "[A-H][b#]?"; // Root note, supporting accidentals and European 'H'
  const altered = `(?:5|dim(?:5|7)?|aug5?|\\+5?|-5?)`; // Altered chords (e.g., dim7, aug)
  const minor = "(?:mi?n?)"; // Minor chords (e.g., m, min)
  const major = "(?:maj?|Ma?j?)"; // Major chords
  const majorableExt = `(?:6|7|9|11|13)`; // Major/minor extensions
  const ext = `(?:2|4|6|7|9|11|13|6\\/9)`; // General extensions (with added 2)
  const modComponent = "(?:[b-](?:5|6|9|13)|[#+](?:4|5|9|11))"; // Sharp/flat/bass mods
  const mod = `(?:\\(${modComponent}\\)|${modComponent})`; // Modifiers, optional parentheses
  const sus = "(?:sus(?:2|4|24|2sus4)?)"; // Suspended chords (sus4, sus2)
  const add = "(?:add[b#]?(?:2|4|6|7|9|11|13))"; // Added notes (e.g., add9)
  const bass = `(?:\\/${note})`; // Bass/root slash chords

  const innerChord =
    `(?:${minor}?(?:${ext}|${major}?${majorableExt})?)` + // Minor and major chords with extensions
    `${mod}*` + // Optional modifiers w optional parenthesis
    `${sus}?` + // Optional suspended chords
    `${mod}*` + // Optional additional modifiers w optional parenthesis
    `${add}?`; // Optional added notes

  // Extensions within parentheses, e.g., (add9), (Maj7)
  const parentheticalContent =
    `(?:${major}?${majorableExt}?)` + // Major chords with extensions
    `${modComponent}*` + // Optional modifiers wo parenthesis
    `${sus}?` + // Optional suspended chords
    `${modComponent}*` + // Optional modifiers wo parenthesis
    `${add}?`; // Optional added notes

  // Parenthesized logic
  const parenthesized = `\\(${parentheticalContent}\\)`;

  const lookahead = "(?=$|\\s)"; // Ensure no trailing characters break it

  const source =
    `${note}` + // Root note
    `(?:` +
    `${altered}` + // Altered chords
    `|` +
    `(?:${innerChord})` + // Main chord definition
    `(?:${parenthesized})?` + // Parenthesis handling here
    `)` +
    `${bass}?` + // Optional slash notation for bass
    `${lookahead}`; // Ensure no trailing characters

  // result:
  // /[A-H][b#]?(?:(?:5|dim(?:5|7)?|aug5?|\+5?|-5?)|(?:(?:mi?n?)?(?:(?:2|4|6|7|9|11|13|6\/9)|(?:maj?|Ma?j?)?(?:6|7|9|11|13))?)(?:\((?:[b-](?:5|6|9|13)|[#+](?:4|5|9|11))\)|(?:[b-](?:5|6|9|13)|[#+](?:4|5|9|11)))*(?:sus(?:2|4|24|2sus4)?)?(?:\((?:[b-](?:5|6|9|13)|[#+](?:4|5|9|11))\)|(?:[b-](?:5|6|9|13)|[#+](?:4|5|9|11)))*(?:add[b#]?(?:2|4|6|7|9|11|13))?)(?:\/[A-H][b#]?)?(?=$| )/gm

  return new RegExp(source, flags); // Return compiled regex
}

// Define the regex for a chord line (one or more chords) separated by whitespaces only
export function getChordLineRegex(flags = "g") {
  const space = `[^\\S\\r\\n]`; // Match whitespace, excluding line breaks
  const space_or_end = `(?:${space}|$)`; // Match either a space or the end of the line
  const source =
    `^${space}*` + // Match the start of the line with optional leading spaces
    `(?:` +
    `(?:${getChordRegex().source})` + // Match a chord using getChordRegex
    `${space_or_end}+` + // Ensure each chord is followed by spaces or line end
    `)+` + // Allow multiple chords in a line
    `${space_or_end}+`; // Ensure there is nothing else on the line than chords

  return new RegExp(source, flags); // Return compiled regex
}

// Define the regex for double chord lines (two chord lines separated by exactly one newline)
export function getDoubleChordLinesRegex(flags = "g") {
  const source = `(${getChordLineRegex().source})\n(${getChordLineRegex().source})`;

  return new RegExp(source, flags); // Return compiled regex
}
