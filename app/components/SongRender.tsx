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

import {
  MyChordLyricsPair,
  MyComment,
  MyLine,
  MyLiteral,
  MySong,
  MyTag,
} from "~/lib/MySong";

interface Props {
  song: MySong;
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

  const isStartOfTabs = (line: MyLine) => {
    return line.items.some(i => i instanceof MyTag && i.name === START_OF_TAB);
  };

  const isEndOfTabs = (line: MyLine) => {
    return line.items.some(i => i instanceof MyTag && i.name === END_OF_TAB);
  };

  const getLiteral = (line: MyLine) => {
    let literal = "";
    line.items.forEach(item => {
      if (item instanceof MyLiteral) {
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
  const renderChordLyricsPair = (item: MyChordLyricsPair, key: string) => {
    const { chords: chordName, lyrics } = item;

    // only render a chord or a lyrics if it exist
    // use css to handle top or bottom alignment if one of them is missing
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

      // Check if we want to skip the line (e.g., END_OF_VERSE or END_OF_CHORUS)
      const isSkipLine = line.items.some(
        item =>
          item instanceof MyTag &&
          (item.name === END_OF_VERSE || item.name === END_OF_CHORUS)
      );

      if (!isSkipLine) {
        return (
          <div key={`row-${lineIndex}`} className="row">
            {line.items.map((item, itemIndex) => {
              const key = `column-${lineIndex}-${itemIndex}`;

              // Handle ChordLyricsPair
              if (item instanceof MyChordLyricsPair) {
                return renderChordLyricsPair(item, key);
              }

              // Handle Tags
              if (item instanceof MyTag && item.name) {
                switch (item.name) {
                  case TITLE:
                    return (
                      <div key={key} className="title">
                        {item.value}
                      </div>
                    );
                  case ARTIST:
                    return (
                      <div
                        key={key}
                        role="button"
                        tabIndex={0}
                        className="artist"
                        onClick={props.onPressArtist}
                        onKeyDown={() => {}}>
                        {item.value}
                      </div>
                    );
                  case START_OF_VERSE:
                    return (
                      <div key={key} className="comment">
                        {"Verse"} {item.value ?? ""}
                      </div>
                    );
                  case START_OF_CHORUS:
                    return (
                      <div key={key} className="comment">
                        {"Chorus"} {item.value ?? ""}
                      </div>
                    );
                  case COLUMN_BREAK:
                    return (
                      <div key={key} className="paragraph">
                        &nbsp;
                      </div>
                    );
                  case COMMENT:
                    return (
                      <div key={key} className="comment">
                        {item.value}
                      </div>
                    );
                  default:
                    if (item.name && item.value) {
                      return (
                        <div key={key} className="w-full">
                          <div className="meta-label">{item.name}</div>
                          <div className="meta-value">{item.value}</div>
                        </div>
                      );
                    }
                    break;
                }
              }

              // Handle Comments
              if (item instanceof MyComment && item.content) {
                return (
                  <div key={key} className="comment">
                    {item.content}
                  </div>
                );
              }

              // Fallback rendering
              return (
                <div key={key} className="comment">
                  {item.toString()}
                </div>
              );
            })}
          </div>
        );
      }
    });
  };

  return (
    <div className={`chord-sheet ${FONT_SIZE_MAPPING[fontSize]}`}>
      {renderSong()}
    </div>
  );
};

export default SongRender;
