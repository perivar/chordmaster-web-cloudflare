import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { createSlice, PayloadAction, UnknownAction } from "@reduxjs/toolkit";
import { APP_DEFAULTS, USER_APP_DEFAULTS } from "~/constants/defaults";
import {
  addItemToArray,
  addOrUpdateItemInArray,
  addOrUpdateItemsInArray,
  deleteItemFromArray,
  editItemInArray,
} from "~/utils/arrayUtilities";
import { convertTimestampsInArray } from "~/utils/convertTimestamp";
import { getCache, setCache } from "~/utils/localStorageUtils";

import {
  IAppConfig,
  IArtist,
  IAuthUser,
  IPlaylist,
  ISong,
  IUserAppConfig,
} from "~/lib/firestoreQueries";

import { useFirebase } from "./FirebaseContext";

type State = {
  songs: ISong[];
  artists: IArtist[];
  playlists: IPlaylist[];
  appConfig: IAppConfig;
  userAppConfig: IUserAppConfig;
};

const initialState: State = {
  songs: [],
  playlists: [],
  artists: [],
  appConfig: APP_DEFAULTS,
  userAppConfig: USER_APP_DEFAULTS,
};

const CACHE_TTL = 4 * 60 * 60 * 1000; // Cache TTL in milliseconds (4 hour)
const LOCAL_STORAGE_KEY = "appState";

// Function to compare current state with initialState, while ignoring user
const isStateDifferentFromInitialState = (persistedState: State | null) => {
  if (!persistedState) return false;

  // Compare the rest of the state ignoring the user property
  return JSON.stringify(persistedState) !== JSON.stringify(initialState);
};

export const saveStateToLocalStorage = (state: State, user?: IAuthUser) => {
  try {
    if (user?.uid) {
      const userKey = user.uid;
      const localStorageKey = `${LOCAL_STORAGE_KEY}_${userKey}`;

      // Check if the state is different from the initial state
      if (!isStateDifferentFromInitialState(state)) {
        return; // Exit if the state hasn't changed
      }

      setCache(localStorageKey, state, CACHE_TTL);
    }
  } catch (error) {
    console.error("Could not save state", error);
  }
};

// Load state from local storage using the user-specific key
export const loadStateFromLocalStorage = (
  user?: IAuthUser
): State | undefined => {
  if (!user) return undefined;

  const localStorageKey = `${LOCAL_STORAGE_KEY}_${user.uid}`;

  try {
    // getCache returns null if non-existent or expired
    const persistedState = getCache(localStorageKey);

    if (!persistedState) return undefined;

    // The Firestore Timestamp objects may lose their prototype methods when they are serialized or deserialized.
    return {
      ...persistedState,
      songs: convertTimestampsInArray(persistedState.songs),
      artists: convertTimestampsInArray(persistedState.artists),
      playlists: convertTimestampsInArray(persistedState.playlists),
    };
  } catch (error) {
    console.error(`Could not load state for user ${user.uid}:`, error);
    return undefined;
  }
};

// Create slice using @reduxjs/toolkit
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Song Reducers
    setSongsReducer(state, action: PayloadAction<ISong[]>) {
      state.songs = action.payload;
    },
    addOrUpdateSongsReducer(state, action: PayloadAction<ISong[]>) {
      state.songs = addOrUpdateItemsInArray(state.songs, action.payload);
    },
    addSongReducer(state, action: PayloadAction<ISong>) {
      state.songs = addItemToArray(state.songs, action.payload);
    },
    addOrUpdateSongReducer(state, action: PayloadAction<ISong>) {
      state.songs = addOrUpdateItemInArray(state.songs, action.payload);
    },
    editSongReducer(state, action: PayloadAction<ISong>) {
      state.songs = editItemInArray(state.songs, action.payload);
    },
    deleteSongReducer(state, action: PayloadAction<string>) {
      state.songs = deleteItemFromArray(state.songs, action.payload);
    },

    // Artist Reducers
    setArtistsReducer(state, action: PayloadAction<IArtist[]>) {
      state.artists = action.payload;
    },
    addOrUpdateArtistsReducer(state, action: PayloadAction<IArtist[]>) {
      state.artists = addOrUpdateItemsInArray(state.artists, action.payload);
    },
    addArtistReducer(state, action: PayloadAction<IArtist>) {
      state.artists = addItemToArray(state.artists, action.payload);
    },
    addOrUpdateArtistReducer(state, action: PayloadAction<IArtist>) {
      state.artists = addOrUpdateItemInArray(state.artists, action.payload);
    },
    editArtistReducer(state, action: PayloadAction<IArtist>) {
      state.artists = editItemInArray(state.artists, action.payload);
    },
    deleteArtistReducer(state, action: PayloadAction<string>) {
      state.artists = deleteItemFromArray(state.artists, action.payload);
    },

    // Playlist Reducers
    setPlaylistsReducer(state, action: PayloadAction<IPlaylist[]>) {
      state.playlists = action.payload;
    },
    addOrUpdatePlaylistsReducer(state, action: PayloadAction<IPlaylist[]>) {
      state.playlists = addOrUpdateItemsInArray(
        state.playlists,
        action.payload
      );
    },
    addPlaylistReducer(state, action: PayloadAction<IPlaylist>) {
      state.playlists = addItemToArray(state.playlists, action.payload);
    },
    addOrUpdatePlaylistReducer(state, action: PayloadAction<IPlaylist>) {
      state.playlists = addOrUpdateItemInArray(state.playlists, action.payload);
    },
    editPlaylistReducer(state, action: PayloadAction<IPlaylist>) {
      state.playlists = editItemInArray(state.playlists, action.payload);
    },
    deletePlaylistReducer(state, action: PayloadAction<string>) {
      state.playlists = deleteItemFromArray(state.playlists, action.payload);
    },

    // Confiig Reducers
    setAppConfigReducer: (state, action: PayloadAction<IAppConfig>) => {
      state.appConfig = action.payload;
    },
    updateAppConfigReducer: (
      state,
      action: PayloadAction<Partial<IAppConfig>>
    ) => {
      // update only part of the state
      // like dispatch(updateAppConfigReducer({language: 'en'})
      state.appConfig = { ...state.appConfig, ...action.payload };
    },
    setUserAppConfigReducer: (state, action: PayloadAction<IUserAppConfig>) => {
      state.userAppConfig = action.payload;
    },
    updateUserAppConfigReducer: (
      state,
      action: PayloadAction<Partial<IUserAppConfig>>
    ) => {
      // update only part of the state
      // like dispatch(updateUserAppConfigReducer({language: 'en'})
      state.userAppConfig = { ...state.userAppConfig, ...action.payload };
    },

    // Reset State Reducer
    resetStateReducer: () => initialState,

    // Reducer to set the entire persisted state
    setStateReducer(_state, action: PayloadAction<State>) {
      return action.payload; // Replace current state with new state
    },

    // Reducer to merge state
    mergeStateReducer(state, action: PayloadAction<State>) {
      return { ...state, ...action.payload }; // Merge persisted state with current state
    },
  },
});

// Export actions for use in components
export const {
  setSongsReducer,
  addOrUpdateSongsReducer,
  addSongReducer,
  editSongReducer,
  deleteSongReducer,
  addOrUpdateSongReducer,

  setArtistsReducer,
  addOrUpdateArtistsReducer,
  addArtistReducer,
  editArtistReducer,
  deleteArtistReducer,
  addOrUpdateArtistReducer,

  setPlaylistsReducer,
  addOrUpdatePlaylistsReducer,
  addPlaylistReducer,
  editPlaylistReducer,
  deletePlaylistReducer,
  addOrUpdatePlaylistReducer,

  // config
  setAppConfigReducer,
  updateAppConfigReducer,
  setUserAppConfigReducer,
  updateUserAppConfigReducer,

  // reset
  resetStateReducer,
  setStateReducer,
  mergeStateReducer,
} = appSlice.actions;

const AppContext = createContext<
  { state: State; dispatch: React.Dispatch<UnknownAction> } | undefined
>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useFirebase();

  // Initial state using just initialState
  const [state, dispatch] = useReducer(appSlice.reducer, initialState);

  // Save state to local storage on every state change if the user exists
  useEffect(() => {
    if (user) {
      saveStateToLocalStorage(state, user);
    }
  }, [state, user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the UserContext
// example: const { state, dispatch } = useAppContext();
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
