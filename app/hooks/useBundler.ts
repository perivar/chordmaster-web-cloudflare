import { JsonDecoder } from "@artutra/ts-data-json";
import {
  addOrUpdateArtistReducer,
  addOrUpdatePlaylistReducer,
  addOrUpdateSongReducer,
  editPlaylistReducer,
  useAppContext,
} from "~/context/AppContext";
import { useFirebase } from "~/context/FirebaseContext";

import { IPlaylist, ISong } from "~/lib/firestoreQueries";

import useFirestore from "./useFirestore";

export interface SongBundle {
  id?: string;
  title: string;
  content: string;
  artist: string;
  transposeAmount?: number | null | undefined;
  fontSize?: number | null | undefined;
  externalId?: string | null | undefined;
  externalUrl?: string | null | undefined;
  externalSource?: string | null | undefined;
  showTablature: boolean;
  updatedAt?: string;
}

export interface PlaylistBundle {
  id?: string;
  name: string;
  songs: { id: string }[];
}

export interface DatabaseBundle {
  version: number;
  createdAt: string;
  songs: SongBundle[];
  playlists: PlaylistBundle[];
}

export type UseBundlerHookResult = {
  createBundle: (
    playlistIds?: string[],
    songIds?: string[]
  ) => Promise<DatabaseBundle>;

  importBundle: (bundle: DatabaseBundle) => void;

  decodeJsonBundle(jsonString: string): Promise<DatabaseBundle>;
};

export type UseBundlerHookArgs = {};

const Song2Bundle = (song: ISong): SongBundle => {
  return {
    id: song.id,
    title: song.title,
    content: song.content,
    artist: song.artist.name,
    transposeAmount: song.transposeAmount,
    fontSize: song.fontSize,
    externalId: song.external?.id,
    externalUrl: song.external?.url,
    externalSource: song.external?.source,
    showTablature: song.showTablature != null ? song.showTablature : true,
    updatedAt: song.updatedAt
      ? song.updatedAt.toDate().toISOString()
      : song.createdAt?.toDate()?.toISOString(),
  };
};

const Playlist2Bundle = (playlist: IPlaylist): PlaylistBundle => {
  // use the songs ids not the songs array (as it might be empty)
  const playlistSongs = playlist.songIds.map(s => ({ id: s }));

  return {
    id: playlist.id,
    name: playlist.name,
    songs: playlistSongs,
  };
};

const useBundler = (): UseBundlerHookResult => {
  const { state, dispatch } = useAppContext();
  const { user } = useFirebase();

  const allSongs = state.songs;
  const allPlaylists = state.playlists;
  const allArtists = state.artists;

  const {
    addNewSong,
    editSong,
    getArtistsByName,
    addNewArtist,
    addNewPlaylist,
    addSongToPlaylist,
  } = useFirestore();

  const createBundle = async (
    playlistIds?: string[],
    songIds?: string[]
  ): Promise<DatabaseBundle> => {
    const db: DatabaseBundle = {
      version: 1,
      songs: [],
      playlists: [],
      createdAt: new Date().toJSON(),
    };

    if (songIds) {
      songIds.forEach(songId => {
        const song = allSongs.find(s => s.id === songId);
        if (!song) throw new Error("Invalid song ids");
        db.songs.push(Song2Bundle(song));
      });
    } else {
      allSongs.forEach(song => {
        db.songs.push(Song2Bundle(song));
      });
    }

    if (playlistIds) {
      playlistIds.forEach(playlistId => {
        const playlist = allPlaylists.find(a => a.id === playlistId);
        if (!playlist) throw new Error("Invalid playlist id");

        // use the songs ids not the songs array (as it might be empty)
        playlist.songIds.forEach(songId => {
          const song = allSongs.find(s => s.id === songId);
          if (!song) throw new Error("Invalid song ids");
          db.songs.push(Song2Bundle(song));
        });

        db.playlists.push(Playlist2Bundle(playlist));
      });
    } else {
      allPlaylists.forEach(playlist => {
        db.playlists.push(Playlist2Bundle(playlist));
      });
    }

    if (db.songs.length == 0 && db.playlists.length == 0) {
      throw new Error("There is nothing to backup");
    }

    return db;
  };

  const importBundle = async (bundle: DatabaseBundle) => {
    const mapExistingSongs: { [key: string]: string } = {};

    bundle.songs.forEach(async bundleSong => {
      let artistDb = allArtists.find(a => a.name === bundleSong.artist);
      if (artistDb == null) {
        const artists = await getArtistsByName(bundleSong.artist);
        if (artists && artists.length > 0) {
          artistDb = artists[0];
        } else {
          console.log(`Importing -> Adding artist ${bundleSong.artist}`);

          artistDb = await addNewArtist(bundleSong.artist);
          await dispatch(addOrUpdateArtistReducer(artistDb));
        }
      }
      const songDb = allSongs.find(s => s.id === bundleSong.id);
      if (songDb && bundleSong.id && songDb.id) {
        mapExistingSongs[bundleSong.id] = songDb.id;
        if (
          bundleSong.updatedAt &&
          songDb.updatedAt &&
          songDb.updatedAt.toDate() < new Date(bundleSong.updatedAt)
        ) {
          const updatedSong = await editSong(
            songDb.id!,
            {
              id: artistDb.id,
              name: artistDb.name,
            },

            bundleSong.title,
            bundleSong.content,

            bundleSong.externalId!,
            bundleSong.externalUrl!,
            bundleSong.externalSource!
          );

          console.log("Importing > editSong:", updatedSong);
          await dispatch(addOrUpdateSongReducer(updatedSong));
        } else {
          console.log(
            `Importing > Song backup for "${bundleSong.title}" ${
              bundleSong.updatedAt
            } is equal/older than the db ${songDb.updatedAt}. Skipping...`
          );
        }
      } else {
        if (user) {
          console.log(`Importing > Adding new song ${bundleSong.title}`);
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

            bundleSong.title,
            bundleSong.content,

            bundleSong.externalId!,
            bundleSong.externalUrl!,
            bundleSong.externalSource!
          );

          console.log("Importing > addNewSong:", newSong);
          await dispatch(addOrUpdateSongReducer(newSong));
          await dispatch(addOrUpdateArtistReducer(newSong.artist));

          if (bundleSong.id && newSong.id)
            mapExistingSongs[bundleSong.id] = newSong.id;
        }
      }
    });

    bundle.playlists.forEach(async bundlePlaylist => {
      let playlistDb = allPlaylists.find(a => a.name === bundlePlaylist.name);

      if (user && playlistDb == null) {
        playlistDb = await addNewPlaylist(
          {
            uid: user?.uid,
            email: user?.email,
            displayName: user?.displayName,
          },
          bundlePlaylist.name,
          []
        );

        console.log("Importing > addNewPlaylist:", playlistDb.id);
        await dispatch(addOrUpdatePlaylistReducer(playlistDb));
      }

      if (playlistDb) {
        bundlePlaylist.songs.forEach(async bundleSong => {
          const songDb = allSongs.find(s => s.id === bundleSong.id);
          if (songDb == null) {
            // instead of throwing an error, continue to next song
            console.log(
              `Importing > Playlist ${playlistDb.id} specfies a song that no longer exist ${bundleSong.id}`
            );

            return;
          }

          // see if the playlist already has the song added
          const songAlreadyAdded = playlistDb.songIds.find(
            s => s === songDb.id
          );
          if (songAlreadyAdded) {
            console.log(
              `Importing > Playlist ${playlistDb.id} already contain Song ${songDb.id}`
            );
          } else {
            if (playlistDb.id && songDb.id)
              await addSongToPlaylist(playlistDb.id, songDb.id);
            const newPlaylist = { ...playlistDb };
            if (playlistDb.id && songDb.id)
              newPlaylist.songIds = [...playlistDb.id, songDb.id];
            dispatch(editPlaylistReducer(newPlaylist));
          }
        });
      }
    });
  };

  const bundleDecoder = JsonDecoder.object<DatabaseBundle>(
    {
      version: JsonDecoder.number,
      createdAt: JsonDecoder.string,
      songs: JsonDecoder.array<SongBundle>(
        JsonDecoder.object<SongBundle>(
          {
            id: JsonDecoder.string,
            title: JsonDecoder.string,
            content: JsonDecoder.string,
            artist: JsonDecoder.string,
            transposeAmount: JsonDecoder.optional(JsonDecoder.number),
            fontSize: JsonDecoder.optional(JsonDecoder.number),
            externalId: JsonDecoder.optional(JsonDecoder.string),
            externalUrl: JsonDecoder.optional(JsonDecoder.string),
            externalSource: JsonDecoder.optional(JsonDecoder.string),
            showTablature: JsonDecoder.boolean,
            updatedAt: JsonDecoder.string,
          },
          "SongBundle"
        ),
        "songs[]"
      ),
      playlists: JsonDecoder.array<PlaylistBundle>(
        JsonDecoder.object<PlaylistBundle>(
          {
            id: JsonDecoder.string,
            name: JsonDecoder.string,
            songs: JsonDecoder.array<{ id: string }>(
              JsonDecoder.object<{ id: string }>(
                {
                  id: JsonDecoder.string,
                },
                "playlist.songs.id"
              ),
              "playlist.songs[]"
            ),
          },
          "PlaylistBundle"
        ),
        "playlists[]"
      ),
    },
    "DatabaseBundle"
  );

  const decodeJsonBundle = async (
    jsonString: string
  ): Promise<DatabaseBundle> => {
    const bundle = JSON.parse(jsonString);
    return await bundleDecoder.decodePromise<DatabaseBundle>(bundle);
  };

  return {
    createBundle,
    importBundle,
    decodeJsonBundle,
  };
};

export default useBundler;
