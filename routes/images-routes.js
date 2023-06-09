const express = require("express");
require("dotenv").config();
const { check } = require("express-validator");
const router = express.Router();
const auth = require("../auth/auth");
const rateLimiter = require("../middleware/rateLimiter");
const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  region: "eu-north-1",
});

router.use(auth);
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  rateLimiter,
  upload.single("image"),
  [
    check("userId").notEmpty().isString(),
    check("username").notEmpty().isString(),
    check("name").notEmpty().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    try {
      const userId = req.body.userId;
      const username = encodeURIComponent(req.body.username);
      const imagename = encodeURIComponent(req.body.name);
      const key = `${userId}_${uuidv4()}`.trim();
      const compressedImage = await sharp(req.file.buffer)
        .rotate()
        .resize(800)
        .jpeg({ quality: 80 })
        .toBuffer();

      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: compressedImage,
        Metadata: {
          username: username,
          uploadedAt: new Date().toISOString(),
          imagename: imagename,
        },
      };


      s3.upload(params, (err, data) => {
        if (err) {
          console.error("Error uploading the image:", err);
          res.status(500).json({ error: "Image upload failed" });
        } else {
          const uploadedImage = {
            username: username,
            imageUrl: data.Location,
            imagename: imagename,
            uploadedAt: params.Metadata.uploadedAt,
          };
          res.json(uploadedImage);
        }
      });
    } catch (error) {
      console.error("Error uploading the image:", error);
      res.status(500).json({ error: "Image upload failed" });
    }
  }
);

router.get("/", async (req, res) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
  };

  s3.listObjects(params, (err, data) => {
    if (err) {
      console.error("Error retrieving the images:", err);
      res.status(500).json({ error: "Failed to retrieve the images" });
    } else {
      const objects = data.Contents;

      Promise.all(
        objects.map((item) => {
          const headParams = {
            Bucket: params.Bucket,
            Key: item.Key,
          };

          return new Promise((resolve, reject) => {
            s3.headObject(headParams, (err, metadata) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  key: item.Key.trim(),
                  url: `${process.env.BUCKET_URL}/${item.Key}`,
                  lastModified: item.LastModified,
                  size: item.Size,
                  uploadedAt: metadata.Metadata.uploadedat || item.LastModified,
                  username: metadata.Metadata.username,
                  imagename: metadata.Metadata.imagename,
                });
              }
            });
          });
        })
      )
        .then((images) => {
          res.json(images);
        })
        .catch((error) => {
          console.error("Error retrieving the images:", error);
          res.status(500).json({ error: "Failed to retrieve the images" });
        });
    }
  });
});
router.delete("/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;
    const userId = req.body.userId;
    const extractedUserId = imageName.split("_")[0];

    if (extractedUserId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: imageName,
    };

    s3.headObject(params, (err, metadata) => {
      if (err) {
        console.error("Error deleting the image:", err);
        return res.status(404).json({ error: "Image not found" });
      }

      // Delete the image
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.error("Error deleting the image:", err);
          res.status(500).json({ error: "Failed to delete the image" });
        } else {
          console.log("Image deleted successfully");
          res.json({ message: "Image deleted successfully" });
        }
      });
    });
  } catch (error) {
    console.error("Error deleting the image:", error);
    res.status(500).json({ error: "Failed to delete the image" });
  }
});

module.exports = router;
