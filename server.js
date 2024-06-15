import express from "express";
const app = express();
import fetch from "node-fetch";
import Parser from "rss-parser";

const port = 3000;
const parser = new Parser();

app.use(express.static("public"));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/rss", async (req, res) => {
  const feedUrl = req.query.url;
  if (!feedUrl) {
    return res.status(400).send({ error: "URL parameter is required" });
  }

  try {
    const feed = await parser.parseURL(feedUrl);
    console.log(feed);
    res.json(feed);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch or parse RSS feed" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
