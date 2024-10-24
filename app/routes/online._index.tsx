// app/routes/online._index.tsx

import { useEffect, useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/cloudflare";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { useFirebase } from "~/context/FirebaseContext";
import { type loader as parentLoader } from "~/root";
import { useTranslation } from "react-i18next";

import { ISong } from "~/lib/firestoreQueries";
import useFirestore from "~/hooks/useFirestore";
import { useSortableTable } from "~/hooks/useSortableTable";
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

  const loaderData = useRouteLoaderData<typeof parentLoader>("root");

  const [limitCount] = useState<number | undefined>(undefined); // 20
  const [invertOwner] = useState(true); // change the behavior to the exact opposite, only get songs that the userId does not own
  const [onlyPublished] = useState(true); // only include published songs
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useFirebase();
  const { getSongsByUserId } = useFirestore();

  const [allSongs, setAllSongs] = useState<ISong[]>();

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
        accessorKey: "artist.name",
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

  const { table, globalFilter, doGlobalFilterChange } = useSortableTable<ISong>(
    {
      columns,
      initialData: allSongs || [],
      initialPage: loaderData?.initialPage,
      initialPageSize: loaderData?.initialPageSize,
      initialFilter: loaderData?.initialFilter,
      initialSortBy: loaderData?.initialSortBy,
      initialSortOrder: loaderData?.initialSortOrder,
    }
  );

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
        filterValue={globalFilter}
        onFilterChange={doGlobalFilterChange}
        placeholder={t("search")}
      />
    </div>
  );
}
