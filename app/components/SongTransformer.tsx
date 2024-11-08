import { FunctionComponent } from "react";
import { convertSongToMySong } from "~/utils/convertSongToMySong";
import ChordSheetJS, { Song } from "chordsheetjs";
import { TriangleAlert } from "lucide-react";

import { MySong } from "~/lib/MySong";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface SongProps {
  chords: string[];
  transformedSong: MySong;
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

const SongTransformer: FunctionComponent<Props> = props => {
  const { showTabs = true, transposeDelta = 0 } = props;

  let { chordProSong } = props;

  let song: Song;
  let mySong: MySong;
  let allChords: string[];

  let transposedSong: MySong;

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

  try {
    mySong = convertSongToMySong(song);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      return showErrorMessage("MySong Converter", e);
    } else {
      throw e;
    }
  }

  try {
    // always do the transpose method, to ensure the chords are checked (and repaired) before returning
    // if (transposeDelta !== 0) {
    transposedSong = mySong.transpose(transposeDelta);
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
    allChords = transposedSong.getChords();
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
