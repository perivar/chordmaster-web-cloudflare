export async function exportFile(
  directoryType: string,
  directoryName: string,
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
