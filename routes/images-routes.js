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
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

router.use(auth);
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", rateLimiter, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    const userId = req.body.userId; 
    const imageName = `${userId}_${uuidv4()}_${req.body.name}`.trim(); 
    const compressedImage = await sharp(req.file.buffer)
      .resize(800) 
      .jpeg({ quality: 80 }) 
      .toBuffer();

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: imageName,
      Body: compressedImage,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error("Error uploading the image:", err);
        res.status(500).json({ error: "Image upload failed" });
      } else {
        // console.log("Image uploaded successfully:", data.Location);
        res.json({
          message: "Image uploaded successfully",
          imageUrl: data.Location,
          name: imageName,
        });
      }
    });
  } catch (error) {
    console.error("Error uploading the image:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
});

router.get("/", async (req, res) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
  };

  s3.listObjects(params, (err, data) => {
    if (err) {
      console.error("Error retrieving the images:", err);
      res.status(500).json({ error: "Failed to retrieve the images" });
    } else {
      const images = data.Contents.map((item) => {
        return {
          key: item.Key.trim(),
          url: `${process.env.BUCKET_URL}/${item.Key}`,
          lastModified: item.LastModified,
          size: item.Size,
        };
      });
      res.json(images);
    }
  });
});

router.delete("/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;
    const userId = req.body.userId; 
    const imageKey = req.body.imageKey;
    const extractedUserId = imageName.split("_")[0];

    if (extractedUserId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: imageKey,
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