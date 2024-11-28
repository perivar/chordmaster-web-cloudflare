/**
 * Downloads a file with the specified name, extension, and content.
 *
 * This function creates a file dynamically in the browser using a Blob,
 * then triggers a download for the file with the given name and extension.
 *
 * @param {string} fileName - The name of the file (without extension).
 * @param {string} fileExtension - The file's extension (e.g., "json", "txt").
 * @param {string} fileContent - The content to include in the file.
 *
 * @example
 * // Downloads a JSON file named "example.json" with the content `{"key":"value"}`
 * downloadFile("example", "json", '{"key":"value"}');
 *
 * @returns {void}
 */
export async function downloadFile(
  fileName: string,
  fileExtension: string,
  fileContent: string
) {
  const blob = new Blob([fileContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.${fileExtension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
