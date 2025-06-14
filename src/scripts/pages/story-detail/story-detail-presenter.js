import { storyMapper } from '../../data/api-mapper.js';

export default class StoryDetailPresenter {
  #storyId;
  #view;
  #apiModel;

  constructor(storyId, { view, apiModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
  }

  async showStoryDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoryDetailMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showStoryDetailLoading();
    try {
      const response = await this.#apiModel.getStoryById(this.#storyId);

      if (!response.ok || !response.story) {
        console.error(
          'showStoryDetail: response error or story missing:',
          response
        );
        this.#view.populateStoryDetailError(
          response.message || 'Cerita tidak ditemukan atau data tidak lengkap.'
        );
        return;
      }

      const story = await storyMapper(response.story);

      if (!story) {
        console.error(
          'showStoryDetail: storyMapper returned null or undefined'
        );
        this.#view.populateStoryDetailError('Gagal memproses data cerita.');
        return;
      }

      this.#view.populateStoryDetailAndInitialMap(response.message, story);
    } catch (error) {
      console.error('showStoryDetail: caught exception:', error);
      this.#view.populateStoryDetailError(
        error.message || 'Terjadi kesalahan saat mengambil detail cerita.'
      );
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }
}
