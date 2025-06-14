export default class NotFoundPage {
  async render() {
    return `
      <section class="container not-found-page__container">
        <div class="not-found-page__content">
          <i class="fas fa-compass fa-5x not-found-page__icon"></i>
          <h1 class="not-found-page__title">404 - Halaman Tidak Ditemukan</h1>
          <p class="not-found-page__message">
            Oops! Sepertinya halaman yang Anda cari tidak ada atau sudah dipindahkan.
          </p>
          <a href="#/" class="btn btn--primary not-found-page__home-link">
            <i class="fas fa-home"></i> Kembali ke Beranda
          </a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log('Halaman 404 Not Found ditampilkan.');
  }
}
