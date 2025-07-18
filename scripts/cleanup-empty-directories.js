const fs = require('fs');
const path = require('path');

/**
 * Recursively delete all empty folders in a directory
 * @param {string} dirPath - The directory path to process
 * @param {boolean} deleteRoot - Whether to delete the root directory if it becomes empty
 * @returns {boolean} - Returns true if the directory is empty after processing
 */
function deleteEmptyFolders(dirPath, deleteRoot = false) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory does not exist: ${dirPath}`);
    return false;
  }

  if (!fs.statSync(dirPath).isDirectory()) {
    console.log(`Path is not a directory: ${dirPath}`);
    return false;
  }

  let files;
  try {
    files = fs.readdirSync(dirPath);
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err.message);
    return false;
  }

  // Process each item in the directory
  for (const file of files) {
    const fullPath = path.join(dirPath, file);

    try {
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        const isEmpty = deleteEmptyFolders(fullPath, true);

        // If subdirectory is empty, remove it from the files array
        if (isEmpty) {
          const index = files.indexOf(file);
          if (index > -1) {
            files.splice(index, 1);
          }
        }
      }
    } catch (err) {
      console.error(`Error processing ${fullPath}:`, err.message);
    }
  }

  // Check if directory is empty after processing
  const isEmpty = files.length === 0;

  if (isEmpty && deleteRoot) {
    try {
      fs.rmdirSync(dirPath);
      console.log(`Deleted empty directory: ${dirPath}`);
      return true;
    } catch (err) {
      console.error(`Error deleting directory ${dirPath}:`, err.message);
      return false;
    }
  }

  return isEmpty;
}

/**
 * Main function to start the cleanup process
 * @param {string} targetPath - The root directory to clean up
 */
function cleanupEmptyFolders(targetPath) {
  console.log(`Starting cleanup of empty folders in: ${targetPath}`);

  const absolutePath = path.resolve(targetPath);
  const result = deleteEmptyFolders(absolutePath, false);

  if (result) {
    console.log(
      'Cleanup completed. Root directory is empty but was not deleted.'
    );
  } else {
    console.log('Cleanup completed.');
  }
}

// Usage example
const targetDirectory = process.argv[2] || './target-folder';
cleanupEmptyFolders(targetDirectory);

// Export for use as a module
module.exports = { deleteEmptyFolders, cleanupEmptyFolders };
