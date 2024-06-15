export const createArticleElement = (article) => {
  console.log(article);
  const articleElement = document.createElement("div");
  articleElement.classList.add("article");

  let imageUrl = "default-image.jpg";

  const tags = article.categories || [];
  console.log("Logging tags:", tags);
  let tagsHtml = "";

  if (tags) {
    for (const tag of tags) {
      if (tag._) {
        tagsHtml += `<span class="tag">${tag._}</span> `;
      }
    }
  }

  articleElement.innerHTML = `
                <h2>${article.title}</h2>
                <p>${article.contentSnippet}</p>
                <img src="${imageUrl}" alt="Article Image">
                <p><small><em>Published: ${new Date(
                  article.pubDate
                ).toLocaleString()}</em></small></p>
                  <div class="tags">${tagsHtml}</div>
                <a href="${article.link}" target="_blank">Read more</a>
                <hr>
            `;

  return articleElement;
};
