// app/routes/playlists.$id_edit.tsx

import { FormEvent, useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { MetaFunction } from "@remix-run/cloudflare";
import { Form, Link, useNavigate, useParams } from "@remix-run/react";
import {
  addOrUpdatePlaylistReducer,
  editPlaylistReducer,
  useAppContext,
} from "~/context/AppContext";
import { GripVertical, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ISong } from "~/lib/firestoreQueries";
import useFirestore from "~/hooks/useFirestore";
import useFirestoreMethods from "~/hooks/useFirestoreMethods";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { DraggableList } from "~/components/DraggableList";
import { useConfirm } from "~/components/layout/confirm-provider";

export const meta: MetaFunction = () => [
  { title: "Edit Playlist" },
  { name: "description", content: "Edit Playlist" },
];

export default function PlaylistView() {
  const { t } = useTranslation();
  const params = useParams();
  const playlistIdParam = params?.id;

  const navigate = useNavigate();
  const confirm = useConfirm();

  const { state, dispatch } = useAppContext();
  const allSongs = state.songs;
  const allPlaylists = state.playlists;
  const playlist = allPlaylists.find(a => a.id === playlistIdParam);

  // Use type guard to filter out undefined values
  const notUndefined = (anyValue: ISong | undefined): anyValue is ISong =>
    anyValue !== undefined;
  const songs = playlist?.songIds
    .map(id => allSongs.find(s => s.id === id))
    .filter(notUndefined);

  const [error, setError] = useState<string | null>(null);

  const { editPlaylist } = useFirestore();

  const { hasPlaylistContainsSong, playlistRemoveSong } = useFirestoreMethods();

  const onUpdatePlaylistSongOrder = async (songsOrdered: ISong[]) => {
    if (playlist) {
      console.log("Original playlist song order:", playlist.songIds);

      // new order
      const songIds = songsOrdered
        .map(s => s.id)
        .filter((id): id is string => typeof id === "string");
      console.log("Updating playlist song order:", songIds);

      const newPlaylist = { ...playlist };
      newPlaylist.songIds = [...songIds];
      dispatch(editPlaylistReducer(newPlaylist));
    }
  };

  const onPressRemoveSong = async (song: ISong) => {
    console.log("onPressRemoveSong:", song.id);

    try {
      await confirm({
        title: `${t("playlist_remove_from")} (${song.title})?`,
        description: `${t("playlist_remove_are_you_sure")}?`,
      });

      if (song && song.id && playlist && playlist.id) {
        if (hasPlaylistContainsSong(playlist.id, song.id)) {
          try {
            await playlistRemoveSong(playlist.id, song.id);

            // goBack
            navigate(-1);
          } catch (e) {
            if (e instanceof Error) {
              setError(e.message);
            } else {
              throw e;
            }
          }
        } else {
          setError(
            "Could not remove song from playlist since its not a part of the playlist!"
          );
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(`Error: ${e.message}`);
      } else {
        throw e;
      }
    }
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // this will prevent Remix from submitting the form

    try {
      // read form elements
      const form = event.currentTarget;
      const formElements = form.elements as typeof form.elements & {
        "playlist-name": HTMLInputElement;
      };

      const playlistName = formElements["playlist-name"].value;

      if (playlistName === "") {
        throw new Error("Empty name not allowed");
      }

      if (songs && playlist && playlist.id) {
        const songIds = songs
          .map(s => s.id)
          .filter((id): id is string => typeof id === "string");

        const newPlaylist = await editPlaylist(
          playlist.id,
          playlistName,
          songIds
        );

        // console.log("onSubmit:", newPlaylist);
        await dispatch(addOrUpdatePlaylistReducer(newPlaylist));
      }

      // goBack
      navigate(-1);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        throw e;
      }
    }
  }

  const handleCancel = async () => {
    // goBack
    navigate(-1);
  };

  const renderOverlay = (song: ISong) => (
    <Card className="border-2 border-primary">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex flex-1 items-center">
          <Trash2 className="mr-4 size-6 text-destructive hover:bg-destructive/10 hover:text-destructive" />
          <div>
            <div className="font-semibold">{song.title}</div>
            <div className="text-sm text-gray-500">{song.artist.name}</div>
          </div>
        </div>
        <div className="mr-2 cursor-move p-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-600">
            <GripVertical className="size-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!songs) return null;

  return (
    <div className="container mx-auto my-6 max-w-4xl">
      {error && <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>}
      <div className="mb-6">
        <Form id="edit-playlist-form" onSubmit={onSubmit}>
          <div className="flex items-center justify-between gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t("permission_button_negative")}
            </Button>

            <div className="w-1/3 max-w-sm">
              <Label htmlFor="playlist-name" className="sr-only">
                Name
              </Label>
              <Input
                id="playlist-name"
                className="text-center text-xl"
                placeholder="Playlist Name"
                defaultValue={playlist?.name}
              />
            </div>

            <Button type="submit">{t("save")}</Button>
          </div>
        </Form>
      </div>

      <DraggableList<ISong>
        items={songs}
        getId={song => song.id as UniqueIdentifier}
        onReorder={onUpdatePlaylistSongOrder}
        renderItem={(song, _isDragging) => (
          <DraggableList.Item id={song.id as UniqueIdentifier}>
            <Card className={`mb-2`}>
              {/* ${isDragging ? "border-2 border-primary" : ""} */}
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-1 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-4 text-destructive transition-colors duration-200 hover:cursor-pointer hover:bg-destructive-foreground hover:text-destructive"
                    onClick={() => onPressRemoveSong(song)}>
                    <Trash2 className="size-6" />
                  </Button>
                  <div>
                    <div className="font-semibold">
                      <Link to={`/songs/${song.id}`}>{song.title}</Link>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Link to={`/artists/${song.artist.id}`}>
                        {song.artist.name}
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="mr-2 cursor-move p-2">
                  <DraggableList.DragHandle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-600">
                      <GripVertical className="size-6" />
                    </Button>
                  </DraggableList.DragHandle>
                </div>
              </CardContent>
            </Card>
          </DraggableList.Item>
        )}
        renderOverlay={renderOverlay}
      />
    </div>
  );
}
