const { pool } = require("../config/db_config");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function createExcelFilesTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS excel_files (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        data JSONB
      );
    `;

    await pool.query(createTableQuery);
  } catch (error) {
    console.error("Error creating excel_files table:", error);
  }
}

const UploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is missing" });
    }

    const fileBuffer = req.file.buffer;

    await createExcelFilesTable();

    const excelFileData = xlsx.read(fileBuffer, { type: "buffer" });
    const excelSheet = excelFileData.Sheets[excelFileData.SheetNames[0]];
    const excelData = xlsx.utils.sheet_to_json(excelSheet);

    for (let i = 0; i < excelData.length; i++) {
      const data = excelData[i];
      await pool.query(
        `INSERT INTO excel_files ("name", "data") VALUES ($1, $2)`,
        [data["name"], data["data"]]
      );
    }

    const filePath = "./excel-uploads/" + req.file.originalname;
    fs.writeFile(filePath, fileBuffer, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error uploading file");
      }
      console.log("File uploaded successfully");
    });

    res
      .status(200)
      .json({ message: "File uploaded and data inserted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.stack });
  }
};

module.exports = { upload: upload.single("file"), UploadExcel };
