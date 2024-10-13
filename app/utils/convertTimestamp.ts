import { Timestamp } from "firebase/firestore/lite";

// When you retrieve a Firestore document that contains Timestamp fields (createdAt and updatedAt),
// and you store this data in a state or local storage, the Firestore Timestamp objects may lose
// their prototype methods when they are serialized or deserialized.
export const convertToTimestamp = (obj: unknown): Timestamp | undefined => {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "seconds" in obj &&
    "nanoseconds" in obj
  ) {
    const castObj = obj as { seconds: number; nanoseconds: number };
    return new Timestamp(castObj.seconds, castObj.nanoseconds);
  }
  return undefined;
};

// Make sure the createdAt and updatedAt fields in an array are converted to Timestamp
export const convertTimestampsInArray = <
  T extends { createdAt?: Timestamp; updatedAt?: Timestamp },
>(
  array: T[]
): T[] => {
  return array.map(item => ({
    ...item,
    createdAt: convertToTimestamp(item.createdAt),
    updatedAt: convertToTimestamp(item.updatedAt),
  }));
};
