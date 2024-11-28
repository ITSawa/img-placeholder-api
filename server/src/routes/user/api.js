// routes/apiRouter.js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { currentImagesCount, imgMap, imageCache } = require("../../config");

// Define a rate limit for the "heavy" routes
const heavyRouteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 40, // Limit each IP to 20 requests per window (1 hour)
  message: "Too many requests from this IP, please try again after an hour",
});

const lightRouteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3600, // Limit each IP to 3600 requests per window (1 hour)
  message: "Too many requests from this IP, please try again after an hour",
});

router.get("/images/:id", lightRouteLimiter, (req, res) => {
  const imageId = req.params.id;
  const imageName = `image-${imageId}.jpg`;

  if (!imageId || !imgMap.includes(imageName)) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  const image = imageCache[imageName];
  res.end(image);
});

router.get("/images-random", lightRouteLimiter, (req, res) => {
  const randomIndex = Math.floor(Math.random() * currentImagesCount.count);
  const imageName = `image-${randomIndex + 1}.jpg`;

  const image = imageCache[imageName];
  res.end(image);
});

// Apply rate limiter to heavy routes
router.get("/images-random-to-header", heavyRouteLimiter, (req, res) => {
  const images = [];
  const imageNames = Object.keys(imageCache);

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * imageNames.length);
    const imageName = imageNames[randomIndex];
    images.push(imageCache[imageName]);
  }

  res.json(images);
});

router.get(
  "/random-images-by-quantity/:count",
  heavyRouteLimiter,
  (req, res) => {
    if (
      !req.params.count ||
      isNaN(req.params.count) ||
      req.params.count < 1 ||
      req.params.count > 10
    ) {
      return res
        .status(400)
        .json({ error: "Expected a number between 1 and 10" });
    }

    const count = parseInt(req.params.count);
    const images = [];

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * currentImagesCount.count);
      const imageName = `image-${randomIndex + 1}.jpg`;
      images.push(imageCache[imageName]);
    }

    res.json(images);
  }
);

router.get("/images-how-many", (req, res) => {
  res.json({ count: currentImagesCount.count });
});

module.exports = router;
