export let tags = [];

export function initializeTags(tagSearchInputId, ulId) {
  const tagSearchInput = document.getElementById(tagSearchInputId);
  const ul = document.getElementById(ulId);
  const removeTag = document.getElementById("remove-tags");

  removeTag.addEventListener("click", removeAllTags);
  tagSearchInput.addEventListener("keyup", addTag);

  function removeAllTags() {
    tags = [];
    ul.querySelectorAll("li").forEach((li) => li.remove());
    dispatchTagChangeEvent();
  }

  function remove(tag) {
    let index = tags.indexOf(tag);
    if (index > -1) {
      tags.splice(index, 1);
      createTag();
      dispatchTagChangeEvent();
    }
  }

  function createTag() {
    ul.querySelectorAll("li").forEach((li) => li.remove());
    tags
      .slice()
      .reverse()
      .forEach((tag) => {
        let liTag = document.createElement("li");
        liTag.innerHTML = `
          ${tag}
          <img src="xmark.svg" alt="remove tag" class="iconoir-xmark" />
        `;
        liTag
          .querySelector(".iconoir-xmark")
          .addEventListener("click", () => remove(tag));
        ul.insertAdjacentElement("afterbegin", liTag);
      });
  }

  function addTag(e) {
    if (e.key === "Enter" || e.key === ",") {
      let tag = e.target.value.trim();
      if (tag.length > 1 && !tags.includes(tag)) {
        tag.split(",").forEach((t) => {
          t = t.trim();
          if (t.length > 1 && !tags.includes(t)) {
            tags.push(t);
            dispatchTagChangeEvent();
          }
        });
        createTag();
      }
      e.target.value = "";
    }
  }

  function dispatchTagChangeEvent() {
    const event = new CustomEvent("tagsUpdated", { detail: { tags } });
    document.dispatchEvent(event);
  }
}
