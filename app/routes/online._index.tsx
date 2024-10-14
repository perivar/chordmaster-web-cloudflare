// app/routes/online._index.tsx

import { useEffect, useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useFirebase } from "~/context/FirebaseContext";
import { useTranslation } from "react-i18next";

import { ISong } from "~/lib/firestoreQueries";
import useFirestore from "~/hooks/useFirestore";
import EmptyListMessage from "~/components/EmptyListMessage";
import Header from "~/components/Header";
import LoadingIndicator from "~/components/LoadingIndicator";
import SortableList from "~/components/SortableList";

export const meta: MetaFunction = () => [
  { title: "Online Search" },
  { name: "description", content: "Online Search" },
];

export default function OnlineSearchView() {
  const { t } = useTranslation();
  const [limitCount] = useState<number | undefined>(undefined); // 20
  const [invertOwner] = useState(true); // change the behavior to the exact opposite, only get songs that the userId does not own
  const [onlyPublished] = useState(true); // only include published songs
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useFirebase();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [allSongs, setAllSongs] = useState<ISong[]>();
  const [songs, setSongs] = useState<ISong[]>(allSongs ?? []);

  const { getSongsByUserId } = useFirestore();

  useEffect(() => {
    const loadSongs = async () => {
      if (!user || !user.uid) return;

      try {
        setIsLoading(true);
        console.log(`Loading ${limitCount ?? "all"} songs ...`);

        const data = await getSongsByUserId(
          user.uid,
          limitCount,
          undefined,
          invertOwner,
          onlyPublished
        );

        console.log(`Found ${data.songs.length} songs ...`);

        if (data.songs.length > 0) {
          setAllSongs(data.songs);
        }
      } catch (error) {
        console.error("Error loading songs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSongs();
  }, []);

  const onFilterChange = useMemo(
    () => (itemFilter: string) => {
      if (allSongs) {
        if (itemFilter !== "") {
          const filteredItems = allSongs.filter(
            s =>
              s.title.toLowerCase().includes(itemFilter.toLowerCase()) ||
              s.artist.name.toLowerCase().includes(itemFilter.toLowerCase())
          );
          setSongs(filteredItems);
        } else {
          // reset query
          setSongs(allSongs);
        }
      }
    },
    [allSongs]
  );

  const columns = useMemo<ColumnDef<ISong>[]>(() => {
    return [
      {
        accessorKey: "title",
        header: t("song_title"),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              <Link to={`/songspreview/${row.original.id}`}>
                {row.original.title}
              </Link>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "artist",
        header: t("artist_name"),
        hideOnMobile: true, // Custom field to hide this column on mobile
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.artist.name}</div>
          </div>
        ),
      },
    ];
  }, []);

  const table = useReactTable({
    data: songs,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
    },
  });

  if (!allSongs) {
    return <EmptyListMessage message={t("artist_or_song_not_found")} />;
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <Header title={t("community_songs")} />

      <SortableList
        table={table}
        onFilterChange={onFilterChange}
        placeholder={t("search")}
      />
    </div>
  );
}
