// app/routes/_index.tsx

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, Link } from "@remix-run/react";
import { useFirebase } from "~/context/FirebaseContext";
import i18next from "~/i18n/i18n.server";
import { useTranslation } from "react-i18next";

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(request);
  return json({ title: t("title"), description: t("description") });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.title },
    { name: "description", content: data?.description },
  ];
};

export default function Index() {
  const { t } = useTranslation();
  const { user } = useFirebase();

  return (
    <section className="flex min-h-screen w-full flex-col">
      {user?.email && (
        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="grid grid-cols-2 gap-2">
            <div>{t("logged_in_as")}:</div>
            <div className="text-blue-600">{user?.email}</div>
          </div>
          <div className="text-center">
            <Link to="/logout" className="font-medium underline">
              {t("logout")}?
            </Link>
          </div>
        </div>
      )}

      <div className="container flex flex-1 justify-center overflow-x-hidden p-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 p-4 text-center md:w-1/2">
          <h1 className="text-2xl font-bold tracking-tighter md:text-3xl">
            {t("welcome_to")}
          </h1>
          <span className="bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 bg-clip-text text-3xl font-extrabold text-transparent">
            {t("title")}
          </span>{" "}
          <div className="font-sans">
            <ul className="mt-4 list-disc">
              <li>
                <Link
                  className="hover:underline"
                  to="/playlists"
                  rel="noreferrer">
                  {t("playlists")}
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline"
                  to="/artists"
                  rel="noreferrer">
                  {t("artists")}
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/songs" rel="noreferrer">
                  {t("songs")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
