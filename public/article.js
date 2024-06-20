export const createArticleElement = (article) => {
  const articleElement = document.createElement("div");
  articleElement.classList.add("article");

  let imageUrl = article.image || "default-image.jpeg";
  let articleSource = getSourceName(article.sourceUrl);

  const tags = article.categories || [];
  let tagsHtml = "";

  if (tags) {
    for (const tag of tags) {
      if (typeof tag == "object" && tag._) {
        tagsHtml += `<span class="tag">${tag._}</span> `;
      } else if (typeof tag === "string") {
        tagsHtml += `<span class="tag">${tag}</span> `;
      }
    }
  }

  articleElement.innerHTML = `
                <div class="article-image-container">
                  <div class="article-source">${articleSource}</div>
                  <img src="${imageUrl}" alt="Article Image" class="article-image">
                </div>
                <div class="article-content">
                <div class="article-title">${article.title}</div>
                <p class="article-description">${article.contentSnippet}</p>
                <div class="tags">${tagsHtml}</div>
                <p><small><em>Published: ${new Date(
                  article.pubDate
                ).toLocaleString()}</em></small></p>
            `;

  const modal = document.getElementById("article-modal");
  const modalBody = document.getElementById("modal-body");
  const span = document.getElementsByClassName("close")[0];

  const openModal = async () => {
    try {
      const response = await fetch("http://localhost:3000/webparser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: article.link }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.message);
      }

      modalBody.innerHTML = `
                <h2>${data.title}</h2>
                ${
                  data.date_published
                    ? `<p>${new Date(data.date_published).toLocaleString()}</p>`
                    : ""
                }
                <div>${data.content}</div>
                <a class="read-more" href="${
                  article.link
                }" target="_blank">Read more</a>
                </div>
              `;
    } catch (error) {
      modalBody.innerHTML = `
        <p>Unable to load detailed content. You can read the article <a href="${article.link}" target="_blank">here</a>.</p>
      `;
    }

    modal.style.display = "block";
  };

  articleElement
    .querySelector(".article-title")
    .addEventListener("click", openModal);
  articleElement
    .querySelector(".article-description")
    .addEventListener("click", openModal);
  articleElement
    .querySelector(".article-image")
    .addEventListener("click", openModal);

  span.onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  return articleElement;
};

const getSourceName = (url) => {
  const hostname = new URL(url).hostname;
  const matches = hostname.match(/(?:www\.)?([^\.]+)\./);
  return matches ? matches[1].toUpperCase() : hostname.toUpperCase();
};
