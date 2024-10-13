import { useState } from "react";
import {
  setArtistsReducer,
  setPlaylistsReducer,
  setSongsReducer,
  updateAppConfigReducer,
  updateUserAppConfigReducer,
  useAppContext,
} from "~/context/AppContext";
import { useFirebase } from "~/context/FirebaseContext";
import { addOrUpdateItemInArray } from "~/utils/arrayUtilities";

import useFirestore from "./useFirestore";
import useIsMounted from "./useIsMounted";

export type UseFirestoreMethodsHookResult = {
  isLoading: boolean;
  loadAppConfigData: (id: string) => Promise<void>;
  loadUserAppConfigData: () => Promise<void>;
  loadArtistData: () => Promise<void>;
  loadUserSongData: () => Promise<void>;
  loadUserPlaylistData: () => Promise<void>;
  loadSongData: (songId: string) => Promise<void>;
  loadPlaylistData: (playlistId: string) => Promise<void>;
  hasPlaylistContainsSong: (playlistId: string, songId: string) => boolean;
  playlistAddSong: (playlistId: string, songId: string) => Promise<void>;
  playlistRemoveSong: (playlistId: string, songId: string) => Promise<void>;
};

const useFirestoreMethods = (): UseFirestoreMethodsHookResult => {
  const isMounted = useIsMounted();
  const { user } = useFirebase();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    getAppConfig,
    getUserAppConfig,
    getSongsByUserId,
    getSongById,
    getPlaylistsByUserId,
    getPlaylistById,
    getAllArtists,
    addSongToPlaylist,
    removeSongFromPlaylist,
  } = useFirestore();

  const { state, dispatch } = useAppContext();

  const loadAppConfigData = async (id: string) => {
    setIsLoading(true);
    // only run if we are logged in, even if we are not using the userId
    // but rather the documentId
    // this can e.g. be found using the extra section in app.config.ts
    // import Constants from 'expo-constants';
    // loadAppConfigData(Constants.expoConfig.extra.appConfigDocId);
    if (user && user.uid) {
      const config = await getAppConfig(id);
      if (isMounted()) {
        dispatch(updateAppConfigReducer(config));
      }
    }
    setIsLoading(false);
  };

  const loadUserAppConfigData = async () => {
    setIsLoading(true);
    if (user && user.uid) {
      const config = await getUserAppConfig(user.uid);
      if (isMounted()) {
        dispatch(updateUserAppConfigReducer(config));
      }
    }
    setIsLoading(false);
  };

  const loadArtistData = async () => {
    setIsLoading(true);

    const a = await getAllArtists();
    if (isMounted()) {
      dispatch(setArtistsReducer(a));
    }

    setIsLoading(false);
  };

  const loadUserSongData = async () => {
    setIsLoading(true);
    if (user && user.uid) {
      const { songs } = await getSongsByUserId(user.uid);

      if (isMounted()) {
        // instead of loading the artists, use the artists from the loaded songs instead
        // get all artist (can include duplicates)
        const artistsWithDuplicates = songs.map(song => song.artist);

        // filter out the duplicates
        const artistsUnsorted = artistsWithDuplicates.filter(
          (artist, i, arr) => arr.findIndex(t => t.id === artist.id) === i
        );

        // and sort artists
        const artists = artistsUnsorted.sort((x, y) =>
          x.name.localeCompare(y.name)
        );

        // and sort songs
        const sortedSongs = songs.sort((x, y) =>
          x.title.localeCompare(y.title)
        );

        dispatch(setSongsReducer(sortedSongs));

        // also set artist from the loaded song
        dispatch(setArtistsReducer(artists));
      }
    }
    setIsLoading(false);
  };

  const loadUserPlaylistData = async () => {
    setIsLoading(true);
    if (user && user.uid) {
      const { playlists } = await getPlaylistsByUserId(user.uid);
      if (isMounted()) {
        // and sort playlists
        const sortedPlaylists = playlists.sort((x, y) =>
          x.name.localeCompare(y.name)
        );

        dispatch(setPlaylistsReducer(sortedPlaylists));
      }
    }
    setIsLoading(false);
  };

  const loadSongData = async (songId: string) => {
    setIsLoading(true);
    const song = await getSongById(songId);

    // Update the song array
    const updatedSongs = addOrUpdateItemInArray(state.songs, song);

    // Dispatch setSongs action to update the entire song array
    dispatch(setSongsReducer(updatedSongs));

    // Update the artist array
    const updatedArtists = addOrUpdateItemInArray(state.artists, song.artist);

    // Dispatch setArtists action to update the entire artist array
    dispatch(setArtistsReducer(updatedArtists));
    setIsLoading(false);
  };

  const loadPlaylistData = async (playlistId: string) => {
    setIsLoading(true);
    const playlist = await getPlaylistById(playlistId);

    // Update the playlist array
    const updatedPlaylists = addOrUpdateItemInArray(state.playlists, playlist);

    // Dispatch setPlaylists action to update the entire playlists array
    dispatch(setPlaylistsReducer(updatedPlaylists));

    setIsLoading(false);
  };

  const hasPlaylistContainsSong = (playlistId: string, songId: string) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    return playlist?.songIds.includes(songId) || false;
  };

  const playlistAddSong = async (playlistId: string, songId: string) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    const song = state.songs.find(s => s.id === songId);
    if (playlist && song) {
      await addSongToPlaylist(playlistId, songId);
      const updatedPlaylists = state.playlists.map(p =>
        p.id === playlistId ? { ...p, songIds: [...p.songIds, songId] } : p
      );
      dispatch(setPlaylistsReducer(updatedPlaylists));
    }
  };

  const playlistRemoveSong = async (playlistId: string, songId: string) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    if (playlist) {
      await removeSongFromPlaylist(playlistId, songId);
      const updatedPlaylists = state.playlists.map(p =>
        p.id === playlistId
          ? { ...p, songIds: p.songIds.filter(id => id !== songId) }
          : p
      );
      dispatch(setPlaylistsReducer(updatedPlaylists));
    }
  };

  return {
    isLoading,
    loadAppConfigData,
    loadUserAppConfigData,
    loadArtistData,
    loadUserSongData,
    loadUserPlaylistData,
    loadSongData,
    loadPlaylistData,
    hasPlaylistContainsSong,
    playlistAddSong,
    playlistRemoveSong,
  };
};

export default useFirestoreMethods;
