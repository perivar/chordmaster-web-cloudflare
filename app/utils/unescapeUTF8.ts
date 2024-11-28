/**
 * Decodes a string containing percent-encoded UTF-8 characters into their
 * corresponding Unicode characters. The function replaces all occurrences
 * of percent-encoded sequences (e.g., `%20`) with their decoded equivalents.
 *
 * @param {string} str - The input string containing percent-encoded characters.
 * @returns {string} - A decoded string where percent-encoded sequences
 * have been replaced with their corresponding characters.
 *
 * @example
 * const encodedStr = "Hello%20World%21";
 * const decodedStr = unescapeUTF8(encodedStr);
 * console.log(decodedStr); // Outputs: "Hello World!"
 *
 * @note This function only decodes single-byte UTF-8 sequences (e.g., ASCII).
 * Multi-byte sequences (e.g., `%E2%82%AC` for €) will not be handled correctly.
 */
export const unescapeUTF8 = (str: string): string => {
  try {
    // Decode percent-encoded sequences to UTF-8
    return decodeURIComponent(str);
  } catch (e) {
    // Return the original string if decoding fails
    console.error("Invalid UTF-8 encoding in string:", str, e);
    return str;
  }
};
