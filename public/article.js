export const createArticleElement = (article) => {
  const articleElement = document.createElement("div");
  articleElement.classList.add("article");

  let imageUrl = article.image ? article.image : null;

  const tags = article.categories || [];
  let tagsHtml = "";

  if (tags) {
    for (const tag of tags) {
      if (tag._) {
        tagsHtml += `<span class="tag">${tag._}</span> `;
      }
    }
  }

  articleElement.innerHTML = `
                <h2 class="article-title">${article.title}</h2>
                <img src="${imageUrl}" class="article-image">
                <p class="article-description">${article.contentSnippet}</p>
                <p><small><em>Published: ${new Date(
                  article.pubDate
                ).toLocaleString()}</em></small></p>
                  <div class="tags">${tagsHtml}</div>
                <hr>
            `;

  const modal = document.getElementById("article-modal");
  const modalBody = document.getElementById("modal-body");
  const span = document.getElementsByClassName("close")[0];

  const openModal = async () => {
    const response = await fetch("http://localhost:3000/webparser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: article.link }),
    });

    const data = await response.json();
    console.log(data.url);
    modalBody.innerHTML = `
                <h2>${data.title}</h2>
                <p>${new Date(data.date_published).toLocaleString()}</p>
                <div>${data.content}</div>
              `;
    modal.style.display = "block";
  };

  articleElement
    .querySelector(".article-title")
    .addEventListener("click", openModal);
  articleElement
    .querySelector(".article-description")
    .addEventListener("click", openModal);
  // articleElement.addEventListener("click", openModal);
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
