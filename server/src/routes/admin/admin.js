const express = require("express");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { serverDir, admConfig } = require("../../config");

const AdminRouter = express.Router();

// Path to admin.html and preload.json
const adminHtmlPath = path.join(
  serverDir,
  "src",
  "routes",
  "admin",
  "admin.html"
);
const preloadJsonPath = path.join(serverDir, "src", "preloads", "preload.json");
const preloadsDir = path.join(serverDir, "src", "preloads");

// Rate limit configuration: 3 requests per 1 hour
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    success: false,
    message: "Too many login attempts. Try again in an hour.",
  },
});

// Route for getting admin.html
AdminRouter.get("/admin-panel", (req, res) => {
  res.sendFile(adminHtmlPath); // Send admin.html file
});

// Apply rate limiting to login route
AdminRouter.post("/login", loginLimiter, (req, res) => {
  const { login, password } = req.body;

  if (login === admConfig.login && password === admConfig.password) {
    req.session.isAuthenticated = true; // Mark session as authenticated
    res.json({ success: true, message: "Authentication successful!" });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Invalid login or password!" });
  }
});

// Route to get info about images
AdminRouter.get("/images", (req, res) => {
  if (req.session.isAuthenticated) {
    fs.readFile(preloadJsonPath, "utf8", (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to load images!" });
      }

      const images = JSON.parse(data);
      res.json({ success: true, images });
    });
  } else {
    res.status(403).json({ success: false, message: "Not authorized!" });
  }
});

// Route to load preload images
AdminRouter.get("/preload-images", (req, res) => {
  if (req.session.isAuthenticated) {
    fs.readFile(preloadJsonPath, "utf8", (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to load preload images!" });
      }

      const images = JSON.parse(data);
      const imagePaths = images.map((image) => ({
        name: image.name,
        path: path.join(preloadsDir, image.path), // Path to image
        uploadedAt: image.uploadedAt,
      }));

      res.json({ success: true, images: imagePaths });
    });
  } else {
    res.status(403).json({ success: false, message: "Not authorized!" });
  }
});

// Route to get a specific image
AdminRouter.get("/image/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(preloadsDir, imageName);

  res.sendFile(imagePath, (err) => {
    if (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to load image!" });
    }
  });
});

// Route to delete an image
AdminRouter.delete("/delete-image/:id", (req, res) => {
  if (req.session.isAuthenticated) {
    const imageId = req.params.id;

    fs.readFile(preloadJsonPath, "utf8", (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to load preload data!" });
      }

      let images = JSON.parse(data);
      const imageIndex = images.findIndex((img) => img.name === imageId);

      if (imageIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Image not found!" });
      }

      const imageToDelete = images[imageIndex];
      const imagePath = path.join(preloadsDir, imageToDelete.path);

      // Delete the image file
      fs.unlink(imagePath, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Failed to delete image file!" });
        }

        // Remove the image from the array
        images.splice(imageIndex, 1);

        // Update the preload.json file
        fs.writeFile(
          preloadJsonPath,
          JSON.stringify(images, null, 2),
          (err) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Failed to update preload data!",
              });
            }

            res.json({ success: true, message: "Image deleted successfully!" });
          }
        );
      });
    });
  } else {
    res.status(403).json({ success: false, message: "Not authorized!" });
  }
});

console.log("Admin router loaded");
module.exports = AdminRouter;
