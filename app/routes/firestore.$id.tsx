import { json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData, useNavigation } from "@remix-run/react";

import { firebaseServerAppLite } from "~/lib/firebaseServerAppLite";
import { getSongByIdQuery } from "~/lib/firestoreQueries";
import LoadingIndicator from "~/components/LoadingIndicator";

export const loader: LoaderFunction = async ({ request, params }) => {
  // get route params
  const songIdParam = params.id;

  // get search params (i.e. when using url like: ?id=123)
  const url = new URL(request.url);
  const tokenIdParam = url.searchParams.get("token");

  if (songIdParam && tokenIdParam) {
    const firebaseServer = await firebaseServerAppLite(tokenIdParam);
    if (firebaseServer) {
      const { serverDB } = firebaseServer;
      const song = await getSongByIdQuery(serverDB, songIdParam);

      return json({ songIdParam, tokenIdParam, song });
    }
  }

  return json({ songIdParam, tokenIdParam, song: undefined });
};

export default function FirestoreSongView() {
  const data = useLoaderData<typeof loader>();

  const { state } = useNavigation();

  // show loading when loader is running
  // https://github.com/remix-run/react-router/discussions/8914
  const isLoading = state === "loading";

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="relative">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
