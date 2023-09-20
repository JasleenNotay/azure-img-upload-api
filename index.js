const express = require("express");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("./config/db_config");
const excelUploadController = require("./controllers/excelUploadController");
const app = express();


// Configure CORS
const corsOptions = {
  origin: 'https://imgupload-frontend.azurewebsites.net',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};


app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const createImagesTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS image_upload (
        id SERIAL PRIMARY KEY,
        image_link1 VARCHAR(255)
      );
    `;

    await pool.query(createTableQuery);
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

app.post("/upload", upload.single("file"), async (req, res) => {
  const fileType = req.file.mimetype;
  console.log(req.file);
  if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    fileType === "application/vnd.ms-excel"
  ) {
    excelUploadController.UploadExcel(req, res);
  } else if (fileType.startsWith("image/")) {
    try {
      const { file } = req;
      if (!file) {
        return res.status(400).json({ error: "File is missing" });
      }

      const folderName = uuidv4().slice(0, 8);
      const folderPath = path.join(__dirname, "image-uploads", "MICTSI");

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const imageName = `placeholderValue_${uuidv4().slice(0, 8)}.jpg`;
      const imageUrl = `www.example/com/placeholderValue_${folderName}/${imageName}`;

      await sharp(file.buffer)
        .jpeg({ quality: 70 })
        .toFile(path.join(folderPath, imageName));

      await createImagesTable();

      const result = await pool.query(
        `INSERT INTO image_upload (
          image_link1
        ) VALUES ($1) RETURNING *`,
        [imageUrl]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.stack });
    }
  } else {
    res.status(400).json({ error: "Invalid file type" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
