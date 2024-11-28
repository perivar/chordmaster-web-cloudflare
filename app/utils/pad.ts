/**
 * Pads a given number with leading zeros until it reaches the specified size.
 *
 * @param num - The number to be padded.
 * @param size - The total length of the resulting string after padding. Defaults to 2.
 * @returns A string representation of the number, padded with leading zeros if necessary.
 */
export const pad = (num: number, size = 2): string => {
  // Convert the number to a string
  let s = num + "";

  // Prepend "0" to the string until its length matches the desired size
  while (s.length < size) {
    s = "0" + s;
  }

  // Return the padded string
  return s;
};
