import * as DicodingStoryAPI from "../../data/api";
import StoriesDb from "../../data/db-helper";
import {
  generateLoaderAbsoluteTemplate,
  generateStoriesItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from "../../templates";
import Map from "../../utils/map.js";
import HomePresenter from "./home-presenter";

export default class HomePage {
  #presenter = null;
  #map = null;
  #stories = [];

  async render() {
    return `
      <section class="stories-list__map__section">
        <div class="stories-list__map__container">
          <div id="map" class="stories-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container stories-list__gallery-section">
        <h1 class="section-title">Jelajahi Cerita Terbaru</h1>

        <div class="stories-list__container">
          <div id="stories-list" class="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: DicodingStoryAPI,
    });

    this.#setupSaveButtonListeners();
  }

  #setupSaveButtonListeners() {
    const storiesListElement = document.getElementById("stories-list");
    storiesListElement.addEventListener("click", async (event) => {
      const saveButton = event.target.closest(".save-button");
      if (saveButton) {
        event.preventDefault();
        const storyId = saveButton.dataset.id;
        const storyToSave = this.#stories.find((story) => story.id === storyId);

        if (storyToSave) {
          try {
            await StoriesDb.putStory(storyToSave);
            saveButton.innerHTML = '<i class="fas fa-check"></i> Tersimpan';
            saveButton.disabled = true;
          } catch (error) {
            console.error(`Gagal menyimpan story ${storyId}:`, error);
            alert("Gagal menyimpan cerita. Silakan coba lagi.");
          }
        }
      }
    });
  }

  async listStory(message, stories) {
    this.#stories = stories;
    const storiesListElement = document.getElementById("stories-list");
    if (!storiesListElement) {
      return;
    }

    if (!stories || stories.length === 0) {
      this.listStoryEmpty();
      return;
    }

    const storiesHtml = await Promise.all(
      stories.map(async (story) => {
        const isSaved = await StoriesDb.getStory(story.id);
        if (story.lat != null && story.lon != null && this.#map) {
          const coordinate = [parseFloat(story.lat), parseFloat(story.lon)];
          this.#map.addMarker(
            coordinate,
            { alt: `Marker untuk cerita oleh ${story.name}` },
            {
              content: `<h5>Cerita oleh ${
                story.name
              }</h5><p>${story.description.substring(
                0,
                50
              )}...</p><p><a href="#/stories/${story.id}">Lihat detail</a></p>`,
            }
          );
        }
        return generateStoriesItemTemplate({ ...story, isSaved: !!isSaved });
      })
    );

    storiesListElement.innerHTML = storiesHtml.join("");
  }

  listStoryEmpty() {
    const storiesListElement = document.getElementById("stories-list");
    if (storiesListElement) {
      storiesListElement.innerHTML = generateStoriesListEmptyTemplate();
    }
  }

  listStoryError(message) {
    const storiesListElement = document.getElementById("stories-list");
    if (storiesListElement) {
      storiesListElement.innerHTML = generateStoriesListErrorTemplate(message);
    }
  }

  async initialMap() {
    if (this.#map) return;

    const mapElement = document.getElementById("map");
    if (!mapElement) {
      this.hideMapLoading();
      return;
    }

    this.showMapLoading();
    try {
      this.#map = await Map.build("#map", {
        center: [-2.548926, 118.0148634],
        zoom: 5,
      });
    } catch (error) {
      const mapLoadingContainer = document.getElementById(
        "map-loading-container"
      );
      if (mapLoadingContainer) {
        mapLoadingContainer.innerHTML = `<p class="text-error" style="text-align: center; padding: 20px;">Peta tidak dapat dimuat.</p>`;
      }
    } finally {
      this.hideMapLoading();
    }
  }

  showMapLoading() {
    const mapLoadingContainer = document.getElementById(
      "map-loading-container"
    );
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideMapLoading() {
    const mapLoadingContainer = document.getElementById(
      "map-loading-container"
    );
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = "";
    }
  }

  showLoading() {
    const storiesListLoadingContainer = document.getElementById(
      "stories-list-loading-container"
    );
    if (storiesListLoadingContainer) {
      storiesListLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideLoading() {
    const storiesListLoadingContainer = document.getElementById(
      "stories-list-loading-container"
    );
    if (storiesListLoadingContainer) {
      storiesListLoadingContainer.innerHTML = "";
    }
  }
}
