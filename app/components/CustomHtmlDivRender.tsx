import CustomHtmlDivFormatter from "~/utils/CustomHtmlDivFormatter";
import { Song } from "chordsheetjs";

// make sure to import
// import styles from "~/styles/chordsheet-orig.css?url";

interface CustomHtmlDivRenderProps {
  song: Song;
  fontSize?: number;
}

export const CustomHtmlDivRender = ({
  song,
  fontSize = 14,
}: CustomHtmlDivRenderProps) => {
  let htmlSong = "";
  try {
    htmlSong = new CustomHtmlDivFormatter().format(song, fontSize);
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
    } else {
      throw e;
    }
  }

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: htmlSong,
      }}></div>
  );
};
