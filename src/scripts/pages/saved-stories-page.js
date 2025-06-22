import StoriesDb from "../data/db-helper";
import {
  generateStoriesItemTemplate,
  generateStoriesListEmptyTemplate,
} from "../templates";

export default class SavedStoriesPage {
  async render() {
    return `
      <section class="container stories-list__gallery-section" style="margin-top: 20px;">
        <h1 class="section-title">Cerita yang Anda Simpan</h1>
        <p class="section-subtitle">Cerita berikut tersedia bahkan saat Anda sedang offline.</p>
        <div class="stories-list__container">
          <div id="saved-stories-list" class="stories-list"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._renderSavedStories();
    this._setupDeleteButtonListeners();
  }

  async _renderSavedStories() {
    const stories = await StoriesDb.getAllStories();
    const savedStoriesListElement =
      document.getElementById("saved-stories-list");

    if (!stories || stories.length === 0) {
      savedStoriesListElement.innerHTML = generateStoriesListEmptyTemplate();
      const emptyContainer = savedStoriesListElement.querySelector(
        ".stories-list__empty"
      );
      if (emptyContainer) {
        emptyContainer.querySelector("h2").textContent =
          "Anda Belum Menyimpan Cerita";
        emptyContainer.querySelector("p").textContent =
          "Simpan cerita favorit Anda untuk membacanya di sini saat offline.";
      }
      return;
    }

    const storiesHtml = stories.map((story) =>
      generateStoriesItemTemplate({ ...story, isSaved: true, context: "saved" })
    );
    savedStoriesListElement.innerHTML = storiesHtml.join("");
  }

  _setupDeleteButtonListeners() {
    const savedStoriesListElement =
      document.getElementById("saved-stories-list");
    savedStoriesListElement.addEventListener("click", async (event) => {
      const deleteButton = event.target.closest(".delete-button");

      if (deleteButton) {
        event.preventDefault();
        const storyId = deleteButton.dataset.id;

        try {
          await StoriesDb.deleteStory(storyId);
          await this._renderSavedStories();
        } catch (error) {
          console.error(`Gagal menghapus story ${storyId}:`, error);
          alert("Gagal menghapus cerita.");
        }
      }
    });
  }
}
