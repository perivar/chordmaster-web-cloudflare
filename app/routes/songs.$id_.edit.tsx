// app/routes/songs.$id.edit.tsx

import { useEffect, useState } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { Form, useNavigate, useParams } from "@remix-run/react";
import {
  addOrUpdateArtistReducer,
  addOrUpdateSongReducer,
  useAppContext,
} from "~/context/AppContext";
import { useFirebase } from "~/context/FirebaseContext";
import CustomUltimateGuitarFormatter from "~/utils/CustomUltimateGuitarFormatter";
import CustomUltimateGuitarParser from "~/utils/CustomUltimateGuitarParser";
import { getChordAlternatives } from "~/utils/getChordAlternatives";
import { getChordSymbol } from "~/utils/getChordSymbol";
import ChordSheetJS from "chordsheetjs";
import {
  BracketsIcon,
  ChevronDown,
  ChevronUp,
  ListMusicIcon,
  Music2Icon,
  ReplaceIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { IArtist } from "~/lib/firestoreQueries";
import useFirestore from "~/hooks/useFirestore";
import useFirestoreMethods from "~/hooks/useFirestoreMethods";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { useConfirm } from "~/components/layout/confirm-provider";
import LoadingIndicator from "~/components/LoadingIndicator";
import { TextInputModal } from "~/components/TextInputModal";
import styles from "~/styles/chordsheetjs.css?url";

export const meta: MetaFunction = () => [
  { title: "Song" },
  { name: "description", content: "Edit Song" },
];

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function SongEdit() {
  const { t } = useTranslation();
  const params = useParams();
  let songIdParam = params?.id;

  const navigate = useNavigate();
  const confirm = useConfirm();

  const { user } = useFirebase();

  const { state, dispatch } = useAppContext();
  const allSongs = state.songs;
  const song = allSongs.find(s => s.id === songIdParam);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [content, setContent] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const [error, setError] = useState<string | null>();
  const [mode, setMode] = useState<"CHORD_PRO" | "CHORD_SHEET">("CHORD_PRO");

  const [isReplaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceFromText, setReplaceFromText] = useState("");
  const [replaceWithText, setReplaceWithText] = useState("");

  const [isAddChordNotesModalOpen, setAddChordNotesModalOpen] = useState(false);
  const [addChordNotesText, setAddChordNotesText] = useState("");

  const [isAddChordModalOpen, setAddChordModalOpen] = useState(false);
  const [addChordText, setAddChordText] = useState("");

  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [selectedText, setSelectedText] = useState<string>();

  const [isChordsFieldFocused, setIsChordsFieldFocused] = useState(false);

  const [isSongDetailsOpen, setIsSongDetailsOpen] = useState(true);

  const { addNewSong, editSong, getArtistsByName, addNewArtist } =
    useFirestore();
  const { isLoading, loadSongData } = useFirestoreMethods();

  useEffect(() => {
    if (songIdParam && songIdParam !== "new") {
      loadSongData(songIdParam);
    }
  }, [songIdParam]);

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist.name);
      setContent(removeMetaTags(song.content));

      setSourceLabel(song.external.source ?? "");
      setSourceUrl(song.external.url ?? "");
    }
  }, [song]);

  useEffect(() => {
    // console.log(`Selection ${selection.start} to ${selection.end}`);

    if (selection && selection.start !== selection.end) {
      const selText = content.slice(selection.start, selection.end);
      // console.log(
      //   `Selected text from ${selection.start} to ${selection.end} is ${selText}`
      // );

      setSelectedText(selText);
    } else {
      setSelectedText(undefined);
    }
  }, [selection]);

  const doEncloseInBrackets = () => {
    if (selectedText) {
      // Enclose the selected chord in brackets
      const newContent =
        content.slice(0, selection.start) + // Get content before the selection
        "[" +
        selectedText +
        "]" + // Enclose selected text in brackets
        content.slice(selection.end); // Get content after the selection

      // Update the content state
      setContent(newContent);

      // Unselect by resetting the selection
      setSelection({ start: 0, end: 0 });
    }
  };

  const removeMetaTags = (text: string) => {
    text = text.replace(/{title:[^}]+}\n?/g, "");
    text = text.replace(/{t:[^}]+}\n?/g, "");
    text = text.replace(/{artist:[^}]+}\n?/g, "");
    text = text.replace(/{a:[^}]+}\n?/g, "");
    return text;
  };

  const handleReplaceText = () => {
    if (replaceFromText) {
      const newContent = content.split(replaceFromText).join(replaceWithText);
      setContent(newContent);
      setReplaceModalOpen(false);
    }
  };

  const handleAddChordNotes = () => {
    if (addChordNotesText) {
      setAddChordNotesModalOpen(false);

      if (selection && selection.start && selection.end) {
        // lookup alternative chord names
        const chordNotes = addChordNotesText.split(/[\s,.]/).filter(Boolean);
        // console.log('chordNotes', chordNotes);

        // lookup alternative chord names
        const alternatives = getChordAlternatives(chordNotes);
        const chordNames = alternatives.chordNames;
        // console.log('chordNames', chordNames);

        if (chordNames && chordNames.length > 0) {
          let chordText = chordNames[0]; // choose the first

          // make sure the chord name is formatted well
          chordText = getChordSymbol(chordText);

          // const chordPro = content;

          if (mode === "CHORD_PRO") {
            // enclose the chord in brackets
            chordText = "[" + chordText + "]";
          }

          // const newContent =
          //   chordPro.substring(0, selection.start) +
          //   chordText +
          //   chordPro.substring(selection.end, chordPro.length);

          const newContent =
            content.slice(0, selection.start) +
            chordText +
            content.slice(selection.end);

          setContent(newContent);
        } else {
          setError(
            `Aborting since we did not find a chord matching ${chordNotes.join(
              " "
            )}`
          );
        }
      }
    } else {
      setError(t("empty_field_not_allowed"));
    }
  };

  const handleAddChord = () => {
    if (addChordText) {
      const newContent =
        content.slice(0, selection.start) +
        `[${addChordText}]` +
        content.slice(selection.end);
      setContent(newContent);
      setAddChordModalOpen(false);
    } else {
      setError(t("empty_field_not_allowed"));
    }
  };

  const handleSaveSong = async () => {
    if (title.trim() === "") return setError(t("invalid_title"));
    if (artist.trim() === "") return setError(t("invalid_artist"));
    if (content.trim() === "") return setError(t("invalid_content"));

    const artistName = artist.trim();
    const songTitle = title.trim();
    let chordPro = content;

    const srcLabel = sourceLabel.trim();
    const srcUrl = sourceUrl.trim();

    if (mode === "CHORD_SHEET") {
      // original parser:
      // let chordSheetSong = new ChordSheetJS.ChordSheetParser({
      //   preserveWhitespace: false,
      // }).parse(content);

      // using custom ultimate guitar parser instead of the ChordSheet parser
      const chordSheetSong = new CustomUltimateGuitarParser({
        preserveWhitespace: false,
      }).parse(content);

      // Tested out ChordsOverWordsParser, but disabled for now:
      // let chordSheetSong = new ChordsOverWordsParser().parse(content);

      chordPro = new ChordSheetJS.ChordProFormatter().format(chordSheetSong);
    }

    let artistDb: IArtist;
    const artists = await getArtistsByName(artistName);
    if (artists && artists.length > 0) {
      artistDb = artists[0];
    } else {
      artistDb = await addNewArtist(artistName);
      await dispatch(addOrUpdateArtistReducer(artistDb));
    }

    if (songIdParam && songIdParam !== "new") {
      try {
        const updatedSong = await editSong(
          songIdParam,
          {
            id: artistDb.id,
            name: artistDb.name,
          },
          songTitle,
          chordPro,

          song?.external?.id,
          srcUrl ?? "",
          srcLabel ?? ""
        );

        // console.log('SongEdit -> editSong:', updatedSong);
        songIdParam = updatedSong.id;

        await dispatch(addOrUpdateSongReducer(updatedSong));
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          throw e;
        }
      }
    } else {
      try {
        if (!user) throw new Error("User object is undefined!");

        const newSong = await addNewSong(
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
          {
            id: artistDb.id,
            name: artistDb.name,
          },
          songTitle,
          chordPro,

          "",
          srcUrl ?? "",
          srcLabel ?? ""
        );

        // console.log('SongEdit -> addNewSong:', newSong);
        songIdParam = newSong.id;

        await dispatch(addOrUpdateSongReducer(newSong));
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          throw e;
        }
      }
    }

    navigate(`/songs/${songIdParam}`);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
  };

  const handleTabChange = (value: string) => {
    if (value === "chordpro") {
      switchToChordPro();
    } else {
      switchToChordSheet();
    }
  };

  const switchToChordPro = () => {
    try {
      // original parser:
      // let s = new ChordSheetJS.ChordSheetParser({
      //   preserveWhitespace: false,
      // }).parse(content);

      // using custom ultimate guitar parser instead of the ChordSheet parser
      const s = new CustomUltimateGuitarParser({
        preserveWhitespace: false,
      }).parse(content);

      // Tested out ChordsOverWordsParser, but disabled for now:
      // let s = new ChordsOverWordsParser().parse(content);

      // console.log('switchToChordPro:', s);
      const chordPro = new ChordSheetJS.ChordProFormatter().format(s);

      // console.log(chordPro);
      setContent(chordPro);
      setMode("CHORD_PRO");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        throw e;
      }
    }
  };

  const switchToChordSheet = () => {
    try {
      const s = new ChordSheetJS.ChordProParser().parse(content);
      // console.log('switchToChordSheet:', JSON.stringify(s, null, 2));

      // original text formatter
      // let plainText = new ChordSheetJS.TextFormatter().format(s);

      // use custom ultimate guitar formatter instead of the plaintext formatter
      const plainText = new CustomUltimateGuitarFormatter().format(s);

      // console.log(plainText);
      setContent(plainText);
      setMode("CHORD_SHEET");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        throw e;
      }
    }
  };

  const contentPlaceholder =
    mode === "CHORD_PRO"
      ? "You can edit any song here\n" +
        "U[C]sing the [Dm]chordPro format[G]\n\n\n"
      : "You can edit any song here\n" +
        " C              Dm          G\n" +
        "Using the chord sheet format\n\n\n";

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="mx-auto grid w-full">
      {error && (
        <p className="ml-4 mt-4 text-red-600 dark:text-red-400">{error}</p>
      )}

      <Form id="edit-form">
        <Collapsible
          open={isSongDetailsOpen}
          onOpenChange={setIsSongDetailsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="mx-4 my-2">
              {t("toggle_song_details")}
              {isSongDetailsOpen ? (
                <ChevronUp className="ml-2" />
              ) : (
                <ChevronDown className="ml-2" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mx-4 mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="song-title">{t("song_title")}</Label>
                <Input
                  id="song-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t("enter_song_title")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist-name">{t("artist_name")}</Label>
                <Input
                  id="artist-name"
                  value={artist}
                  onChange={e => setArtist(e.target.value)}
                  placeholder={t("enter_artist_name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source-label">{t("source_label")}</Label>
                <Input
                  id="source-label"
                  value={sourceLabel}
                  onChange={e => setSourceLabel(e.target.value)}
                  placeholder={t("enter_source_label")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source-url">{t("source_url")}</Label>
                <Input
                  id="source-url"
                  type="url"
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                  placeholder={t("enter_source_url")}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Tabs
          defaultValue="chordpro"
          className="w-full px-4"
          onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              value="chordpro">
              ChordPro
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              value="chords-over-lyrics">
              {t("chords_over_lyrics")}
            </TabsTrigger>
          </TabsList>

          <div className="mt-2 flex flex-row space-x-2">
            {!selectedText && isChordsFieldFocused && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setAddChordModalOpen(true)}>
                  <Music2Icon className="size-4" />
                  <span className="ml-2 hidden sm:block">{t("add_chord")}</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setAddChordNotesModalOpen(true)}>
                  <ListMusicIcon className="size-4" />
                  <span className="ml-2 hidden sm:block">
                    {t("add_chord_using_notes")}
                  </span>
                </Button>
              </>
            )}

            {selectedText && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setReplaceFromText(selectedText);
                    setReplaceModalOpen(true);
                  }}>
                  <ReplaceIcon className="size-4" />
                  <span className="ml-2 hidden sm:block">{t("replace")}</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await confirm({
                        title: `${t("enclose_in_brackets")}?`,
                        description: `${t("enclose_in_brackets_are_you_sure")}?`,
                      });
                      doEncloseInBrackets();
                    } catch (_err) {
                      // user canceled the dialog
                    }
                  }}>
                  <BracketsIcon className="size-4" />
                  <span className="ml-2 hidden sm:block">
                    {t("enclose_in_brackets")}
                  </span>
                </Button>
              </>
            )}
          </div>

          <Textarea
            placeholder={contentPlaceholder}
            value={content}
            onChange={handleContentChange}
            className="mt-4 min-h-[400px] font-mono"
            onSelect={e => {
              const target = e.target as HTMLTextAreaElement;
              setSelection({
                start: target.selectionStart,
                end: target.selectionEnd,
              });
            }}
            onFocus={() => setIsChordsFieldFocused(true)}
            // onBlur={() => setIsChordsFieldFocused(false)}
          />
        </Tabs>

        <Button className="mx-4 mt-4" onClick={handleSaveSong}>
          {t("save_song")}
        </Button>
      </Form>

      <TextInputModal
        error={error}
        enabled={isReplaceModalOpen}
        onDismiss={() => {
          setError(null);
          setReplaceModalOpen(false);
        }}
        onChange={value => setReplaceWithText(value)}
        onSubmit={handleReplaceText}
        submitButtonTitle={t("replace")}
        placeholder={t("replace_with")}
        label={`${t("replace")}: ${replaceFromText}`}
      />
      <TextInputModal
        error={error}
        enabled={isAddChordNotesModalOpen}
        onDismiss={() => {
          setError(null);
          setAddChordNotesModalOpen(false);
        }}
        onChange={value => setAddChordNotesText(value)}
        onSubmit={handleAddChordNotes}
        submitButtonTitle={`${t("add_chord_using_notes")}`}
        placeholder={"e.g. A C E G is Am7"}
        label={t("add_chord_using_notes")}
      />
      <TextInputModal
        error={error}
        enabled={isAddChordModalOpen}
        onDismiss={() => {
          setError(null);
          setAddChordModalOpen(false);
        }}
        onChange={value => setAddChordText(value)}
        onSubmit={handleAddChord}
        submitButtonTitle={`${t("add_chord")}`}
        placeholder={"e.g. Am7/C"}
        label={t("add_chord")}
      />
    </div>
  );
}
