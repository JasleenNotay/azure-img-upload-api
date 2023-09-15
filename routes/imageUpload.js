const express = require("express");
const router = express.Router();
const imageUpload = require("../controllers/imageUploadController");

router.post("/upload-image", imageUpload.addImageData);

module.exports = router;
