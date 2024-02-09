require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const urlParser = require("url");
const cors = require("cors");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Schema and model
let urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
});

let Urls = mongoose.model("urls", urlSchema);

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
  dns.lookup(urlParser.parse(req.body.url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "invalid url" });
    } else {
      const urlCount = await Urls.find().countDocuments();
      console.log("urlCount", urlCount);
      const url = new Urls({
        original_url: req.body.url,
        short_url: urlCount,
      });
      url
        .save()
        .then((data) => {
          res.json({
            original_url: data.original_url,
            short_url: data.short_url,
          });
        })
        .catch((err) => console.log(err));
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
