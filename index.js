const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// const uploadRoute = require("./routes/uploadRoute");
const imageRoute = require("./routes/imageUpload");
const multer = require("multer");
const app = express();

app.use(multer().any());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use("/", imageRoute);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
