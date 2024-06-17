import express from "express";
const app = express();
import fetch from "node-fetch";
import Parser from "rss-parser";

const port = 3000;
const parser = new Parser({
  customFields: {
    item: ["media:content"],
  },
});

app.use(express.static("public"));
app.use(express.json());

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
    res.json(feed);
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error);
    res.status(500).send({ error: "Failed to fetch or parse RSS feed" });
  }
});

app.post("/webparser", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  }

  try {
    const response = await fetch(
      "https://uptime-mercury-api.azurewebsites.net/webparser",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }
    );

    if (!response.ok) {
      throw new Error(`Mercury API response not ok: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch clutter-free content" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
