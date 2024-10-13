import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { app, auth, db } from "~/firebase-service";
import { FirebaseApp } from "firebase/app";
import { Auth, onIdTokenChanged, type User } from "firebase/auth";
import { Firestore } from "firebase/firestore/lite";

import { IAuthUser } from "~/lib/firestoreQueries";

// Define types for Firebase and user contexts
type FirebaseContextType = {
  auth: Auth;
  db: Firestore;
  app: FirebaseApp;
  user: IAuthUser | null;
};

// Create a single context
export const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

// Provider to manage Firebase app and user state
export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IAuthUser | null>(null);

  // Handle Firebase onIdTokenChanged event to update the user
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (_user: User | null) => {
      if (!_user) {
        setUser(null);
        return;
      }

      // Handle displayName prioritizing _user.providerData[0]?.displayName
      let displayName = _user.displayName;

      // Check if displayName is null, empty, or contains "null"
      if (
        !displayName ||
        displayName.includes("null") ||
        displayName.trim() === ""
      ) {
        displayName = _user.providerData[0]?.displayName || "";
      }

      // Extract necessary user info from Firebase User object
      const userInfo: IAuthUser = {
        uid: _user.uid,
        email: _user.email || _user.providerData[0]?.email || "",
        displayName,
        avatar: _user.photoURL || _user.providerData[0]?.photoURL || "",
      };
      setUser(userInfo);
    });

    return () => unsubscribe(); // Clean up subscription on component unmount
  }, []);

  // Provide Firebase and user data in one context
  const contextValue = {
    auth,
    db,
    app,
    user,
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Hook to use the UserContext
// example: const { auth, db, user } = useFirebase();
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
