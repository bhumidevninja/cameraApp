const express = require("express");
const { upload } = require("./multer");

const app = express();
const port = 4004;

app.use((req, res, next) => {
  console.log(req.url, req.method);
  next();
});

app.get("/", (req, res) => {
  res.send({
    message: "Hello world",
  });
});

app.post("/upload", async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          return reject(err);
        }
        if (!req.file) {
          return reject(new Error("No file uploaded"));
        }
        resolve();
      });
    });

    res.status(200).json({ message: "Video uploaded successfully!" });
  } catch (err) {
    console.log({ err });
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
