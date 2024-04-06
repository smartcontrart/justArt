const fs = require("fs").promises;
const path = require("path");

const prefixToRemove = "wuzzle#";

async function renameImages(directory) {
  const files = await fs.readdir(directory);
  for (const fileName of files) {
    const oldFilePath = path.join(directory, fileName);
    const stats = await fs.stat(oldFilePath);
    if (!stats.isFile()) {
      continue; // Skip non-files
    }

    if (fileName.startsWith(prefixToRemove)) {
      const newFileName = fileName.substring(prefixToRemove.length);
      const newFilePath = path.join(directory, newFileName);
      await fs.rename(oldFilePath, newFilePath);
      console.log(`Renamed: ${oldFilePath} to ${newFilePath}`);
    }
  }
  console.log("Image renaming completed.");
}

const directoryPath = "./wuzzlepieces"; // Replace with your actual directory

renameImages(directoryPath).catch((error) => console.error("Error:", error));
