// // app/routes/songs.$id.pdf.tsx

// import { FunctionComponent, useEffect, useState } from "react";
// import { PDFViewer } from "@react-pdf/renderer";
// import { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
// import { useParams } from "@remix-run/react";
// import { useAppContext } from "~/context/AppContext";
// import { getChordPro } from "~/utils/getChordPro";
// import { useTranslation } from "react-i18next";

// import { ISong } from "~/lib/firestoreQueries";
// import LoadingIndicator from "~/components/LoadingIndicator";
// import SongPDFRender from "~/components/SongPDFRender";
// import SongTransformer from "~/components/SongTransformer";
// import styles from "~/styles/chordsheetjs.css?url";

// export const meta: MetaFunction = () => [
//   { title: "Song as PDF" },
//   { name: "description", content: "View Song as PDF" },
// ];

// export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

// interface SongAsProps {
//   content: string;
//   transpose: number;
//   showTabs: boolean;
//   fontSize: number;
// }

// const SongAsPDF: FunctionComponent<SongAsProps> = ({
//   content,
//   transpose,
//   showTabs,
//   fontSize,
// }) => {
//   return (
//     <SongTransformer
//       chordProSong={content}
//       transposeDelta={transpose}
//       showTabs={showTabs}>
//       {songProps => (
//         <PDFViewer width="100%" height="100%">
//           <SongPDFRender song={songProps.transformedSong} fontSize={fontSize} />
//         </PDFViewer>
//       )}
//     </SongTransformer>
//   );
// };

// export default function SongViewPDF() {
//   const { t } = useTranslation();

//   const params = useParams();
//   const songIdParam = params.id;

//   const { state } = useAppContext();
//   const songs = state.songs;
//   const userAppConfig = state.userAppConfig;

//   const [song, setSong] = useState<ISong>();
//   const [fontSize, setFontSize] = useState<number>(userAppConfig.fontSize);
//   const [showTabs, setShowTabs] = useState(userAppConfig.showTablature);

//   const [content, setContent] = useState<string>("");
//   const [transpose, setTranspose] = useState<number>(0);

//   useEffect(() => {
//     if (!songs) return;

//     // Find the song by ID in the cached data
//     const foundSong = songs.find(s => s.id === songIdParam);
//     setSong(foundSong);
//   }, [songs, songIdParam]);

//   useEffect(() => {
//     if (song) {
//       setContent(getChordPro(song));

//       if (song.transposeAmount !== undefined) {
//         setTranspose(song.transposeAmount);
//       }

//       if (song.fontSize !== undefined) {
//         setFontSize(song.fontSize);
//       }

//       if (song.showTablature !== undefined) {
//         setShowTabs(song.showTablature);
//       }
//     }
//   }, [song]);

//   if (!content) {
//     return <LoadingIndicator title={t("no_content_found")} />;
//   }

//   return (
//     <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
//       <SongAsPDF
//         content={content}
//         transpose={transpose}
//         showTabs={showTabs}
//         fontSize={fontSize}
//       />
//     </div>
//   );
// }
