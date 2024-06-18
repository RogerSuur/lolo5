export const createArticleElement = (article) => {
  const articleElement = document.createElement("div");
  articleElement.classList.add("article");

  let imageUrl = article.image || "default-image.jpeg";

  const tags = article.categories || [];
  console.log(tags);
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
                <img src="${imageUrl}" alt="Article Image" class="article-image">
                <div class="article-content">
                <div class="article-title">${article.title}</div>
                <p class="article-description">${article.contentSnippet}</p>
                <div class="tags">${tagsHtml}</div>
                <p><small><em>Published: ${new Date(
                  article.pubDate
                ).toLocaleString()}</em></small></p>
                <a class="read-more" href="${
                  article.link
                }" target="_blank">Read more</a>
                </div>
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
      console.log(data);
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
                <a href="${data.url}" target="_blank">View article</a>
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
