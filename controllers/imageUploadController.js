const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../config/db_config");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const createImagesTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS upload_images (
        id SERIAL PRIMARY KEY,
        image_link1 VARCHAR(255),
        image_link2 VARCHAR(255),
        image_link3 VARCHAR(255),
        image_link4 VARCHAR(255),
        image_link5 VARCHAR(255)
      );
    `;

    await pool.query(createTableQuery);
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

const addImageData = async (req, res) => {
  try {
    const { files } = req;
    console.log(req.files);
    if (!files || files.length > 5) {
      return res.status(400).json({ error: "Invalid number of images" });
    }

    const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg"];
    const isValidFileType = files.every((file) =>
      allowedFileTypes.includes(file.mimetype)
    );
    if (!isValidFileType) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    const folderName = uuidv4().slice(0, 8);
    const folderPath = path.join(__dirname, "..", "image-uploads", `MICTSI`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const imageLinks = [];
    const imagePromises = files.map(async (file, index) => {
      const imageName = `placeholderValue_${uuidv4().slice(0, 8)}_${
        index + 1
      }.jpg`;
      const imageUrl = `www.example/com/placeholderValue_${folderName}/${imageName}`;
      imageLinks.push(imageUrl);

      await sharp(file.buffer)
        .jpeg({ quality: 70 })
        .toFile(path.join(folderPath, imageName));
    });

    await Promise.all(imagePromises);

    await createImagesTable();

    const result = await pool.query(
      `INSERT INTO upload_images (
        image_link1,
        image_link2,
        image_link3,
        image_link4,
        image_link5
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        imageLinks[0] || null,
        imageLinks[1] || null,
        imageLinks[2] || null,
        imageLinks[3] || null,
        imageLinks[4] || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.stack });
  }
};

module.exports = { addImageData, upload: upload.single("file") };
