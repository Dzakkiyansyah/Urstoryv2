import StoriesDb from "../../data/db-helper.js";

export default class HomePresenter {
  #view;
  #model;
  #stories = [];

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;

    this.#initialGalleryAndMap();
  }

  get stories() {
    return this.#stories;
  }

  async #initialGalleryAndMap() {
    this.#view.showLoading();
    await this.#showStoriesListMap();
    await this.#displayStoriesFromDb();

    try {
      const response = await this.#model.getAllStories();

      if (!response.ok || !response.listStory) {
        throw new Error(
          response.message || "Gagal mengambil data cerita dari API."
        );
      }

      this.#stories = response.listStory;

      await this.#view.listStory(response.message, this.#stories);
    } catch (error) {
      console.error("initialGalleryAndMap: caught exception:", error);
      const storiesFromDb = await StoriesDb.getAllStories();
      if (!storiesFromDb || storiesFromDb.length === 0) {
        this.#view.listStoryError(
          error.message || "Terjadi kesalahan tidak terduga."
        );
      }
    } finally {
      this.#view.hideLoading();
    }
  }

  async #displayStoriesFromDb() {
    try {
      const stories = await StoriesDb.getAllStories();
      if (stories && stories.length > 0) {
        this.#stories = stories;
        await this.#view.listStory("Data dari Cache", stories);
      }
    } catch (error) {
      console.error("Gagal menampilkan data dari DB:", error);
    }
  }

  async #showStoriesListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showStoriesListMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }
}
