import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

// Read firebase config from your environment or a JSON config file
import firebaseConfig from "../firebase-config.json";

// Function to initialize Firebase
export const initializeFirebaseApp = () => {
  // console.log(
  //   "Initializing firebase service: " + JSON.stringify(firebaseConfig)
  // );
  console.log("Initializing firebase service for " + firebaseConfig.projectId);

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
};

// Initialize Firebase app and services
export const app = initializeFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
