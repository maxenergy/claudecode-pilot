/**
 * Utility Functions
 * 
 * Common utility functions used across the project
 */

const fs = require('fs');
const path = require('path');

/**
 * Check if a directory exists
 * @param {string} dirPath - Directory path
 * @returns {boolean} True if directory exists
 */
function directoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
function ensureDirectory(dirPath) {
  if (!directoryExists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - File path
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

module.exports = {
  directoryExists,
  ensureDirectory,
  fileExists
};

