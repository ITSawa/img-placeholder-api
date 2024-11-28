const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const util = require("util");
const { serverDir } = require("../../config");
const { v4: uuidv4 } = require("uuid");
const rateLimit = require("express-rate-limit");

const userRouter = express.Router();

// Rate limiter middleware: 3 requests per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    message: "Too many requests from this IP, please try again after an hour.",
  },
});

// Function for writing data to JSON file
const writeJsonFile = async (filePath, data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2); // format JSON with indentation
    await util.promisify(fs.writeFile)(filePath, jsonData, "utf8");
  } catch (error) {
    throw new Error("Error writing JSON file");
  }
};

// Function to check directory existence and create it
const ensureDirExistence = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        return reject(new Error("Failed to create directory"));
      }
      resolve();
    });
  });
};

// Multer configuration for saving files to preloads folder
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const dirPath = path.join(serverDir, "src", "preloads");
    try {
      await ensureDirExistence(dirPath);
      cb(null, dirPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename using UUID
    const uniqueFilename = uuidv4() + path.extname(file.originalname); // uuid + file extension
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB file size limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  },
});

// Route for image upload with rate limiting
userRouter.post(
  "/upload-image",
  limiter,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded or invalid file type." });
    }

    const imageName = req.body["image-name"];
    const imageAuthor = req.body["image-author"];
    const imagePath = req.file.filename;

    const imageData = {
      name: imageName,
      author: imageAuthor,
      url: imagePath,
      uploadedAt: new Date().toISOString(),
    };

    try {
      const preloadFilePath = path.join(
        serverDir,
        "src",
        "preloads",
        "preload.json"
      );

      // Check if preload.json exists and has data
      let preloadData = [];
      if (fs.existsSync(preloadFilePath)) {
        const fileContent = fs.readFileSync(preloadFilePath, "utf8");
        if (fileContent.trim()) {
          try {
            preloadData = JSON.parse(fileContent);
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError.message);
            preloadData = []; // Start with an empty array if parsing fails
          }
        }
      }

      preloadData.push(imageData);

      await writeJsonFile(preloadFilePath, preloadData);

      res.json({ message: "File uploaded and data saved." });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Server error occurred while processing the file." });
    }
  }
);

// Multer error handling
userRouter.use((err, req, res, next) => {
  if (
    err instanceof multer.MulterError ||
    err.message === "Only .png, .jpg and .jpeg format allowed!"
  ) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

console.log("User router loaded");
module.exports = userRouter;
