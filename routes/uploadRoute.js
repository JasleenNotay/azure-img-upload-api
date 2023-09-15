const express = require("express");
const router = express.Router();
const uploadFileController = require("../controllers/excelUploadController");

router.post(
  "/upload",
  uploadFileController.upload,
  uploadFileController.UploadExcel
);

module.exports = router;
