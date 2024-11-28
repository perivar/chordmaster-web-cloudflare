// arrayUtilities.ts

//#region Generic Utility Methods
// This constraint ensures that T has an "id" property
export interface Identifiable {
  id: string;
}

// Generic utility function to add an item in an array
export const addItemToArray = <T extends Partial<Identifiable>>(
  array: T[],
  newItem: T
): T[] => {
  const updatedArray = [...array];

  // Add new item
  updatedArray.push(newItem);

  return updatedArray;
};

// Generic utility function to add or update an item in an array
export const addOrUpdateItemInArray = <T extends Partial<Identifiable>>(
  array: T[],
  newItem: T
): T[] => {
  const updatedArray = [...array];
  const itemIndex = updatedArray.findIndex(item => item.id === newItem.id);

  if (itemIndex !== -1) {
    // Update existing item
    updatedArray[itemIndex] = { ...updatedArray[itemIndex], ...newItem };
  } else {
    // Add new item
    updatedArray.push(newItem);
  }

  return updatedArray;
};

// Generic utility function to set or update multiple items in an array
export const addOrUpdateItemsInArray = <T extends Partial<Identifiable>>(
  array: T[],
  newItems: T[]
): T[] => {
  let updatedArray = [...array];

  newItems.forEach(newItem => {
    updatedArray = addOrUpdateItemInArray(updatedArray, newItem);
  });

  return updatedArray;
};

// Generic utility function to edit an item in an array
export const editItemInArray = <T extends Partial<Identifiable>>(
  array: T[],
  editedItem: T
): T[] => {
  const updatedArray = [...array];
  const itemIndex = updatedArray.findIndex(item => item.id === editedItem.id);

  if (itemIndex !== -1) {
    updatedArray[itemIndex] = {
      ...updatedArray[itemIndex],
      ...editedItem,
    };
  }

  return updatedArray;
};

// Generic utility function to delete an item from an array
export const deleteItemFromArray = <T extends Partial<Identifiable>>(
  array: T[],
  itemId: string
): T[] => {
  return array.filter(item => item.id !== itemId);
};
//#endregion
