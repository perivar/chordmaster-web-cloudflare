import { fetchSongData } from "../fetchSongData";
import {
  cleanupNorTabsChordsContent,
  parseNorTabsChords,
} from "../scrapeUtils";
import {
  fetchUrl,
  toPlainObject,
  writeSongAsJson,
  writeSongAsText,
} from "./testMethods";

// set this to true to debug the outputs to file
const DO_DEBUG_FILE = false;

// set this to true to debug the outputs as objects
const DO_DEBUG_OBJECT = false;

const fetchSongTest = async (url: string) => {
  const songData = await fetchSongData(url);

  if (DO_DEBUG_OBJECT) console.log(JSON.stringify(songData, null, 2));

  writeSongAsText(
    songData.chordPro!,
    DO_DEBUG_FILE,
    "debug/debugFetchSong.txt"
  );
  writeSongAsJson(songData, DO_DEBUG_FILE, "debug/debugFetchSong.json");

  return songData;
};

test("fetchSongData Christmas", async () => {
  const result = await fetchSongTest(
    "https://raw.githubusercontent.com/pathawks/Christmas-Songs/master/Angels%20From%20The%20Realms%20Of%20Glory.cho"
  );
  expect(toPlainObject(result)).toStrictEqual({
    artist: "Public Domain",
    songName: "Angels From The Realms Of Glory",
    chordPro:
      "{title: Angels From The Realms Of Glory}\n{subtitle:}\n{text: James Montgomery}\n{music: Henry Smart}\n{flow: Verse 1,Chorus,Verse 2,Chorus,Verse 3,Chorus,Verse 4,Chorus}\n{ccli: 31669}\n{time: 4/4}\n{key: Bb}\n{capo: 3}\n# This song is believed to be in the public domain. More information can be found at:\n#   http://www.pdinfo.com/PD-Music-Genres/PD-Christmas-Songs.php\n#   http://www.ccli.com/Licenseholder/Search/SongSearch.aspx?s=31669\n\n{start_of_verse}\n[G]Angels, from the realms of glory,\n[C]Wing your [G]flight o'er [D]all the [G]earth;\n[G]Ye, who sang creation's [Em/B]sto[B]ry,\n[Em]Now proclaim Mes[A]siah's [D]birth:\n{end_of_verse}\n\n{soc}\n[D]Come and worship,\n[G]Come and [C]worship,\n[Am]Worship [C]Christ, the [D]newborn [G]King\n{eoc}\n\n{start_of_verse}\n[G]Shepherd's in the field abiding,\n[C]Watching [G]o'er your [D]flocks by [G]night;\n[G]God with man is now re[Em/B]si[B]ding,\n[Em]Yonder shines the [A]infant [D]light:\n{end_of_verse}\n\n{start_of_verse}\n[G]Sages, leave your contemplations,\n[C]Brighter [G]visions [D]beam a[G]far;\n[G]Seek the great Desire of [Em/B]na[B]tions,\n[Em]Ye have seen His [A]natal [D]star:\n{end_of_verse}\n\n# Verse 4 from Salisbury Hymn-Book, 1857\n#   http://books.google.com/books?id=or9VAAAAcAAJ&pg=PA43#v=onepage&q&f=false\n{start_of_verse}\n[G]Saints and angels join in praising\n[C]Thee; the [G]Father, [D]Spirit, [G]Son!\n[G]Evermore their voices [Em/B]rais[B]ing\n[Em]to th'eternal [A]Three in [D]One.\n{end_of_verse}\n",
    url: "https://raw.githubusercontent.com/pathawks/Christmas-Songs/master/Angels%20From%20The%20Realms%20Of%20Glory.cho",
    source: "Public Domain Christmas Songs",
  });
});

test("fetchUrl NorTab", async () => {
  const url = "https://nortabs.net/tab/6878/";
  const htmlResult = await fetchUrl(url);

  const { content } = parseNorTabsChords(htmlResult);

  writeSongAsText(content!, DO_DEBUG_FILE, "debug/debugFetchRawNorTab.txt");

  const cleanedContent = cleanupNorTabsChordsContent(content as string, true);

  writeSongAsText(
    cleanedContent,
    DO_DEBUG_FILE,
    "debug/debugFetchRawNorTabCleaned.txt"
  );

  expect(toPlainObject(cleanedContent)).toStrictEqual(
    `  C        F         C     G7
Innover fjorden en snekke gled,
 C        G7     C
akk hvor timene flyr.
   C     F         C     C#dim
Bakenom åsen gikk solen ned,
 G             D7   G
da vi kom til Dyna fyr.
 Dm   G7     C           Am
Været er så vakkert sa Johan,
 D9            G 
skal vi gå i land ?

               C       C+5   Am/C  D9
Så gikk vi en deilig sommernatt i land på 
 G
Hovedøen.
                 Dm     Dmmaj7 Dm7   G7
Vi fant oss en vakker knatt og satt og så 
   C
utover sjøen
    E7 E7+5  F             F#dim7
småfugler sang i busk og kratt så jeg ble 
  C
nesten matt.
     G7        C        C+5  D9
Det hender så mangt på Hovedøen en 
 G7        C
midtsommernatt.

Timevis satt vi der hånd i hånd
og han sa så mye pent,
om at vi knyttet et elskovsbånd
slik var det i all fall ment.
Og jeg var så ung og dum enda
trodde alt han sa.

Det var slik en deilig sommernatt på gamle Hovedøen,
og Gud vet hvor lenge vi satt å så utover sjøen.
Småfugler sang i busk og kratt så jeg ble rent betatt.
Det hender så mangt på Hovedøen en midtsommernatt.

Kjærlighets lykke kan gå i knas
elskovsild blir til is.
Tenk at vår herlige lystseilas
endte med totalt forlis.
Derfor ber og råder jeg enhver
pike fra fjern og nær.

Gå aldri en deilig sommernatt i land på Hovedøen.
Sitt aldri forelsket og betatt og se utover sjøen.
Sky alt som heter busk og kratt og hus for allting at,
det hender så mangt på Hovedøen en midtsommernatt.`
  );
});

test("fetchSongData NorTab", async () => {
  const result = await fetchSongTest("https://nortabs.net/tab/6878/");
  expect(toPlainObject(result)).toStrictEqual({
    artist: "Kari Diesen",
    songName: "På Hovedøen",
    chordPro:
      "In[C]nover fjo[F]rden en sn[C]ekke g[G7]led,\na[C]kk hvor t[G7]imene f[C]lyr.\nBak[C]enom å[F]sen gikk s[C]olen n[C#dim]ed,\nd[G]a vi kom til D[D7]yna f[G]yr.\nV[Dm]æret [G7]er så v[C]akkert sa Jo[Am]han,\ns[D9]kal vi gå i la[G]nd ?\n\nSå gikk vi en d[C]eilig so[C+]mmerna[Am/C]tt i l[D9]and på\nH[G]ovedøen.\nVi fant oss en va[Dm]kker kn[Dmmaj7]att og [Dm7]satt o[G7]g så\nuto[C]ver sjøen\nsmåf[E7]ugl[E7(#5)]er san[F]g i busk og kr[F#dim7]att så jeg ble\nne[C]sten matt.\nDet h[G7]ender så m[C]angt på H[C+]ovedø[D9]en en\nm[G7]idtsommern[C]att.\n\nTimevis satt vi der hånd i hånd\nog han sa så mye pent,\nom at vi knyttet et elskovsbånd\nslik var det i all fall ment.\nOg jeg var så ung og dum enda\ntrodde alt han sa.\n\nDet var slik en deilig sommernatt på gamle Hovedøen,\nog Gud vet hvor lenge vi satt å så utover sjøen.\nSmåfugler sang i busk og kratt så jeg ble rent betatt.\nDet hender så mangt på Hovedøen en midtsommernatt.\n\nKjærlighets lykke kan gå i knas\nelskovsild blir til is.\nTenk at vår herlige lystseilas\nendte med totalt forlis.\nDerfor ber og råder jeg enhver\npike fra fjern og nær.\n\nGå aldri en deilig sommernatt i land på Hovedøen.\nSitt aldri forelsket og betatt og se utover sjøen.\nSky alt som heter busk og kratt og hus for allting at,\ndet hender så mangt på Hovedøen en midtsommernatt.",
    url: "https://nortabs.net/tab/6878/",
    source: "nortabs",
  });
});
