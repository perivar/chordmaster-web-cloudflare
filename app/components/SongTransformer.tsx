import { FunctionComponent } from "react";
import ChordSheetJS, {
  Chord,
  ChordLyricsPair,
  Comment,
  Literal,
  Song,
  Tag,
  Ternary,
} from "chordsheetjs";
import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

// have to copy this from the chordsheetjs main.d.ts since it's not exported
type Item = ChordLyricsPair | Comment | Tag | Ternary | Literal;

interface SongProps {
  chords: Chord[];
  transformedSong: Song;
}

interface Props {
  chordProSong?: string;
  chordSheetSong?: string;
  transposeDelta?: number;
  showTabs?: boolean;
  children(props: SongProps): JSX.Element;
}

const showErrorMessage = (area: string, e: Error): JSX.Element | null => {
  if (e instanceof Error) {
    return (
      <div className="p-4">
        <Alert
          className="flex flex-col items-center justify-center p-4"
          variant="destructive">
          <AlertTitle className="flex items-center space-x-2 text-lg">
            <TriangleAlert className="size-6" />
            <span>Error in {area}</span>
          </AlertTitle>
          <AlertDescription className="text-center">
            {e.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null; // Return null if `e` is not an instance of `Error`
};

const processChord = (item: Item, processor: (parsedChord: Chord) => Chord) => {
  if (item instanceof ChordSheetJS.ChordLyricsPair) {
    if (item.chords) {
      const parsedChord = ChordSheetJS.Chord.parse(item.chords);

      if (parsedChord) {
        const processedChord = processor(parsedChord);

        // return a ChordLyricsPair where the chords have been processed
        const processedChordLyricsPair = item.clone();
        processedChordLyricsPair.chords = processedChord.toString();
        return processedChordLyricsPair;
      }
    }
  } else if (item instanceof ChordSheetJS.Comment && item.content) {
    // check if the comment also contains chords
    // let commentSong = new ChordProParser().parse(item.content);
    // commentSong = transformSong(commentSong, processor);
    // item.content = new ChordProFormatter().format(commentSong);
  } else if (item instanceof ChordSheetJS.Tag && item.name) {
    // ignore
  } else {
    console.log(
      "processChord -> neither chord, tag or comment:",
      item.toString()
    );
  }

  return item;
};

const transformSong = (
  song: Song,
  processor: (parsedChord: Chord) => Chord
) => {
  song.lines = song.lines.map(line => {
    const items = line.items.map(item => processChord(item, processor));
    line.items = items;
    return line;
  });
  return song;
};

export const transposeSong = (song: Song, transposeDelta: number) => {
  const transformedSong = transformSong(song, chord => {
    let transformedChord = chord.transpose(transposeDelta);

    // Normalizes the chord root and bass notes:
    // Fb becomes E
    // Cb becomes B
    // B# becomes C
    // E# becomes F
    // Besides that it normalizes the suffix if `normalizeSuffix` is `true`.
    // For example, `sus2` becomes `2`, `sus4` becomes `sus`.
    // All suffix normalizations can be found in `src/normalize_mappings/suffix-mapping.txt`.
    transformedChord = transformedChord.normalize(null, {
      normalizeSuffix: false,
    });

    return transformedChord;
  });

  return transformedSong;
};

export const getChords = (song: Song): Chord[] => {
  const allChords: Chord[] = [];

  song.lines.forEach(line => {
    line.items.forEach(item => {
      if (item instanceof ChordSheetJS.ChordLyricsPair) {
        if (item.chords) {
          const parsedChord = ChordSheetJS.Chord.parse(item.chords);

          if (parsedChord) {
            // only add chord if not already exists
            if (!allChords.some(c => c.toString() === parsedChord.toString())) {
              allChords.push(parsedChord);
            }
          } else {
            // warning, we cannot parse this chord
            console.log("Warning could not parse chord:", item.chords);
          }
        }
      } else if (item instanceof ChordSheetJS.Comment && item.content) {
        // remove html stuff like %20
        let commentCleaned = item.content;
        commentCleaned = commentCleaned.replace(/%\d{2}/g, "");

        const commentSong = new ChordSheetJS.ChordProParser().parse(
          commentCleaned
        );
        getChords(commentSong).forEach(c => {
          if (!allChords.some(ac => ac.toString() === c.toString())) {
            allChords.push(c);
          }
        });
      } else if (item instanceof ChordSheetJS.Tag && item.name) {
        // ignore
      } else {
        console.log(
          "getChords -> neither chord, tag or comment:",
          item.toString()
        );
      }
    });
  });

  return allChords;
};

const SongTransformer: FunctionComponent<Props> = props => {
  const { showTabs = true, transposeDelta = 0 } = props;

  let { chordProSong } = props;

  let formattedSong: Song;
  let allChords: Chord[];
  let song: Song;

  try {
    if (chordProSong) {
      if (!showTabs) {
        chordProSong = chordProSong.replace(
          /{(sot|start_of_tab)[^{]*}(.|\n|\r)*?{(eot|end_of_tab)[^{]*}\r?\n?/g,
          ""
        );
      }
      song = new ChordSheetJS.ChordProParser().parse(chordProSong);
    } else {
      song = new ChordSheetJS.ChordSheetParser({
        preserveWhitespace: true,
      }).parse(props.chordSheetSong!);
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      return showErrorMessage("Parser", e);
    } else {
      throw e;
    }
  }

  let transposedSong = song;

  try {
    if (transposeDelta !== 0) {
      transposedSong = transposeSong(song, transposeDelta);
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      return showErrorMessage("Transpose", e);
    } else {
      throw e;
    }
  }

  try {
    allChords = getChords(transposedSong);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      return showErrorMessage("getChords", e);
    } else {
      throw e;
    }
  }

  try {
    // formattedSong = new CustomHtmlDivFormatter().format(transposedSong, fontSize);
    formattedSong = transposedSong;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      return showErrorMessage("Formatter", e);
    } else {
      throw e;
    }
  }

  return props.children({ chords: allChords, transformedSong: formattedSong });
};

export default SongTransformer;
