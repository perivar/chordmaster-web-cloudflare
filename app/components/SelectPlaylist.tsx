import { FunctionComponent, useState } from "react";
import { Dialog, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { setPlaylistsReducer, useAppContext } from "~/context/AppContext";
import { useFirebase } from "~/context/FirebaseContext";
import { addItemToArray } from "~/utils/arrayUtilities";
import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import useFirestore from "~/hooks/useFirestore";
import useFirestoreMethods from "~/hooks/useFirestoreMethods";

import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { DialogContent, DialogHeader } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
  show: boolean;
  songId?: string;
  onPressClose: () => void;
}

const SelectPlaylist: FunctionComponent<Props> = ({
  show,
  songId,
  onPressClose,
}) => {
  const { t } = useTranslation();
  const { hasPlaylistContainsSong, playlistRemoveSong, playlistAddSong } =
    useFirestoreMethods();

  const { addNewPlaylist } = useFirestore();
  const { state, dispatch } = useAppContext();
  const { user } = useFirebase();

  const allPlaylists = state.playlists;

  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPlaylistName, setNewPlaylistName] = useState("");

  const onSelectPlaylist = async (id: string) => {
    console.log("Selecting playlist:", id);
    const playlist = allPlaylists.find(a => a.id === id);

    if (songId && playlist && playlist.id) {
      if (hasPlaylistContainsSong(playlist.id, songId)) {
        await playlistRemoveSong(playlist.id, songId);
      } else {
        await playlistAddSong(playlist.id, songId);
      }
    }
  };

  const addPlaylist = async (playlistName: string, songIds: string[]) => {
    if (playlistName && user && user.uid) {
      const newPlaylist = await addNewPlaylist(
        {
          uid: user.uid!,
          email: user.email!,
          displayName: user.displayName!,
        },
        playlistName,
        songIds
      );

      // Update the playlist array
      const updatedPlaylists = addItemToArray(state.playlists, newPlaylist);

      // Dispatch setPlaylists action to update the entire playlists array
      dispatch(setPlaylistsReducer(updatedPlaylists));
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      if (newPlaylistName) {
        await addPlaylist(newPlaylistName, []);

        setNewPlaylistName("");
        setShowInput(false);
      } else {
        throw new Error(t("empty_name_not_allowed"));
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        throw e;
      }
    }
  };

  const handleClose = () => {
    onPressClose();
    setShowInput(false);
    setError(null);
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="space-y-4 p-6">
        <DialogHeader>
          <DialogTitle>{t("playlist_select")}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[200px]">
          {allPlaylists.length > 0 ? (
            allPlaylists.map(playlist => (
              <div
                key={playlist.id}
                className="mr-2 flex items-center justify-between rounded-md border border-border p-2">
                <span>{playlist.name}</span>
                <Checkbox
                  checked={hasPlaylistContainsSong(playlist.id!, songId!)}
                  onCheckedChange={() => onSelectPlaylist(playlist.id!)}
                />
              </div>
            ))
          ) : (
            <p>{t("playlists_not_found")}</p>
          )}
        </ScrollArea>

        {/* Create new playlist */}
        {showInput ? (
          <div className="space-y-2">
            <Input
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              placeholder={t("playlist_new_name")}
            />
            {/* Display error if exists */}
            {error && (
              <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
            )}
            <Button onClick={handleCreatePlaylist} variant="secondary">
              <PlusIcon className="size-4" />
              <span className="ml-2 hidden sm:block">
                {t("playlist_create")}
              </span>
            </Button>
          </div>
        ) : (
          <Button onClick={() => setShowInput(true)} variant="outline">
            <PlusIcon className="size-4" />
            <span className="ml-2 hidden sm:block">
              {t("create_new_playlist")}
            </span>
          </Button>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={handleClose}>
            {t("permission_button_negative")}
          </Button>
          <Button onClick={handleClose} variant="default">
            {t("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectPlaylist;
