import { auth } from "~/firebase-service";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// Hook for firebase authentication methods
export const useFirebaseAuth = () => {
  const loginWithGoogle = async () => {
    return await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const loginWithEmailAndPassword = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const createUser = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const sendForgottenPasswordEmail = async (email: string) => {
    return await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    return await signOut(auth);
  };

  return {
    loginWithEmailAndPassword,
    loginWithGoogle,
    createUser,
    sendForgottenPasswordEmail,
    logout,
  };
};
