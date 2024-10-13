/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { startTransition, StrictMode } from "react";
import { RemixBrowser } from "@remix-run/react";
import i18next from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next/client";

import i18n from "./i18n/i18n";

async function hydrate() {
  await i18next
    .use(initReactI18next)
    .use(I18nextBrowserLanguageDetector)
    // .use(Backend) // Cloudflare cannot use the i18next-fs-backend backend, instead ßßbundling the resource files
    .init({
      ...i18n,
      // This function detects the namespaces your routes rendered while SSR use
      ns: getInitialNamespaces(),
      detection: {
        // Here only enable htmlTag detection, we'll detect the language only
        // server-side with remix-i18next, by using the `<html lang>` attribute
        // we can communicate to the client the language detected server-side
        order: ["htmlTag"],
        // Because we only use htmlTag, there's no reason to cache the language
        // on the browser, so we disable it
        caches: [],
      },
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <RemixBrowser />
        </StrictMode>
      </I18nextProvider>
    );
  });
}

// TODO: commenting out due to https://github.com/remix-run/remix/issues/4281
// if (window.requestIdleCallback) {
//   window.requestIdleCallback(hydrate);
// } else {
//   // Safari doesn't support requestIdleCallback
//   // https://caniuse.com/requestidlecallback
//   window.setTimeout(hydrate, 1);
// }

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then(registration => {
//         console.log(
//           "Service Worker registered with scope:",
//           registration.scope
//         );
//       })
//       .catch(error => {
//         console.warn("Service Worker registration failed:", error);
//       });

//     // Optional: Send a message to the service worker
//     navigator.serviceWorker.ready.then(registration => {
//       registration.active?.postMessage("Hello from the main thread!");
//     });
//   });
// }

hydrate().catch(error => console.error(error));
