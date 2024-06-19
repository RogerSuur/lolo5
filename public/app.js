import { createArticleElement } from "./article.js";

import { initializeTags, tags } from "./tags.js";

document.addEventListener("DOMContentLoaded", () => {
  const rssUrlInput = document.getElementById("rss-url");
  const addFeedButton = document.getElementById("add-feed");
  const feedContainer = document.getElementById("feed-container");
  const currentFeedsList = document.getElementById("current-feeds");
  const manageFeedsButton = document.getElementById("manage-feeds");
  const dropdownContent = document.getElementById("dropdown-content");

  // Fetch feeds from localStorage
  const getFeeds = () => JSON.parse(localStorage.getItem("feeds")) || [];

  // Save feeds to localStorage
  const saveFeeds = (feeds) =>
    localStorage.setItem("feeds", JSON.stringify(feeds));

  initializeTags("tag-search", "tag-list");

  const initialFeedUrl = "https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss";

  let allArticles = [];

  //feeds to add:
  //https://www.wired.com/feed/rss
  //https://www.theguardian.com/world/rss
  // https://www.nasa.gov/rss/dyn/breaking_news.rss
  // https://techcrunch.com/feed/

  const fetchNews = async (url) => {
    try {
      const response = await fetch(
        `http://localhost:3000/rss?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching RSS feed:", error);
      return null;
    }
  };

  const displayFeed = (articles) => {
    feedContainer.innerHTML = "";
    articles.forEach((article) => {
      const articleElement = createArticleElement(article);
      feedContainer.appendChild(articleElement);
    });
  };

  const addArticles = (feed, sourceUrl) => {
    const articles = feed.items.map((item) => {
      let imageUrl = null;

      if (item["media:content"] && item["media:content"].$.url) {
        imageUrl = item["media:content"].$.url;
      } else if (item["media:thumbnail"] && item["media:thumbnail"].$.url) {
        imageUrl = item["media:thumbnail"].$.url;
      } else if (item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url;
      } else if (item.image) {
        imageUrl = item.image;
      } else if (item.description) {
        const doc = new DOMParser().parseFromString(
          item.description,
          "text/html"
        );
        const imgTag = doc.querySelector("img");
        if (imgTag) {
          imageUrl = imgTag.src;
        }
      }

      return {
        ...item,
        sourceUrl,
        image: imageUrl,
      };
    });
    allArticles.push(...articles);
    sortArticles();
  };

  const saveFeedUrl = (url) => {
    const savedFeeds = getFeeds();
    if (!savedFeeds.includes(url)) {
      savedFeeds.push(url);
      saveFeeds(savedFeeds);
    } else {
      //TODO: Handle feed already saved error
      console.error("Feed URL already saved.");
    }
  };

  const loadFeeds = async () => {
    const savedFeeds = getFeeds();
    if (!savedFeeds.includes(initialFeedUrl)) {
      savedFeeds.push(initialFeedUrl);
      saveFeeds(savedFeeds);
    }
    allArticles = [];
    feedContainer.innerHTML = "";
    for (const url of savedFeeds) {
      const rssFeed = await fetchNews(url);
      if (rssFeed) {
        addArticles(rssFeed, url);
      } else {
        console.error(`Failed to load feed from ${url}`);
      }
    }
  };

  const filterArticlesByTags = () => {
    console.log(allArticles);
    if (tags.length === 0) {
      displayFeed(allArticles);
      return;
    }

    const filteredArticles = allArticles.filter((article) => {
      return (
        article.categories &&
        tags.some((tag) =>
          article.categories.some((category) => {
            if (typeof category === "object" && category._) {
              return category._.toLowerCase().includes(tag.toLowerCase());
            } else if (typeof category === "string") {
              return category.toLowerCase().includes(tag.toLowerCase());
            }
            return false;
          })
        )
      );
    });

    displayFeed(filteredArticles);
  };

  addFeedButton.addEventListener("click", async () => {
    const feedUrl = rssUrlInput.value;
    const savedFeeds = getFeeds();
    if (feedUrl && !savedFeeds.includes(feedUrl)) {
      const rssFeed = await fetchNews(feedUrl);
      if (rssFeed) {
        saveFeedUrl(feedUrl);
        addArticles(rssFeed, feedUrl);
        rssUrlInput.value = "";
      }
    } else {
      console.error("Feed URL already saved or invalid.");
    }
    //TODO: Handle errors if not feed found
  });

  //Show/hide manage feeds section
  manageFeedsButton.addEventListener("click", () => {
    dropdownContent.classList.toggle("show");
    displayFeedUrls();
  });

  // Display feeds in the list with delete buttons
  const displayFeedUrls = () => {
    currentFeedsList.innerHTML = "";
    const feeds = getFeeds();
    if (feeds.length === 0) {
      const noFeedsMessage = document.createElement("li");
      noFeedsMessage.textContent = "No feeds added yet.";
      currentFeedsList.appendChild(noFeedsMessage);
    } else {
      feeds.forEach((feed) => {
        const feedItem = document.createElement("li");
        feedItem.textContent = feed;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteFeed(feed));
        feedItem.appendChild(deleteButton);
        currentFeedsList.appendChild(feedItem);
      });
    }
  };

  // Delete feed
  const deleteFeed = async (feedUrl) => {
    let feeds = getFeeds();
    feeds = feeds.filter((feed) => feed !== feedUrl);
    saveFeeds(feeds);
    displayFeedUrls();
    dropdownContent.classList.toggle("show");
    await loadFeeds();
  };

  const sortArticles = () => {
    const sortedArticles = allArticles.sort(
      (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
    );
    filterArticlesByTags();
  };

  document.addEventListener("tagsUpdated", () => {
    filterArticlesByTags();
  });

  loadFeeds();
});
