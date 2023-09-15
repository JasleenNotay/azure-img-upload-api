const express = require("express");
const router = express.Router();
const uploadFileController = require("../controllers/excelUploadController");
const imageUploadController = require("../controllers/imageUploadController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res, next) => {
  console.log(req.file.mimetype);
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileType = req.file.mimetype;

  if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    uploadFileController.upload(req, res, next);
    uploadFileController.UploadExcel(req, res, next);
  } else if (
    fileExtension === ".jpg" ||
    fileExtension === ".jpeg" ||
    fileExtension === ".png"
  ) {
    imageUploadController.imgUploadApi(req, res, next);
  } else {
    res.status(400).json({ error: "Unsupported file type" });
  }
});

module.exports = router;
