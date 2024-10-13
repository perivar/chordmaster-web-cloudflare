// app/routes/songs.$id.tsx

import { useEffect, useState } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { useNavigate, useParams } from "@remix-run/react";
import {
  addOrUpdateArtistReducer,
  addOrUpdateSongReducer,
  useAppContext,
} from "~/context/AppContext";
import { useFirebase } from "~/context/FirebaseContext";
import { DownloadIcon } from "lucide-react";

import { ISong } from "~/lib/firestoreQueries";
import useFirestore from "~/hooks/useFirestore";
import { Button } from "~/components/ui/button";
import LinkButton from "~/components/LinkButton";
import LoadingIndicator from "~/components/LoadingIndicator";
import SongRender from "~/components/SongRender";
import SongTransformer from "~/components/SongTransformer";
import styles from "~/styles/chordsheetjs.css?url";

export const meta: MetaFunction = () => [
  { title: "Song" },
  { name: "description", content: "View Song" },
];

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function SongPreview() {
  const navigate = useNavigate();
  const params = useParams();
  const songIdParam = params.id;

  const { dispatch } = useAppContext();
  const { user } = useFirebase();

  const [song, setSong] = useState<ISong>();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addNewSong, getSongById } = useFirestore();

  useEffect(() => {
    const loadSongData = async (songId: string) => {
      try {
        setIsLoading(true);
        if (songId) {
          const songFound = await getSongById(songId);
          setSong(songFound);
        }
        setIsLoading(false);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
          setIsLoading(false);
        } else {
          throw e;
        }
      }
    };

    if (songIdParam) {
      loadSongData(songIdParam);
    }
  }, [songIdParam]);

  const saveSong = async () => {
    if (isSaving) return;

    setIsSaving(true);

    let newSong: ISong;
    try {
      if (song && user && user.uid) {
        newSong = await addNewSong(
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
          {
            id: song.artist.id,
            name: song.artist.name,
          },
          song.title,
          song.content,

          song.external.id,
          song.external.url,
          song.external.source
        );

        console.log("SongPreview -> addNewSong:", newSong);

        await dispatch(addOrUpdateSongReducer(newSong));
        await dispatch(addOrUpdateArtistReducer(newSong.artist));

        navigate(`/songs/${newSong.id}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        throw e;
      }
    }
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="relative mt-6 pb-4">
      <div className="size-full">
        {/* Display error if exists */}
        {error && (
          <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
        )}
        <SongTransformer chordProSong={song?.content} transposeDelta={0}>
          {({ transformedSong }) => (
            <div className="flex flex-col pb-6 pl-6 font-mono">
              <SongRender song={transformedSong} />
              <div className="mt-6 flex w-full justify-center font-sans">
                <Button onClick={saveSong} size="lg" variant="default">
                  <DownloadIcon className="mr-3 size-4" />
                  Download
                </Button>
              </div>
              <LinkButton
                title={song?.external?.source}
                url={song?.external?.url}
              />
            </div>
          )}
        </SongTransformer>
      </div>
    </div>
  );
}
