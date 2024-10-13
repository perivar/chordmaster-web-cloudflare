// import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
// import {
//   ARTIST,
//   COLUMN_BREAK,
//   COMMENT,
//   END_OF_CHORUS,
//   END_OF_VERSE,
//   START_OF_CHORUS,
//   START_OF_VERSE,
//   TITLE,
// } from "~/utils/ChordSheetConstants";
// import ChordSheetJS, { ChordLyricsPair, Song } from "chordsheetjs";

// const styles = StyleSheet.create({
//   page: {
//     paddingVertical: 20,
//     paddingHorizontal: 30,
//   },
//   title: {
//     fontFamily: "Times-Roman",
//     fontSize: 18,
//     flexGrow: 1,
//     textAlign: "center",
//   },
//   artist: {
//     fontFamily: "Times-Roman",
//     fontSize: 14,
//     flexGrow: 1,
//     textAlign: "center",
//   },
//   comment: {
//     fontSize: 10,
//     fontStyle: "italic",
//     color: "#2563EB",
//   },
//   tab: {
//     fontSize: 10,
//     fontFamily: "Courier",
//   },
//   songLine: {
//     fontSize: 10,

//     display: "flex",
//     flexDirection: "row",
//     flexWrap: "wrap",
//     minHeight: 20,

//     // padding: 6,
//     // marginBottom: 4,
//     // borderRadius: 2,
//     // backgroundColor: "#F3F4F6",
//   },
//   chordLyricPair: {
//     display: "flex",
//     flexDirection: "column",
//     // marginRight: 6,
//     justifyContent: "flex-end",
//     alignItems: "flex-start",

//     // padding: 2,
//     // borderRadius: 2,
//     // borderWidth: 1,
//     // borderColor: "#D1D5DB",
//     // backgroundColor: "#ffffff",
//   },
//   chordLine: {
//     fontFamily: "Courier",
//     whiteSpace: "nowrap",
//     color: "#b22",

//     paddingRight: 6,
//   },
//   lyricLine: {
//     fontFamily: "Courier",
//     whiteSpace: "nowrap",
//   },
//   metaContainer: {
//     fontSize: 10,
//     display: "flex",
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   metaLabel: {
//     color: "#6B7280",
//     display: "flex",
//     width: "8%",
//   },
//   metaValue: {
//     color: "#10B981",
//     overflowWrap: "break-word",
//     display: "flex",
//     width: "92%",
//   },
//   paragraph: {
//     marginBottom: 10,
//   },
// });

// interface Props {
//   song: Song;
//   fontSize?: number;
// }

// // Helper to render a single ChordLyricsPair (chord + lyrics)
// const renderChordLyricsPair = (item: ChordLyricsPair, key: string) => {
//   let { lyrics } = item;
//   const chordName = item.chords;
//   if (lyrics && lyrics.length <= chordName.length) {
//     lyrics = lyrics + " ".repeat(chordName.length - lyrics.length + 1);
//   }

//   return (
//     <View key={key} style={styles.chordLyricPair} wrap={false}>
//       {/* Chords above the lyrics */}
//       <Text style={styles.chordLine}>
//         {chordName}
//         {"\u200B"} {/* Zero-width space */}
//       </Text>
//       <Text style={styles.lyricLine}>{lyrics || "\u200B"}</Text>
//     </View>
//   );
// };

// // Main component for rendering the song in PDF format
// const SongPDFRender = ({ song, fontSize = 14 }: Props) => {
//   const renderSong = () => {
//     return song.lines.map((line, index) => (
//       <View key={index} style={styles.songLine}>
//         {line.items.map((item, itemIndex) => {
//           const key = `${index}-${itemIndex}`;
//           if (item instanceof ChordSheetJS.ChordLyricsPair) {
//             return renderChordLyricsPair(item, key);
//           } else if (item instanceof ChordSheetJS.Tag) {
//             if (item.name === TITLE) {
//               return (
//                 <Text key={key} style={styles.title}>
//                   {item.value}
//                 </Text>
//               );
//             } else if (item.name === ARTIST) {
//               return (
//                 <Text key={key} style={styles.artist}>
//                   {item.value}
//                 </Text>
//               );
//             } else if (item.name === START_OF_VERSE) {
//               return (
//                 <Text key={key} style={styles.comment}>
//                   {"Verse"} {item.value ?? ""}
//                 </Text>
//               );
//             } else if (item.name === END_OF_VERSE) {
//               // Ignore
//               return null;
//             } else if (item.name === START_OF_CHORUS) {
//               return (
//                 <Text key={key} style={styles.comment}>
//                   {"Chorus"} {item.value ?? ""}
//                 </Text>
//               );
//             } else if (item.name === END_OF_CHORUS) {
//               // Ignore
//               return null;
//             } else if (item.name === COLUMN_BREAK) {
//               return (
//                 <Text key={key} style={styles.paragraph}>
//                   &nbsp;
//                 </Text>
//               );
//             } else if (item.name === COMMENT) {
//               // Tag comments have name 'comment' and the comment as value
//               return (
//                 <Text key={key} style={styles.comment}>
//                   {item.value}
//                 </Text>
//               );
//             } else if (item.name && item.value !== null) {
//               return (
//                 <View key={key} style={styles.metaContainer}>
//                   <Text style={styles.metaLabel}>{item.name}</Text>
//                   <Text style={styles.metaValue}>{item.value}</Text>
//                 </View>
//               );
//             }
//           } else if (item instanceof ChordSheetJS.Comment && item.content) {
//             return (
//               <Text key={key} style={styles.comment}>
//                 {item.content}
//               </Text>
//             );
//           } else {
//             // Ignore unrecognized item types
//             return null;
//           }
//         })}
//       </View>
//     ));
//   };

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {renderSong()}
//       </Page>
//     </Document>
//   );
// };

// export default SongPDFRender;
