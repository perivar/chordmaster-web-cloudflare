// app/routes/songs._addurl.tsx

import { useEffect, useRef, useState } from "react";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  json,
  MetaFunction,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  addOrUpdateArtistReducer,
  addOrUpdateSongReducer,
  useAppContext,
} from "~/context/AppContext";
import { useFirebase } from "~/context/FirebaseContext";
import i18next from "~/i18n/i18n.server";
import { fetchSongData } from "~/utils/fetchSongData";
import { useTranslation } from "react-i18next";

import { IArtist } from "~/lib/firestoreQueries";
import useFirestore from "~/hooks/useFirestore";
import { Button } from "~/components/ui/button";
import LoadingIndicator from "~/components/LoadingIndicator";
import SearchBar from "~/components/SearchBar";

export const meta: MetaFunction = () => [
  { title: "Add Songs using Url" },
  { name: "description", content: "Add Songs using Url" },
];

// Loader function to handle query parameter
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url).searchParams.get("query");
  const t = await i18next.getFixedT(request);

  if (!url) {
    return json({
      loaderError: t("missing_url_error"),
      songData: null,
    });
  }

  try {
    // see https://www.jacobparis.com/content/use-effect-fetching
    const { artist, songName, chordPro, source } = await fetchSongData(url);

    return json({
      loaderError: null,
      songData: { artist, songName, chordPro, source, url },
    });
  } catch (error) {
    if (error instanceof Error) {
      return json({
        loaderError: error.message,
        songData: null,
      });
    }
  }
}

export default function AddSongUsingUrl() {
  const { t } = useTranslation();

  const { dispatch } = useAppContext();
  const { user } = useFirebase();
  const navigate = useNavigate();
  const { state } = useNavigation();

  // show loading when loader is running
  // https://github.com/remix-run/react-router/discussions/8914
  const isLoading = state === "loading";

  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { addNewSong, getArtistsByName, addNewArtist } = useFirestore();

  const loaderData = useLoaderData<typeof loader>();

  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  useEffect(() => {
    const { loaderError, songData } = loaderData;
    if (
      !loaderError &&
      songData?.artist &&
      songData?.songName &&
      songData?.chordPro
    ) {
      setMessage(loaderData.songData.chordPro);
      setError("");

      addSong(
        songData.songName,
        songData.artist,
        songData.chordPro,

        undefined,
        songData.url,
        songData.source
      );
    } else if (loaderError) {
      setError(loaderError);
      setMessage("");
    }
  }, [loaderData]);

  const addSong = async (
    title: string,
    artist: string,
    content: string,

    externalId?: string,
    externalUrl?: string,
    externalSource?: string
  ) => {
    if (title.trim() === "") return setError(t("invalid_title"));
    if (artist.trim() === "") return setError(t("invalid_artist"));
    if (content.trim() === "") return setError(t("invalid_content"));

    const artistName = artist.trim();
    const songTitle = title.trim();
    const chordPro = content;

    try {
      if (!user) throw new Error("User object is undefined!");

      let artistDb: IArtist;
      const artists = await getArtistsByName(artistName);
      if (artists && artists.length > 0) {
        artistDb = artists[0];
      } else {
        artistDb = await addNewArtist(artistName);
        await dispatch(addOrUpdateArtistReducer(artistDb));
      }

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

        externalId,
        externalUrl,
        externalSource
      );

      // console.log('AddSongUsingUrl -> addSong:', newSong);

      await dispatch(addOrUpdateSongReducer(newSong));

      navigate(`/songs/${newSong.id}`);
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

  const handleSubmit = () => {
    if (query) {
      if (formRef.current) {
        submit(formRef.current);
      }
    } else {
      // nothing added
      setError(t("missing_url_error"));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Form that sends the query to the same route */}
      <Form ref={formRef} method="get">
        <SearchBar
          name="query"
          value={query}
          onChange={value => setQuery(value)}
          placeholder={t("add_using_url")}
          onSubmit={handleSubmit}
        />
        <p className="mt-4 max-w-md text-center">
          {t("supported_add_url_sites")}
        </p>
        <div className="w-full max-w-lg rounded p-6">
          <Button type="button" onClick={handleSubmit} className="w-full">
            {t("import_from_url")}
          </Button>
        </div>
      </Form>

      {/* Display loader data or errors */}
      {error && <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>}
      {message && (
        <p className="mt-4 text-center font-mono text-gray-700">{message}</p>
      )}
    </div>
  );
}
