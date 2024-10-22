import { FunctionComponent } from "react";
import { getChordSheetJSChord } from "~/utils/getChordSheetJSChord";
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

type ChordProcessor = (chord: Chord) => Chord;

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

const processChord = (item: Item, chordProcessor: ChordProcessor) => {
  if (item instanceof ChordSheetJS.ChordLyricsPair) {
    if (item.chords) {
      const parsedChord = getChordSheetJSChord(item.chords);

      if (parsedChord) {
        const processedChord = chordProcessor(parsedChord);

        // return a ChordLyricsPair where the chords have been processed
        const processedChordLyricsPair = item.clone();
        processedChordLyricsPair.chords = processedChord.toString();
        return processedChordLyricsPair;
      }
    }
  }

  return item;
};

const transformSong = (song: Song, chordProcessor: ChordProcessor) => {
  song.lines = song.lines.map(line => {
    const items = line.items.map(item => processChord(item, chordProcessor));
    line.items = items;
    return line;
  });
  return song;
};

export const transposeSong = (song: Song, transposeDelta: number) => {
  // method to transpose and normalize the chord
  const chordTransposer = (chord: Chord): Chord => {
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
  };

  const transformedSong = transformSong(song, chordTransposer);
  return transformedSong;
};

export const getChords = (song: Song): Chord[] => {
  const allChords: Chord[] = [];

  song.lines.forEach(line => {
    line.items.forEach(item => {
      if (item instanceof ChordSheetJS.ChordLyricsPair) {
        if (item.chords) {
          const parsedChord = getChordSheetJSChord(item.chords);

          if (parsedChord) {
            // only add chord if not already exists
            if (!allChords.some(c => c.toString() === parsedChord.toString())) {
              allChords.push(parsedChord);
            }
          } else {
            // warning, we cannot parse this chord
            console.warn("Warning could not parse chord:", item.chords);
          }
        }
      }
    });
  });

  return allChords;
};

const SongTransformer: FunctionComponent<Props> = props => {
  const { showTabs = true, transposeDelta = 0 } = props;

  let { chordProSong } = props;

  let song: Song;
  let allChords: Chord[];

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
      song = new ChordSheetJS.ChordsOverWordsParser().parse(
        props.chordSheetSong!
      );
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      return showErrorMessage("ChordSheetJS Parser", e);
    } else {
      throw e;
    }
  }

  let transposedSong = song;

  try {
    // always do the transpose method, to ensure the chords are checked (and repaired) before returning
    // if (transposeDelta !== 0) {
    transposedSong = transposeSong(song, transposeDelta);
    // }
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

  return props.children({ chords: allChords, transformedSong: transposedSong });
};

export default SongTransformer;
