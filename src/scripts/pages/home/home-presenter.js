import StoriesDb from '../../data/db-helper.js'; 

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;

    // Panggil fungsi utama saat presenter diinisialisasi
    this.#initialGalleryAndMap();
  }

  async #initialGalleryAndMap() {
    this.#view.showLoading();
    await this.#showStoriesListMap(); 
    await this.#displayStoriesFromDb();

    // mbil data dari API dan simpan ke IndexedDB
    await this.#fetchAndCacheStoriesFromApi();
    
    this.#view.hideLoading();
  }
  
  async #displayStoriesFromDb() {
    try {
      const stories = await StoriesDb.getAllStories();
      if (stories && stories.length > 0) {
        console.log('Menampilkan stories dari database');
        this.#view.listStory('Data dari Cache', stories);
      }
    } catch (error) {
      console.error('Gagal menampilkan data dari DB:', error);
      // Jika gagal mengambil dari DB, tidak apa-apa, kita akan coba dari API
    }
  }
  
  async #fetchAndCacheStoriesFromApi() {
    try {
      console.log('Mengambil stories dari API');
      const response = await this.#model.getAllStories();

      if (!response.ok || !response.listStory) {
        throw new Error(response.message || 'Gagal mengambil data cerita dari API.');
      }
      
      console.log('Menyimpan stories dari API ke database');
      // Simpan data baru ke IndexedDB
      await StoriesDb.putAllStories(response.listStory);
      
      // Tampilkan data terbaru dari API ke view
      this.#view.listStory(response.message, response.listStory);

    } catch (error) {
      console.error('initialGalleryAndMap: caught exception:', error);
      // Hanya tampilkan error jika tidak ada data sama sekali dari DB
      const storiesFromDb = await StoriesDb.getAllStories();
      if (!storiesFromDb || storiesFromDb.length === 0) {
        this.#view.listStoryError(error.message || 'Terjadi kesalahan tidak terduga.');
      }
    }
  }

  async #showStoriesListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoriesListMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }
}