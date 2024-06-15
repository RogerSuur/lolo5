import { createArticleElement } from "./article.js";

import { initializeTags, tags } from "./tags.js";

document.addEventListener("DOMContentLoaded", () => {
  const rssUrlInput = document.getElementById("rss-url");
  const addFeedButton = document.getElementById("add-feed");
  const feedContainer = document.getElementById("feed-container");
  // const tagSearchInput = document.getElementById("tag-search");
  // const ul = document.querySelector("ul");
  // tagSearchInput.addEventListener("keyup", addTag);
  // let tags = [];

  // function remove(tag) {
  //   let index = tags.indexOf(tag);
  //   if (index > -1) {
  //     tags.splice(index, 1);
  //     createTag();
  //   }
  // }

  // function createTag() {
  //   ul.querySelectorAll("li").forEach((li) => li.remove());
  //   tags
  //     .slice()
  //     .reverse()
  //     .forEach((tag) => {
  //       let liTag = document.createElement("li");
  //       liTag.innerHTML = `
  //               ${tag}<img
  //                 src="xmark.svg"
  //                 alt="remove tag"
  //                 class="iconoir-xmark"
  //               />
  //             `;
  //       liTag
  //         .querySelector(".iconoir-xmark")
  //         .addEventListener("click", () => remove(tag));
  //       ul.insertAdjacentElement("afterbegin", liTag);
  //     });
  // }

  // function addTag(e) {
  //   if (e.key == "Enter") {
  //     let tag = e.target.value.trim();
  //     if (tag.length > 1 && !tags.includes(tag)) {
  //       tag.split(",").forEach((tag) => {
  //         tag = tag.trim();
  //         if (tag.length > 1 && !tags.includes(tag)) {
  //           tags.push(tag);
  //         }
  //       });
  //       createTag();
  //     }
  //     e.target.value = "";
  //   }
  // }

  initializeTags("tag-search", "tag-list");

  const initialFeedUrl = "https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss";

  const allArticles = [];

  //feeds to add:
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

  const initialFeed = async () => {
    const feed = await fetchNews(initialFeedUrl);
    if (feed) {
      addArticles(feed);
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
    const articles = feed.items.map((item) => ({
      ...item,
      sourceUrl,
    }));
    allArticles.push(...articles);
    sortArticles();
  };

  const saveFeedUrl = (url) => {
    const savedFeeds = JSON.parse(localStorage.getItem("feeds")) || [];
    if (!savedFeeds.includes(url)) {
      savedFeeds.push(url);
      localStorage.setItem("feeds", JSON.stringify(savedFeeds));
    } else {
      //TODO: Handle feed already saved error
      console.error("Feed URL already saved.");
    }
  };

  const loadFeeds = async () => {
    const savedFeeds = JSON.parse(localStorage.getItem("feeds")) || [];
    for (const url of savedFeeds) {
      const rssFeed = await fetchNews(url);
      if (rssFeed) {
        addArticles(rssFeed);
        // displayFeed(feed);
      } else {
        console.error(`Failed to load feed from ${url}`);
      }
    }
  };

  const filterArticlesByTags = () => {
    if (tags.length === 0) {
      displayFeed(allArticles);
      return;
    }

    const filteredArticles = allArticles.filter((article) => {
      return (
        article.categories &&
        tags.some((tag) =>
          article.categories.some(
            (category) =>
              category._ && category._.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    });

    displayFeed(filteredArticles);
  };

  // tagSearchInput.addEventListener("input", () => {
  //   const tag = tagSearchInput.value;
  //   filterArticlesByTag(tag);
  // });

  addFeedButton.addEventListener("click", async () => {
    const feedUrl = rssUrlInput.value;
    if (feedUrl) {
      const rssFeed = await fetchNews(feedUrl);
      if (rssFeed) {
        saveFeedUrl(feedUrl);
        addArticles(rssFeed, feedUrl);
      }
      //TODO: Handle errors if not feed found
    }
    //rssUrlInput.value = "";
  });

  const sortArticles = () => {
    const sortedArticles = allArticles.sort(
      (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
    );
    filterArticlesByTags();
  };

  document.addEventListener("tagsUpdated", () => {
    filterArticlesByTags();
  });

  initialFeed();
  loadFeeds();
});
