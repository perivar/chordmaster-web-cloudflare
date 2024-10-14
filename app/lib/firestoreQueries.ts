import deepmerge from "deepmerge";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentSnapshot,
  endAt,
  Firestore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Query,
  QueryConstraint,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  startAt,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore/lite";

export type IAuthUser = {
  uid: string;
  displayName: string;
  email: string;
  avatar?: string; // image url
  token?: string; // expo token for notifications
  roles?: string[]; // roles that determine access to app

  // apple credential variables
  appleAuthorizationCode?: string;
  appleUser?: string;
};

export interface UserCredentials extends IAuthUser {
  createdAt?: Timestamp;
  updatedAt: Timestamp;
}

export interface IAppConfig {
  id?: string;
}

export interface IUserAppConfig {
  id?: string;

  user?: IUser;

  language: string;
  fontSize: number;
  showTablature: boolean;
  enablePageTurner: boolean;
}

export interface IUser {
  uid: string;
  email?: string;
  displayName?: string;
}

export interface IArtist {
  id?: string;
  name: string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ISong {
  id?: string;

  user?: IUser;

  artist: IArtist;
  title: string;
  content: string;

  // special query fields
  // title_lower?: string;
  // title_partial?: string;
  // artist_lower?: string;
  // artist_partial?: string;

  transposeAmount?: number;
  fontSize?: number;
  showTablature?: boolean;
  published?: boolean;

  external: {
    id: string; //
    url: string; //
    source: string; //
  };

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface IPlaylist {
  id?: string;

  user?: IUser;

  name: string;
  songIds: string[];
  songs?: ISong[]; // when reading this is filled in

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const isProduction = process.env.NODE_ENV === "production";

export const debugMethod = (text: string, ...args: any[]) => {
  if (!isProduction) {
    console.log(text, ...args);
  }
};

export const errorMethod = (text: string, ...args: any[]) => {
  if (!isProduction) {
    console.error(text, ...args);
  }
};

//#region User Region
export const getUserDetailsQuery = async (db: Firestore, uid: string) => {
  const userDocument = await getDoc(doc(db, `/users/${uid}`));

  if (userDocument.exists()) {
    const userData = userDocument.data() as UserCredentials;
    return userData;
  }
  throw new Error(`User cannot be found (${uid})`);
};

export const addTokenToUserQuery = async (
  db: Firestore,
  uid: string,
  token: string
) => {
  try {
    if (!token) {
      debugMethod("Token is empty - ignoring adding to firestore!");
      return;
    }

    if (!uid) {
      debugMethod("User id is empty - ignoring adding to firestore!");
      return;
    }

    // store token in separate token collection
    // const tokenRef = doc(db, 'tokens', user.uid);
    // setDoc(tokenRef, { token: token, id: user.uid }).then(() => {
    //   debug('Successfully added token to firestore.');
    // });

    // store token as a part of the user object
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { token: token });

    debugMethod("Successfully added token to firestore: ", token);
  } catch (error) {
    errorMethod(`Failed adding token to user with id ${uid}`, error);
    throw error;
  }
};
//#endregion

//#region Artist Region
export const addNewArtistQuery = async (db: Firestore, name: string) => {
  const now = serverTimestamp() as Timestamp;

  const newArtist: IArtist = {
    name,

    createdAt: now,
  };

  const responseArtist: IArtist = {
    ...newArtist,
  };

  const document = await addDoc(collection(db, "artists"), newArtist);

  const { id: artistId } = document;
  responseArtist.id = artistId;

  debugMethod(`Artist ${artistId} added successfully`);
  return responseArtist;
};

export const editArtistQuery = async (
  db: Firestore,
  id: string,

  name: string
) => {
  const now = serverTimestamp() as Timestamp;

  const updateArtist: IArtist = {
    id,
    name,

    updatedAt: now,
  };

  await updateDoc(doc(db, `/artists/${id}`), {
    ...updateArtist,
  });

  debugMethod(`Artist ${id} updated successfully`);
  return updateArtist;
};

export const deleteArtistQuery = async (db: Firestore, id: string) => {
  const artistDocument = await getDoc(doc(db, `/artists/${id}`));

  if (!artistDocument.exists()) {
    debugMethod("Artist not found");
    return;
  }

  // delete artist document
  await deleteDoc(doc(db, `/artists/${id}`));

  debugMethod(`Artist ${id} deleted successfully`);
};

export const getAllArtistsQuery = async (db: Firestore) => {
  const artists: IArtist[] = [];

  const artistQuery = query(collection(db, "artists"), orderBy("createdAt"));

  const artistsSnapshots = await getDocs(artistQuery);

  artistsSnapshots.forEach(artistSnapshot => {
    const data = artistSnapshot.data() as IArtist;
    artists.push({
      id: artistSnapshot.id,

      name: data.name,

      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });

  return artists;
};

export const getArtistByIdQuery = async (db: Firestore, artistId: string) => {
  try {
    const artistDocument = await getDoc(doc(db, `/artists/${artistId}`));

    if (!artistDocument.exists()) {
      throw new Error("Artist not found");
    }

    const data = artistDocument.data();
    const artist: IArtist = {
      id: artistDocument.id,

      name: data.name,

      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    debugMethod(`Artist ${artistId} retrieved successfully`);
    return artist;
  } catch (error) {
    errorMethod(`Get Artist using id: ${artistId} failed:`, error);
    throw error;
  }
};

export const getArtistsByNameQuery = async (db: Firestore, name: string) => {
  try {
    const artists: IArtist[] = [];

    const artistQuery = query(
      collection(db, "artists"),
      where("name", "==", name)
    );

    const artistsSnapshots = await getDocs(artistQuery);

    artistsSnapshots.forEach(artistSnapshot => {
      const data = artistSnapshot.data() as IArtist;
      artists.push({
        id: artistSnapshot.id,

        name: data.name,

        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return artists;
  } catch (error) {
    errorMethod(`Get Artist using name: ${name} failed:`, error);
    throw error;
  }
};

export const updateSongsWithArtistsQuery = async (
  db: Firestore,
  songs: ISong[]
) => {
  const artistPromises: Promise<DocumentSnapshot<DocumentData>>[] = [];

  if (songs && songs.length > 0) {
    songs.forEach(song => {
      if (song.artist && song.artist.id) {
        artistPromises.push(getDoc(doc(db, "artists", song.artist.id)));
      }
    });

    const artistsSnapshots = await Promise.all(artistPromises);

    // create map of artistId and artist
    const artistMap = new Map<string, IArtist>();
    artistsSnapshots.forEach(artistSnapshot => {
      if (artistSnapshot.exists()) {
        const artistData = artistSnapshot.data() as IArtist;
        if (artistData.id) {
          artistMap.set(artistData.id, artistData);
        }
      }
    });

    // update song list with correct artist where found
    songs.map(song => {
      // lookup artist info
      if (song.artist && song.artist.id) {
        const artistId = song.artist.id;
        if (artistMap.has(artistId)) {
          const artistData = artistMap.get(artistId);
          if (artistData && artistData.id && artistData?.name) {
            song.artist.id = artistData.id;
            song.artist.name = artistData.name;
            // song.artist.createdAt = artistData.createdAt;
            // song.artist.updatedAt = artistData.updatedAt;
          }
        }
      }
    });
  }

  return songs;
};
//#endregion

//#region Song Region
// const getPartialTitle = (title: string): string => {
//   const parts = title.split(' ');
//   if (parts.length > 1) {
//     parts.shift();
//     return parts.join(' ').toLowerCase();
//   } else {
//     return title.toLowerCase();
//   }
// };

export const addNewSongQuery = async (
  db: Firestore,
  user: IUser,

  artist: IArtist,
  title: string,
  content: string,

  externalId?: string,
  externalUrl?: string,
  externalSource?: string
) => {
  const now = serverTimestamp() as Timestamp;

  const newSong: ISong = {
    user,

    artist,
    title,
    content,

    // special query fields
    // title_lower: title.toLowerCase(),
    // title_partial: getPartialTitle(title),
    // artist_lower: artist!.name!.toLowerCase(),
    // artist_partial: getPartialTitle(artist!.name!),

    external: {
      id: externalId ?? "",
      url: externalUrl ?? "",
      source: externalSource ?? "",
    },

    createdAt: now,
  };

  const responseSong: ISong = {
    ...newSong,
  };

  const document = await addDoc(collection(db, "songs"), newSong);

  const { id: songId } = document;
  responseSong.id = songId;

  debugMethod(`Song ${songId} added successfully`);
  return responseSong;
};

export const editSongQuery = async (
  db: Firestore,
  id: string,

  artist: IArtist,
  title: string,
  content: string,

  externalId?: string,
  externalUrl?: string,
  externalSource?: string
) => {
  const now = serverTimestamp() as Timestamp;

  const updateSong: ISong = {
    id,
    artist,
    title,
    content,

    // special query fields
    // title_lower: title.toLowerCase(),
    // title_partial: getPartialTitle(title),
    // artist_lower: artist!.name!.toLowerCase(),
    // artist_partial: getPartialTitle(artist!.name!),

    external: {
      id: externalId ?? "",
      url: externalUrl ?? "",
      source: externalSource ?? "",
    },

    updatedAt: now,
  };

  await updateDoc(doc(db, `/songs/${id}`), {
    ...updateSong,
  });

  debugMethod(`Song ${id} updated successfully`);
  return updateSong;
};

export const deleteSongQuery = async (db: Firestore, id: string) => {
  const songDocument = await getDoc(doc(db, `/songs/${id}`));

  if (!songDocument.exists()) {
    debugMethod("Song not found");
    return;
  }

  // delete song document
  await deleteDoc(doc(db, `/songs/${id}`));

  debugMethod(`Song ${id} deleted successfully`);
};

export const getAllSongsQuery = async (db: Firestore) => {
  let songs: ISong[] = [];

  const songQuery = query(collection(db, "songs"), orderBy("createdAt"));

  const songsSnapshots = await getDocs(songQuery);

  songsSnapshots.forEach(songSnapshot => {
    const data = songSnapshot.data() as ISong;
    songs.push({
      id: songSnapshot.id,

      user: data.user,

      artist: data.artist,
      title: data.title,
      content: data.content,

      transposeAmount: data.transposeAmount,
      fontSize: data.fontSize,
      showTablature: data.showTablature,
      published: data.published,

      external: data.external,

      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });

  // update artists for the songs
  songs = await updateSongsWithArtistsQuery(db, songs);

  return songs;
};

export const getSongByIdQuery = async (db: Firestore, songId: string) => {
  try {
    const songDocument = await getDoc(doc(db, `/songs/${songId}`));

    if (!songDocument.exists()) {
      throw new Error("Song not found");
    }

    const data = songDocument.data();
    const song: ISong = {
      id: songDocument.id,

      user: data.user,

      artist: data.artist,
      title: data.title,
      content: data.content,

      transposeAmount: data.transposeAmount,
      fontSize: data.fontSize,
      showTablature: data.showTablature,
      published: data.published,

      external: data.external,

      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    try {
      if (song.artist && song.artist.id) {
        // retrieve artist
        const artist = await getArtistByIdQuery(db, song.artist.id);
        if (artist) {
          song.artist = artist;
        }
      }
    } catch (error) {
      debugMethod("Retrieving song artist failed:", error);
    }

    debugMethod(`Song ${songId} retrieved successfully`);
    return song;
  } catch (error) {
    errorMethod(`Get Song using id: ${songId} failed:`, error);
    throw error;
  }
};

export const getSongsByUserIdQuery = async (
  db: Firestore,
  userId: string,
  limitCount?: number,
  startAfterId?: QueryDocumentSnapshot<DocumentData>,
  invertOwner = false, // change the behavior to the exact opposite, only get songs that the userId does not own,
  onlyPublished = false // only include published songs
) => {
  let songs: ISong[] = [];

  let songsQuery = query(
    collection(db, "songs"),
    where("user.uid", invertOwner ? "!=" : "==", userId)
  );

  if (limitCount) {
    songsQuery = query(songsQuery, limit(limitCount));
  }

  if (onlyPublished) {
    songsQuery = query(songsQuery, where("published", "==", true));
  }

  if (startAfterId && startAfterId.id) {
    songsQuery = query(songsQuery, startAfter(startAfterId));
  }

  const songsSnapshots = await getDocs(songsQuery);

  // Get the last visible document
  if (songsSnapshots && songsSnapshots.size > 0) {
    const lastVisible = songsSnapshots.docs[songsSnapshots.docs.length - 1];

    songsSnapshots.forEach(songSnapshot => {
      const data = songSnapshot.data();
      songs.push({
        id: songSnapshot.id,
        user: data.user,

        artist: data.artist,
        title: data.title,
        content: data.content,

        transposeAmount: data.transposeAmount,
        fontSize: data.fontSize,
        showTablature: data.showTablature,
        published: data.published,

        external: data.external,

        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    // update artists for the songs
    songs = await updateSongsWithArtistsQuery(db, songs);

    return { lastVisible, songs };
  } else {
    return { lastVisible: undefined, songs };
  }
};

export const getSongsByQueryInternal = async (
  db: Firestore,
  userId: string,
  field: string,
  term?: string,
  isModeOpposite = false // change the behavior to the exact opposite, only get songs that the userId does not own
) => {
  // search field using value
  let songsQuery = query(
    collection(db, "songs"),
    where("user.uid", isModeOpposite ? "!=" : "==", userId),
    orderBy(field)
  );

  if (term && term !== "") {
    songsQuery = query(songsQuery, startAt(term), endAt(term + "\uf8ff"));
  }

  const songsSnapshots = await getDocs(songsQuery);

  const songs: ISong[] = [];

  if (songsSnapshots && songsSnapshots.size > 0) {
    songsSnapshots.forEach(songSnapshot => {
      const data = songSnapshot.data();
      songs.push({
        id: songSnapshot.id,
        user: data.user,

        artist: data.artist,
        title: data.title,
        content: data.content,

        transposeAmount: data.transposeAmount,
        fontSize: data.fontSize,
        showTablature: data.showTablature,
        published: data.published,

        external: data.external,

        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
  }

  return songs;
};

// Note that method requires the special query fields *_lower and _partial
export const getSongsByQueryQuery = async (
  db: Firestore,
  userId: string,
  searchQuery: string,
  isModeOpposite = false // change the behavior to the exact opposite, only get songs that the userId does not own
) => {
  const term = searchQuery.toLowerCase();

  const songsLower = await getSongsByQueryInternal(
    db,
    userId,
    "title_lower",
    term,
    isModeOpposite
  );
  const songsPartial = await getSongsByQueryInternal(
    db,
    userId,
    "title_partial",
    term,
    isModeOpposite
  );

  // merge the two results
  const foundSongsUsingTitle = deepmerge(songsLower, songsPartial);

  const songsArtistLower = await getSongsByQueryInternal(
    db,
    userId,
    "artist_lower",
    term,
    isModeOpposite
  );
  const songsArtistPartial = await getSongsByQueryInternal(
    db,
    userId,
    "artist_partial",
    term,
    isModeOpposite
  );

  // merge the two results
  const foundSongsUsingArtist = deepmerge(songsArtistLower, songsArtistPartial);

  // merge
  const foundSongs = deepmerge(foundSongsUsingTitle, foundSongsUsingArtist);

  // filter out the duplicates
  const foundSongsUnique = foundSongs.filter(
    (thing, index, self) =>
      index === self.findIndex(t => t.title === thing.title)
  );

  // update artists for the songs
  const resultingSongs = await updateSongsWithArtistsQuery(
    db,
    foundSongsUnique
  );

  return resultingSongs;
};

export const setSongPreferencesQuery = async (
  db: Firestore,
  id: string,
  preferences: {
    showTablature?: boolean;
    fontSize?: number;
    transposeAmount?: number;
    published?: boolean;
  }
) => {
  const now = serverTimestamp() as Timestamp;

  // add using existing id
  await setDoc(
    doc(db, "songs", id),
    {
      ...preferences,
      updatedAt: now,
    },
    { merge: true }
  );

  debugMethod(`Song ${id} updated successfully with preferences`);
};
//#endregion

//#region Playlist Region
export const addNewPlaylistQuery = async (
  db: Firestore,
  user: IUser,

  name: string,
  songIds: string[]
) => {
  const now = serverTimestamp() as Timestamp;

  const newPlaylist: IPlaylist = {
    user,

    name,
    songIds,

    createdAt: now,
  };

  const responsePlaylist: IPlaylist = {
    ...newPlaylist,
  };

  const document = await addDoc(collection(db, "playlists"), newPlaylist);

  const { id: playlistId } = document;
  responsePlaylist.id = playlistId;

  debugMethod(`Playlist ${playlistId} added successfully`);
  return responsePlaylist;
};

export const editPlaylistQuery = async (
  db: Firestore,
  id: string,

  name: string,
  songIds: string[]
) => {
  const now = serverTimestamp() as Timestamp;

  const updatePlaylist: IPlaylist = {
    id,

    name,
    songIds,

    updatedAt: now,
  };

  await updateDoc(doc(db, `/playlists/${id}`), {
    ...updatePlaylist,
  });

  debugMethod(`Playlist ${id} updated successfully`);
  return updatePlaylist;
};

export const deletePlaylistQuery = async (db: Firestore, id: string) => {
  const playlistDocument = await getDoc(doc(db, `/playlists/${id}`));

  if (!playlistDocument.exists()) {
    debugMethod("Playlist not found");
    return;
  }

  // delete playlist document
  await deleteDoc(doc(db, `/playlists/${id}`));

  debugMethod(`Playlist ${id} deleted successfully`);
};

export const getAllPlaylistsQuery = async (db: Firestore) => {
  const playlists: IPlaylist[] = [];

  const playlistQuery = query(
    collection(db, "playlists"),
    orderBy("createdAt")
  );

  const playlistsSnapshots = await getDocs(playlistQuery);

  playlistsSnapshots.forEach(playlistSnapshot => {
    const data = playlistSnapshot.data() as IPlaylist;
    playlists.push({
      id: playlistSnapshot.id,

      user: data.user,

      name: data.name,
      songIds: data.songIds,

      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });

  return playlists;
};

export const getPlaylistByIdQuery = async (
  db: Firestore,
  playlistId: string
) => {
  try {
    const playlistDocument = await getDoc(doc(db, `/playlists/${playlistId}`));

    if (!playlistDocument.exists()) {
      throw new Error("Playlist not found");
    }

    const data = playlistDocument.data();
    const playlist: IPlaylist = {
      id: playlistDocument.id,

      user: data.user,

      name: data.name,
      songIds: data.songIds,

      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    debugMethod(`Playlist ${playlistId} retrieved successfully`);
    return playlist;
  } catch (error) {
    errorMethod(`Get Playlist using id: ${playlistId} failed:`, error);
    throw error;
  }
};

export const getPlaylistsByUserIdQuery = async (
  db: Firestore,
  userId: string,
  limitCount?: number,
  startAfterId?: QueryDocumentSnapshot<DocumentData>
) => {
  const playlists: IPlaylist[] = [];

  let playlistsQuery = query(
    collection(db, "playlists"),
    where("user.uid", "==", userId)
  );

  if (limitCount) {
    playlistsQuery = query(playlistsQuery, limit(limitCount));
  }

  if (startAfterId && startAfterId.id) {
    playlistsQuery = query(playlistsQuery, startAfter(startAfterId));
  }

  const playlistsSnapshots = await getDocs(playlistsQuery);

  // Get the last visible document
  if (playlistsSnapshots && playlistsSnapshots.size > 0) {
    const lastVisible =
      playlistsSnapshots.docs[playlistsSnapshots.docs.length - 1];

    playlistsSnapshots.forEach(playlistSnapshot => {
      const data = playlistSnapshot.data();
      playlists.push({
        id: playlistSnapshot.id,
        user: data.user,

        name: data.name,
        songIds: data.songIds,

        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return { lastVisible, playlists };
  } else {
    return { lastVisible: undefined, playlists };
  }
};

export const addSongToPlaylistQuery = async (
  db: Firestore,
  playlistId: string,
  songId: string
) => {
  const playlistRef = doc(db, `/playlists/${playlistId}`);

  // Atomically add a new song to the "songIds" array field.
  await updateDoc(playlistRef, {
    songIds: arrayUnion(songId),
  });

  debugMethod(
    `Playlist ${playlistId} updated successfully with adding ${songId} `
  );
};

export const removeSongFromPlaylistQuery = async (
  db: Firestore,
  playlistId: string,
  songId: string
) => {
  const playlistRef = doc(db, `/playlists/${playlistId}`);

  // Atomically add a new song to the "songIds" array field.
  await updateDoc(playlistRef, {
    songIds: arrayRemove(songId),
  });

  debugMethod(
    `Playlist ${playlistId} updated successfully with removing ${songId} `
  );
};
//#endregion

//#region UserAppConfig Region
export const getUserAppConfigQuery = async (db: Firestore, userId: string) => {
  // debug('Trying to read userAppConfig using id', userId);
  const userAppConfigDoc = await getDoc(doc(db, "userAppConfig", userId));

  if (userAppConfigDoc.exists()) {
    // debug(`Found user app config document with id ${userId}`);

    const userAppConfig = userAppConfigDoc.data() as IUserAppConfig;
    userAppConfig.id = userAppConfigDoc.id;

    // debug('userAppConfig', userAppConfig);
    return userAppConfig;
  } else {
    throw new Error(`userAppConfig cannot be found (id: ${userId})`);
  }
};

export const updateUserAppConfigQuery = async (
  db: Firestore,
  userId: string,
  userAppConfig: {
    language?: string;
    fontSize?: number;
    showTablature?: boolean;
    enablePageTurner?: boolean;
  }
) => {
  const now = serverTimestamp() as Timestamp;

  // add using existing id
  await setDoc(
    doc(db, "userAppConfig", userId),
    {
      ...userAppConfig,
      updatedAt: now,
    },
    { merge: true }
  );

  debugMethod(`UserAppConfig ${userId} updated successfully`);
};
//#endregion

//#region AppConfig Region
export const getAppConfigQuery = async (db: Firestore, id: string) => {
  // debug('Trying to read appConfig using id', id);
  const appConfigDoc = await getDoc(doc(db, "appConfig", id));

  if (appConfigDoc.exists()) {
    // debug(`Found app config document with id ${id}`);

    const appConfig = appConfigDoc.data() as IAppConfig;
    appConfig.id = appConfigDoc.id;

    // debug('appConfig', appConfig);
    return appConfig;
  } else {
    throw new Error(`AppConfig cannot be found (id: ${id})`);
  }
};

export const updateAppConfigQuery = async (
  db: Firestore,
  appConfig: IAppConfig
) => {
  if (appConfig.id) {
    await updateDoc(doc(db, "appConfig", appConfig.id), { ...appConfig });
    debugMethod(`AppConfig ${appConfig.id} updated successfully`);
    return appConfig;
  } else {
    throw new Error("AppConfig.id is empty");
  }
};
//#endregion

//#region
// add a field and value to a firestore table
// optionally use a queryConstraint to only include some of the table elements
// e.g. where('user.uid', '==', user.uid);
export const bulkAddFieldToSongsQuery = async (
  db: Firestore,
  tableName: string,
  fieldName: string,
  fieldValue: unknown,
  queryConstraint?: QueryConstraint
) => {
  const limitCount = 50;

  let itemsCollection: Query = collection(db, tableName);

  // add query constraint if it was passed,
  // e.g.
  // const queryConstraint = where('user.uid', '==', user.uid);
  if (queryConstraint) {
    itemsCollection = query(itemsCollection, queryConstraint);
  }

  let allItemsResult = await getDocs(query(itemsCollection, limit(limitCount)));

  let read = allItemsResult.docs.length;

  while (read > 0) {
    // Get a new write batch
    const batch = writeBatch(db);

    let updated = 0;

    allItemsResult.docs.forEach(queryResult => {
      const data = queryResult.data();

      if (
        !data.hasOwnProperty(fieldName) ||
        (data.hasOwnProperty(fieldName) && data[fieldName] !== fieldValue)
      ) {
        updated++;

        batch.update(queryResult.ref, fieldName, fieldValue);
      }
    });

    await batch.commit();
    debugMethod(`Updated ${updated} of ${read} items!`);

    const lastVisible = allItemsResult.docs[read - 1];

    allItemsResult = await getDocs(
      query(itemsCollection, startAfter(lastVisible), limit(limitCount))
    );

    read = allItemsResult.docs.length;
  }
};
//#endregion
