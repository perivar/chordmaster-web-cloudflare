/**
 * Trims leading spaces from the start of a string and ensures only one leading space remains if there are two or more.
 *
 * @param str - The input string to process.
 * @returns A new string with excessive leading spaces trimmed.
 */
export const trimStartMultiple = (str: string) => {
  return str.replace(/^\s{2,}/g, " "); // Matches and replaces 2 or more leading spaces with a single space.
};

/**
 * Trims trailing spaces from the end of a string and ensures only one trailing space remains if there are two or more.
 *
 * @param str - The input string to process.
 * @returns A new string with excessive trailing spaces trimmed.
 */
export const trimEndMultiple = (str: string) => {
  return str.replace(/\s{2,}$/g, " "); // Matches and replaces 2 or more trailing spaces with a single space.
};

/**
 * Trims both leading and trailing spaces from a string, ensuring only one leading or trailing space remains
 * if there are two or more in either position.
 *
 * @param str - The input string to process.
 * @returns A new string with excessive spaces at both ends trimmed.
 */
export const trimMultiple = (str: string) => {
  const first = trimStartMultiple(str); // Trim leading spaces first.
  const second = trimEndMultiple(first); // Then trim trailing spaces.
  return second; // Return the fully trimmed string.
};
