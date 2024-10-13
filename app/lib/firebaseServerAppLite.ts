import { initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

// read firebase config from app config
import firebaseConfig from "../../firebase-config.json";

// Initialize Firebase
// console.log(
//   "Initialize Firebase Server App Lite: " + JSON.stringify(firebaseConfig)
// );
console.log(
  "Initialize Firebase Server App Lite for " + firebaseConfig.projectId
);

// Before this method is called we need to get the user JWT token
// This is a JSON Web Token (JWT) used to identify the user to a Firebase service.
// This can be done by parsing the request header (assuming this is intercepted e.g. using a service worker)
// const authIdToken = request.headers.get("Authorization")?.split("Bearer ")[1];
export const firebaseServerAppLite = async (authIdToken: string) => {
  if (!authIdToken) {
    console.warn("Not Logged In! (no Authorization Bearer header found)");
  }

  const serverApp = initializeServerApp(firebaseConfig, {
    authIdToken,
  });

  const serverAuth = getAuth(serverApp);
  await serverAuth.authStateReady();

  if (serverAuth.currentUser === null) {
    console.warn("Invalid Token! (no currentUser found)");
  }

  const serverDB = getFirestore(serverApp);

  return {
    serverAuth,
    serverDB,
  };
};
