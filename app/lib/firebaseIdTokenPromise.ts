import { initializeFirebaseApp } from "~/firebase-service";
import { getAuth, onIdTokenChanged, type User } from "firebase/auth";

const workerApp = initializeFirebaseApp();
const auth = getAuth(workerApp);

const getUser = async () => {
  return new Promise<User | null>((resolve, reject) => {
    const unsubscribe = onIdTokenChanged(
      auth,
      user => {
        unsubscribe();
        resolve(user);
      },
      error => {
        unsubscribe();
        reject(error);
      }
    );
  });
};

export const getIdTokenPromise = async () => {
  const user = await getUser();

  if (!user) {
    return null;
  }
  return await user.getIdToken();
};
