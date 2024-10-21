import { useFirebase } from "~/context/FirebaseContext";
import {
  DocumentData,
  QueryConstraint,
  QueryDocumentSnapshot,
} from "firebase/firestore/lite";

import {
  addNewArtistQuery,
  addNewPlaylistQuery,
  addNewSongQuery,
  addSongToPlaylistQuery,
  addTokenToUserQuery,
  bulkAddFieldToSongsQuery,
  deleteArtistQuery,
  deletePlaylistQuery,
  deleteSongQuery,
  editArtistQuery,
  editPlaylistQuery,
  editSongQuery,
  getAllArtistsQuery,
  getAllPlaylistsQuery,
  getAllSongsQuery,
  getAppConfigQuery,
  getArtistByIdQuery,
  getArtistsByNameQuery,
  getPlaylistByIdQuery,
  getPlaylistsByUserIdQuery,
  getSongByIdQuery,
  getSongsByQueryQuery,
  getSongsByUserIdQuery,
  getUserAppConfigQuery,
  getUserDetailsQuery,
  IAppConfig,
  IArtist,
  ISong,
  IUser,
  removeSongFromPlaylistQuery,
  setSongPreferencesQuery,
  updateAppConfigQuery,
  updateSongsWithArtistsQuery,
  updateUserAppConfigQuery,
} from "~/lib/firestoreQueries";

// Hook to use the firestore db on the client
const useFirestore = () => {
  const { db } = useFirebase();

  //#region User Region
  const getUserDetails = async (uid: string) => getUserDetailsQuery(db, uid);

  const addTokenToUser = async (uid: string, token: string) =>
    addTokenToUserQuery(db, uid, token);
  //#endregion

  //#region Artist Region
  const addNewArtist = async (name: string) => addNewArtistQuery(db, name);

  const editArtist = async (id: string, name: string) =>
    editArtistQuery(db, id, name);

  const deleteArtist = async (id: string) => deleteArtistQuery(db, id);

  const getAllArtists = async () => getAllArtistsQuery(db);

  const getArtistById = async (artistId: string) =>
    getArtistByIdQuery(db, artistId);

  const getArtistsByName = async (name: string) =>
    getArtistsByNameQuery(db, name);

  const updateSongsWithArtists = async (songs: ISong[]) =>
    updateSongsWithArtistsQuery(db, songs);
  //#endregion

  //#region Song Region
  const addNewSong = async (
    user: IUser,
    artist: IArtist,
    title: string,
    content: string,
    externalId?: string,
    externalUrl?: string,
    externalSource?: string
  ) =>
    addNewSongQuery(
      db,
      user,
      artist,
      title,
      content,
      externalId,
      externalUrl,
      externalSource
    );

  const editSong = async (
    id: string,
    artist: IArtist,
    title: string,
    content: string,
    externalId?: string,
    externalUrl?: string,
    externalSource?: string
  ) =>
    editSongQuery(
      db,
      id,
      artist,
      title,
      content,
      externalId,
      externalUrl,
      externalSource
    );

  const deleteSong = async (id: string) => deleteSongQuery(db, id);

  const getAllSongs = async () => getAllSongsQuery(db);

  const getSongById = async (songId: string) => getSongByIdQuery(db, songId);

  const getSongsByUserId = async (
    userId: string,
    limitCount?: number,
    startAfterId?: QueryDocumentSnapshot<DocumentData>,
    invertOwner = false, // change the behavior to the exact opposite, only get songs that the userId does not own,
    onlyPublished = false // only include published songs
  ) =>
    getSongsByUserIdQuery(
      db,
      userId,
      limitCount,
      startAfterId,
      invertOwner,
      onlyPublished
    );

  const getSongsByQuery = async (
    userId: string,
    searchQuery: string,
    isModeOpposite = false // change the behavior to the exact opposite, only get songs that the userId does not own
  ) => getSongsByQueryQuery(db, userId, searchQuery, isModeOpposite);

  const setSongPreferences = async (
    id: string,
    preferences: {
      showTablature?: boolean;
      fontSize?: number;
      transposeAmount?: number;
      published?: boolean;
    }
  ) => setSongPreferencesQuery(db, id, preferences);
  //#endregion

  //#region Playlist Region
  const addNewPlaylist = async (user: IUser, name: string, songIds: string[]) =>
    addNewPlaylistQuery(db, user, name, songIds);

  const editPlaylist = async (id: string, name: string, songIds: string[]) =>
    editPlaylistQuery(db, id, name, songIds);

  const deletePlaylist = async (id: string) => deletePlaylistQuery(db, id);

  const getAllPlaylists = async () => getAllPlaylistsQuery(db);

  const getPlaylistById = async (playlistId: string) =>
    getPlaylistByIdQuery(db, playlistId);

  const getPlaylistsByUserId = async (
    userId: string,
    limitCount?: number,
    startAfterId?: QueryDocumentSnapshot<DocumentData>
  ) => getPlaylistsByUserIdQuery(db, userId, limitCount, startAfterId);

  const addSongToPlaylist = async (playlistId: string, songId: string) =>
    addSongToPlaylistQuery(db, playlistId, songId);

  const removeSongFromPlaylist = async (playlistId: string, songId: string) =>
    removeSongFromPlaylistQuery(db, playlistId, songId);
  //#endregion

  //#region UserAppConfig Region
  const getUserAppConfig = async (userId: string) =>
    getUserAppConfigQuery(db, userId);

  const updateUserAppConfig = async (
    userId: string,
    userAppConfig: {
      language?: string;
      fontSize?: number;
      showTablature?: boolean;
      enablePageTurner?: boolean;
    }
  ) => updateUserAppConfigQuery(db, userId, userAppConfig);
  //#endregion

  //#region AppConfig Region
  const getAppConfig = async (id: string) => getAppConfigQuery(db, id);

  const updateAppConfig = async (appConfig: IAppConfig) =>
    updateAppConfigQuery(db, appConfig);
  //#endregion

  //#region
  // add a field and value to a firestore table
  // optionally use a queryConstraint to only include some of the table elements
  // e.g. where('user.uid', '==', user.uid);
  const bulkAddFieldToSongs = async (
    tableName: string,
    fieldName: string,
    fieldValue: unknown,
    queryConstraint?: QueryConstraint
  ) =>
    bulkAddFieldToSongsQuery(
      db,
      tableName,
      fieldName,
      fieldValue,
      queryConstraint
    );
  //#endregion

  return {
    getUserDetails,
    addTokenToUser,

    // appConfig
    getAppConfig,
    updateAppConfig,

    // userAppConfig
    getUserAppConfig,
    updateUserAppConfig,

    // artist
    addNewArtist,
    editArtist,
    deleteArtist,
    getAllArtists,
    getArtistById,
    getArtistsByName,
    updateSongsWithArtists,

    // song
    addNewSong,
    editSong,
    deleteSong,
    getAllSongs,
    getSongById,
    getSongsByUserId,
    setSongPreferences,
    getSongsByQuery,

    // playlist
    addNewPlaylist,
    editPlaylist,
    deletePlaylist,
    getAllPlaylists,
    getPlaylistById,
    getPlaylistsByUserId,
    addSongToPlaylist,
    removeSongFromPlaylist,
    bulkAddFieldToSongs,
  };
};

export default useFirestore;
