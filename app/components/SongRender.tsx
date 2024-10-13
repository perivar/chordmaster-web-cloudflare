import {
  ARTIST,
  COLUMN_BREAK,
  COMMENT,
  END_OF_CHORUS,
  END_OF_TAB,
  END_OF_VERSE,
  START_OF_CHORUS,
  START_OF_TAB,
  START_OF_VERSE,
  TITLE,
} from "~/utils/ChordSheetConstants";
import ChordSheetJS, { ChordLyricsPair, Line, Song } from "chordsheetjs";

interface Props {
  song: Song;
  onPressChord?: (chord: string) => void;
  onPressArtist?: () => void;
  scrollSpeed?: number;
  fontSize?: number;
}

export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 26;
export const FONT_SIZE_STEP = 2;

// Mapping font size numbers to Tailwind text classes
export const FONT_SIZE_MAPPING: Record<number, string> = {
  12: "text-xs", // 12px
  14: "text-sm", // 14px
  16: "text-base", // 16px
  18: "text-lg", // 18px
  20: "text-xl", // 20px
  22: "text-2xl", // 24px
  24: "text-3xl", // 30px
  26: "text-4xl", // 36px
  28: "text-5xl", // 48px
  30: "text-6xl", // 60px
  32: "text-7xl", // 72px
  34: "text-8xl", // 96px
  36: "text-9xl", // 128px
};

// Available font sizes as an array for easier manipulation
export const FONT_SIZES = Object.keys(FONT_SIZE_MAPPING).map(Number);

// Main component for rendering the chord sheet
const SongRender = (props: Props) => {
  const { song, scrollSpeed = 0, fontSize = 14 } = props;

  const isStartOfTabs = (line: Line) => {
    return line.items.some(
      i => i instanceof ChordSheetJS.Tag && i.name === START_OF_TAB
    );
  };

  const isEndOfTabs = (line: Line) => {
    return line.items.some(
      i => i instanceof ChordSheetJS.Tag && i.name === END_OF_TAB
    );
  };

  const getLiteral = (line: Line) => {
    let literal = "";
    line.items.forEach(item => {
      if (item instanceof ChordSheetJS.Literal) {
        literal = literal + item.string;
      }
    });
    return literal;
  };

  const getTabStringArray = (startAtIndex: number) => {
    const tabArray: string[] = [];
    let line = song.lines[startAtIndex];
    do {
      const tabLine = getLiteral(line);
      if (tabLine !== "") {
        tabArray.push(tabLine);
      }
      startAtIndex++;
      line = song.lines[startAtIndex];
    } while (line !== null && !isEndOfTabs(line));
    return tabArray;
  };

  // The transposeArray function takes an array of strings and transposes it,
  // essentially turning columns into rows.
  const transposeArray = (array: string[]) => {
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
  };

  const handleChordClick = (chord: string) => {
    if (props.onPressChord) {
      props.onPressChord(chord);
    }
  };

  // Function to render a single ChordLyricsPair (handling both chords and lyrics)
  const renderChordLyricsPair = (item: ChordLyricsPair, key: string) => {
    const { chords: chordName, lyrics } = item;

    return (
      <div className="column" key={key}>
        {chordName ? (
          <div
            role="button"
            tabIndex={0}
            onKeyDown={() => {}}
            className="chord"
            onClick={() => handleChordClick(chordName)}>
            {chordName}
          </div>
        ) : (
          <div className="chord"></div>
        )}
        {<div className="lyrics">{lyrics}</div>}
      </div>
    );
  };

  // Function to render the parsed song
  const renderSong = () => {
    let waitEndOfTabs = false;

    return song.lines.map((line, lineIndex) => {
      // If we're inside a tab, check if it's the end of the tab block
      if (waitEndOfTabs) {
        if (isEndOfTabs(line)) {
          waitEndOfTabs = false; // Reset the flag when the tab ends
        }
        // Skip rendering this line
        return null;
      }

      // Check if the line is the start of a tab block
      if (isStartOfTabs(line)) {
        waitEndOfTabs = true; // Set the flag to true to wait for the end of the tab

        // Get the tab string array and transpose if necessary
        const tabStringArray = getTabStringArray(lineIndex);
        const transposedArray = transposeArray(tabStringArray);

        // Render the tab block
        return (
          <div key={`tab-${lineIndex}`} className="tab">
            {transposedArray.map((tabLine, tabIndex) => (
              <div key={`tab-line-${tabIndex}`} className="tab-line">
                {tabLine}
              </div>
            ))}
          </div>
        );
      }

      // Normal rendering for non-tab lines
      return (
        <div key={lineIndex} className="row">
          {line.items.map((item, itemIndex) => {
            const key = `${lineIndex}${itemIndex}`;
            if (item instanceof ChordSheetJS.ChordLyricsPair) {
              return renderChordLyricsPair(item, key);
            } else if (
              item instanceof ChordSheetJS.Tag &&
              item.name &&
              item.name === TITLE
            ) {
              return (
                <div key={key} className="title">
                  {item.value}
                </div>
              );
            } else if (
              item instanceof ChordSheetJS.Tag &&
              item.name &&
              item.name === ARTIST
            ) {
              return (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  onKeyDown={() => {}}
                  className="artist"
                  onClick={props.onPressArtist}>
                  {item.value}
                </div>
              );
            } else if (
              item instanceof ChordSheetJS.Tag &&
              item.name &&
              item.name === START_OF_VERSE
            ) {
              return (
                <div key={key} className="comment">
                  {"Verse"} {item.value ?? ""}
                </div>
              );
            } else if (
              item instanceof ChordSheetJS.Tag &&
              item.name &&
              item.name === END_OF_VERSE
            ) {
              // ignore
            } else if (
              item instanceof ChordSheetJS.Tag &&
              item.name &&
              item.name === START_OF_CHORUS
            ) {
              return (
                <div key={key} className="comment">
                  {"Chorus"} {item.value ?? ""}
                </div>
              );
            } else if (
              item instanceof ChordSheetJS.Tag &&
              item.name &&
              item.name === END_OF_CHORUS
            ) {
              // ignore
            } else if (
              item instanceof ChordSheetJS.Tag &&
              item.name &&
              item.name === COLUMN_BREAK
            ) {
              return (
                <div key={key} className="paragraph">
                  &nbsp;
                </div>
              );
            } else if (
              item instanceof ChordSheetJS.Tag &&
              item.name &&
              item.name === COMMENT
            ) {
              // tag comments have name 'comment' and the comment as value
              return (
                <div key={key} className="comment">
                  {item.value}
                </div>
              );
            } else if (
              item instanceof ChordSheetJS.Tag &&
              item.name &&
              item.value &&
              item.value !== null
            ) {
              return (
                <div key={key} className="w-full">
                  <div className="meta-label">{item.name}</div>
                  <div className="meta-value">{item.value}</div>
                </div>
              );
            } else if (item instanceof ChordSheetJS.Comment && item.content) {
              return (
                <div key={key} className="comment">
                  {item.content}
                </div>
              );
            } else {
              // ignore
              return (
                <div key={key} className="comment">
                  {item.toString()}
                </div>
              );
            }
          })}
        </div>
      );
    });
  };

  return (
    <div className={`chord-sheet ${FONT_SIZE_MAPPING[fontSize]}`}>
      <div>{renderSong()}</div>
    </div>
  );
};

export default SongRender;
