export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory({ description, photo, latitude, longitude }) {
    this.#view.showSubmitLoadingButton();
    try {
      const data = {
        description: description,
        photo: photo,
        ...(latitude &&
          longitude && {
            lat: parseFloat(latitude),
            lon: parseFloat(longitude),
          }),
      };

      if (!data.description || !data.photo) {
        this.#view.storeFailed('Deskripsi dan foto wajib diisi.');
        return;
      }

      const response = await this.#model.storeNewStory(data);

      if (!response.ok) {
        console.error('postNewStory: response error:', response);
        this.#view.storeFailed(response.message || 'Gagal menyimpan cerita.');
        return;
      }
      this.#view.storeSuccessfully(response.message);
    } catch (error) {
      console.error('postNewStory: caught exception:', error);
      this.#view.storeFailed(
        error.message || 'Terjadi kesalahan saat menyimpan cerita.'
      );
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
