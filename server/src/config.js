const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// Helper functions
function getFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  if (!fileContent) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fileContent;
}

function checkPath(filePath) {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    throw new Error(`File not found: ${filePath}`);
  }
  return filePath;
}

// Load configuration
const serverDir = checkPath(path.join(__dirname, ".."));
let srvConfig;
let admConfig;

try {
  const fileContents = fs.readFileSync(
    path.join(serverDir, "config.yaml"),
    "utf8"
  );
  const loaded = yaml.load(fileContents);
  ({ server: srvConfig, admin: admConfig } = loaded);
} catch (e) {
  console.log(e.message || e);
}

// Site files
const staticDir = path.join(__dirname, "..", "../site/dist");
const indexHtmlPath = checkPath(path.join(staticDir, "index.html"));
const indexHtml = getFile(indexHtmlPath);

// Image handling
const storagePath = checkPath(path.join(serverDir, "storage"));
const imagesDir = checkPath(path.join(storagePath, "images"));

// Function to get image files from the images directory
function getImageFiles() {
  const files = fs.readdirSync(imagesDir);
  return files.filter((file) => file.endsWith(".jpg")); // Filter by .jpg files
}

const imgMap = getImageFiles(); // Get the image file names from the directory

const currentImagesCount = { count: imgMap.length };
console.log("Current image count:", currentImagesCount.count);

// Preload images
const imageCache = {};

function preloadImages() {
  imgMap.forEach((imageName) => {
    const imagePath = checkPath(path.join(imagesDir, imageName));
    imageCache[imageName] = fs.readFileSync(imagePath);
  });
}

preloadImages();

console.log("Config loaded");
module.exports = {
  staticDir,
  serverDir,
  indexHtml,
  currentImagesCount,
  imgMap,
  imageCache,
  srvConfig,
  admConfig,
};
