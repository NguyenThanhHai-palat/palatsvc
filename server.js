const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 3000;

// Thiết lập lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "dataupload/"); // Đường dẫn thư mục để lưu file
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Tên file sẽ giữ nguyên
  },
});

const upload = multer({ storage: storage });
app.use(express.json());
// Xử lý CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/list", (req, res) => {
  res.sendFile(__dirname + "/public/listupdate.txt");
});
// Hiển thị form upload file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/music.json", (req, res) => {
  const musicJsonPath = path.join(__dirname, "music.json");
  fs.readFile(musicJsonPath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }
    const musicList = JSON.parse(data);
    res.json(musicList);
  });
});
app.get("/data", (req, res) => {
  res.sendFile(__dirname + "/private/user.json");
});

//version 60*******************
//account
app.post("/lg-60/Post", express.json(), (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    const filePath = path.join(__dirname, "private", "user.json");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      try {
        const users = JSON.parse(data);

        if (users[email] && users[email].password === password) {
          res.status(200).send("OK");
        } else {
          res.status(200).send("NO");
        }
      } catch (parseErr) {
        console.error("Error parsing JSON:", parseErr);
        res.status(500).send("Internal Server Error");
      }
    });
  } else {
    res.status(400).send("Bad Request");
  }
});
app.post("/key-start/Post", express.json(), (req, res) => {
  const { key } = req.body;

 
        if (key=="8955pltapp432") {
          res.status(200).send(`OK`);
        } else {
          res.status(200).send("Error: Key is incorrect");
        }


});
app.post("/lg-60-cgpass/Post", express.json(), (req, res) => {
  const { email } = req.body;

  if (email) {
    const filePath = path.join(__dirname, "private", "user.json");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      try {
        const users = JSON.parse(data);

        if (users[email]) {
          res.status(200).send(`${users[email].password}`);
        } else {
          res.status(200).send("UnEmail");
        }
      } catch (parseErr) {
        console.error("Error parsing JSON:", parseErr);
        res.status(500).send("Internal Server Error");
      }
    });
  } else {
    res.status(400).send("ERRORFROMSERVER-400");
  }
});
app.post("/sgu-60/Post", express.json(), (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    const filePath = path.join(__dirname, "private", "user.json");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err && err.code !== "ENOENT") {
        console.error("Error reading file:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      let jsonData = {};
      if (data) {
        try {
          jsonData = JSON.parse(data);
        } catch (parseErr) {
          console.error("Error parsing JSON:", parseErr);
          res.status(500).send("Internal Server Error");
          return;
        }
      }

      if (jsonData[email]) {
        res.status(200).send("SAME");
      } else {
        jsonData[email] = { password };

        fs.writeFile(
          filePath,
          JSON.stringify(jsonData, null, 4),
          (writeErr) => {
            if (writeErr) {
              console.error("Error writing to file:", writeErr);
              res.status(500).send("Internal Server Error");
            } else {
              console.log("Updated user.json:", jsonData);
              res.status(200).send("OK");
            }
          }
        );
      }
    });
  } else {
    res.status(400).send("Bad Request");
  }
});
app.post("/uploadmusic-byte/Post", upload.single("mp3up"), (req, res, next) => {
  const file = req.file;
  console.log(req.body);
  const asx = req.body; 
  const jsonString = asx["application/json"];
  let jsonObj = JSON.parse(jsonString);
  let fileName = jsonObj; 
  console.log(fileName.name);
  const namex = fileName.name;
  if (!file) {
    const error = new Error("Vui lòng chọn một file!");
    error.httpStatusCode = 400;
    return next(error);
  }

  if (!fileName) {
    const error = new Error("Vui lòng cung cấp tên file!");
    error.httpStatusCode = 400;
    return next(error);
  }

  // Đổi tên file thành tên mới từ body request
  const newFileName = path.join(file.destination, namex);

  // Đổi tên file trên hệ thống
  fs.rename(file.path, newFileName, (err) => {
    if (err) {
      return next(err);
    }

    console.log("File received and renamed:", {
      ...file,
      originalname: fileName,
      path: newFileName,
    });

    const directoryPath = path.join(__dirname, "dataupload");
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }
      const mp3Files = files.filter((file) => path.extname(file) === ".mp3");
      fs.writeFile("music.json", JSON.stringify(mp3Files), (err) => {
        if (err) throw err;
        console.log("Music JSON file has been saved!");
        res.status(200).send("OK");
      });
    });
  });
});
app.post("/uploadmusic-user/Post", express.json(), (req, res) => {
  console.log(req.body);
  const { name, user } = req.body;

  const filePath = path.join(__dirname, "private", "musicupload.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading file");
    }

    let users = [];
    if (data) {
      try {
        users = JSON.parse(data);
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr);
      }
    }
    users.push({ name, user });

    fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error writing file");
      }
      res.status(200).send("OK");
    });
  });
});

//old version support
app.get("/listofit", (req, res) => {
  res.sendFile(__dirname + "/music.json");
  console.log(__dirname + "/music.json");
});
app.get("/dw:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "dataupload", fileName);
  res.sendFile(filePath);

  console.log(filePath);
});

app.post("/upload", upload.single("mp3file"), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Vui lòng chọn một file!");
    error.httpStatusCode = 400;
    return next(error);
  }

  createJsonFile();
  res.redirect(
    "https://palat.io.vn/myfile/dev/PALATAPP/vn.io.palat.palatplayermusic/Upload.html"
  );
});

app.post("/uploadfile/Post", upload.single("mp3file"), (req, res, next) => {
  const file = req.file;
  console.log("Received file name:", req.file.originalname);
  if (!file) {
    const error = new Error("Vui lòng chọn một file!");
    error.httpStatusCode = 400;
    return next(error);
  }

  let originalName = file.originalname;
  const mimeParts = originalName.match(/=\?([^?]+)\?([BbQq])\?([^?]+)\?=/);
  if (mimeParts) {
    const charset = mimeParts[1];
    const encoding = mimeParts[2];
    const encodedText = mimeParts[3];

    if (encoding.toUpperCase() === "B") {
      const buffer = Buffer.from(encodedText, "base64");
      originalName = buffer.toString("utf8");
    } else if (encoding.toUpperCase() === "Q") {
      originalName = encodedText
        .replace(/_/g, " ")
        .replace(/=([A-Fa-f0-9]{2})/g, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });
    } else {
      console.log("Unsupported encoding");
    }
  }

  // Đổi tên tệp để lưu trữ trên máy chủ
  const oldPath = file.path;
  const newPath = path.join(file.destination, originalName);

  fs.rename(oldPath, newPath, function (err) {
    if (err) {
      return next(err);
    }

    console.log("File received:", {
      ...file,
      originalname: originalName,
      filename: originalName,
      path: newPath,
    });

    createJsonFile(() => {
      res.status(200).send("OK");
    });
  });
});

function createJsonFile() {
  const directoryPath = path.join(__dirname, "dataupload");
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    const mp3Files = files.filter((file) => path.extname(file) === ".mp3");
    fs.writeFile("music.json", JSON.stringify(mp3Files), (err) => {
      if (err) throw err;
      console.log("Music JSON file has been saved!");
      return;
    });
  });
}

function createJsonFile2(callback) {
  const directoryPath = path.join(__dirname, "dataupload");
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.log("Unable to scan directory: " + err);
      return;
    }
    const mp3Files = files.filter((file) => path.extname(file) === ".mp3");
    fs.writeFile("music.json", JSON.stringify(mp3Files), (err) => {
      if (err) {
        console.log("Error writing JSON file: " + err);
        return;
      }
      console.log("Music JSON file has been saved!");
      // Gọi callback nếu được cung cấp
      if (typeof callback === "function") {
        callback();
      }
    });
  });
}

// Hiển thị danh sách các file MP3 đã tải lên
app.get("/dataupload", (req, res) => {
  const directoryPath = path.join(__dirname, "dataupload");
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    const mp3Files = files.filter((file) => path.extname(file) === ".mp3");
    res.json(mp3Files);
  });
});

// Phát các file MP3 đã tải lên
app.get("/play/:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "dataupload", fileName);
  res.sendFile(filePath);
});

// Tạo file JSON chứa danh sách các file nhạc

app.post("/api/uploadlist/Post", express.json(), (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    // Đọc nội dung của tệp listupdate.txt
    fs.readFile("./public/listupdate.txt", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Kiểm tra xem email đã tồn tại trong tệp chưa
      const emailExists = data
        .split("\n")
        .some((line) => line.startsWith(email + " "));

      if (emailExists) {
        res.status(200).send("SAME");
      } else {
        // Nếu email chưa tồn tại, ghi email và password vào tệp
        fs.appendFile(
          "./public/listupdate.txt",
          `${email} ${password}\n`,
          (err) => {
            if (err) {
              console.error("Error writing to file:", err);
              res.status(500).send("Internal Server Error");
            } else {
              console.log("Email:", email, "Password:", password);
              res.status(200).send("OK");
            }
          }
        );
      }
    });
  } else {
    res.status(400).send("Bad Request");
  }
});

app.post("/api/checkaccout/Post", express.json(), (req, res) => {
  const { email, password } = req.body;

  fs.readFile(
    path.join(__dirname, "public/listupdate.txt"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        const lines = data.split("\n");
        let same = false;
        for (const line of lines) {
          if (line.trim() === `${email} ${password}`) {
            same = true;
            break;
          }
        }

        if (same) {
          res.status(200).send("OK");
        } else {
          res.status(200).send("NO");
        }
      }
    }
  );
});

app.post("/api/uploadlist", express.json(), (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    fs.appendFile(
      "./public/listupdate.txt",
      `${email} ${password}\n`,
      (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          res.status(500).send("Internal Server Error");
        } else {
          console.log("Email:", email, "Password:", password);
          res.status(200).send("OK");
        }
      }
    );
  } else {
    res.status(400).send("Bad Request");
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
