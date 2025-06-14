import * as DicodingStoryAPI from '../../data/api.js';
import { parseActivePathname } from '../../routes/url-parser.js';
import {
  generateLoaderAbsoluteTemplate,
  generateStoriesDetailErrorTemplate,
  generateStoriesDetailTemplate,
} from '../../templates.js';
import Map from '../../utils/map.js';
import StoryDetailPresenter from './story-detail-presenter.js';

export default class StoryDetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section class="story-detail-page__section">
        <div class="story-detail__container">
          <div id="storyDetailContent" class="story-detail"></div>
          <div id="storyDetailLoadingContainer" class="loading-container--page"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const url = parseActivePathname();
    const storyId = url.id;

    if (!storyId) {
      this.populateStoryDetailError('ID cerita tidak ditemukan.');
      return;
    }

    this.#presenter = new StoryDetailPresenter(storyId, {
      view: this,
      apiModel: DicodingStoryAPI,
    });

    await this.#presenter.showStoryDetail();
  }

  async populateStoryDetailAndInitialMap(message, story) {
    const storyDetailContentElement =
      document.getElementById('storyDetailContent');
    if (!storyDetailContentElement) return;

    storyDetailContentElement.innerHTML = generateStoriesDetailTemplate({
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      createdAt: story.createdAt,
      lat: story.lat,
      lon: story.lon,
      location: story.location,
    });

    if (story.lat != null && story.lon != null) {
      await this.initialMap();

      if (this.#map) {
        const storyCoordinate = [parseFloat(story.lat), parseFloat(story.lon)];
        const markerOptions = { alt: `Lokasi cerita oleh ${story.name}` };
        const popupContent = `<h5>${story.description.substring(
          0,
          30
        )}...</h5><p>Oleh: ${story.name}</p><p>Lokasi: ${
          story.location && story.location.placeName
            ? story.location.placeName
            : 'N/A'
        }</p>`;
        const popupOptions = { content: popupContent };

        this.#map.changeCamera(storyCoordinate, 15);
        this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
      }
    } else {
      const mapSection = document.querySelector('.story-detail__map-section');
      if (mapSection && !document.getElementById('mapDetail')) {
      }
    }
  }

  populateStoryDetailError(message) {
    const storyDetailContentElement =
      document.getElementById('storyDetailContent');
    if (storyDetailContentElement) {
      storyDetailContentElement.innerHTML =
        generateStoriesDetailErrorTemplate(message);
    }
  }

  async initialMap() {
    const mapElement = document.getElementById('mapDetail');
    if (this.#map || !mapElement) {
      if (!mapElement)
        console.error(
          'Elemen #mapDetail tidak ditemukan untuk peta detail cerita.'
        );
      this.hideMapLoading();
      return;
    }

    this.showMapLoading();
    try {
      this.#map = await Map.build('#mapDetail', {
        zoom: 15,
      });
    } catch (error) {
      console.error('Gagal inisialisasi peta detail:', error);
    } finally {
      this.hideMapLoading();
    }
  }

  showMapLoading() {
    const mapLoadingContainer = document.getElementById(
      'mapDetail-loading-container'
    );
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideMapLoading() {
    const mapLoadingContainer = document.getElementById(
      'mapDetail-loading-container'
    );
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = '';
    }
  }

  showStoryDetailLoading() {
    const loadingContainer = document.getElementById(
      'storyDetailLoadingContainer'
    );
    if (loadingContainer) {
      loadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideStoryDetailLoading() {
    const loadingContainer = document.getElementById(
      'storyDetailLoadingContainer'
    );
    if (loadingContainer) {
      loadingContainer.innerHTML = '';
    }
  }
}
