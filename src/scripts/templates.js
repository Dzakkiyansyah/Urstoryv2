import { showFormattedDate } from './utils';

export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

export function generatePrimaryNavigationLinks() {
  return `
    <li><a href="#/" class="app-nav__link">Beranda</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a href="#/login" class="app-nav__link">Masuk</a></li>
    <li><a href="#/register" class="btn btn-light app-nav__action-button">Daftar</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate(
  userName = 'Pengguna'
) {
  return `
    <li><a href="#/new" class="btn btn-light app-nav__action-button"><i class="fas fa-plus"></i> Cerita Baru</a></li>
    <li><button id="logout-button" class="app-nav__link btn btn-danger" style="width: 100%; justify-content: flex-start; line-height: normal; padding-top: 8px; padding-bottom: 8px;"><i class="fas fa-sign-out-alt"></i> Keluar</button></li>
  `;
}

export function generateStoriesListEmptyTemplate() {
  return `
    <div id="stories-list-empty" class="stories-list__empty">
      <i class="fas fa-folder-open fa-3x stories-list__empty-icon"></i>
      <h2>Belum Ada Cerita</h2>
      <p>Jadilah yang pertama berbagi cerita menarikmu di sini!</p>
    </div>
  `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
    <div id="stories-list-error" class="stories-list__error">
      <i class="fas fa-exclamation-triangle fa-3x stories-list__error-icon"></i>
      <h2>Oops! Terjadi Kesalahan</h2>
      <p>${
        message
          ? message
          : 'Tidak dapat memuat cerita. Coba beberapa saat lagi atau periksa koneksi internetmu.'
      }</p>
    </div>
  `;
}

export function generateStoriesDetailErrorTemplate(message) {
  return `
    <div id="stories-detail-error" class="stories-list__error" style="padding: 40px 20px;">
      <i class="fas fa-exclamation-triangle fa-3x stories-list__error-icon"></i>
      <h2>Gagal Memuat Detail Cerita</h2>
      <p>${
        message
          ? message
          : 'Cerita tidak ditemukan atau terjadi kesalahan jaringan.'
      }</p>
      <a href="#/" class="btn btn--primary" style="margin-top: 16px;">Kembali ke Beranda</a>
    </div>
  `;
}

export function generateStoriesItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
}) {
  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <a href="#/stories/${id}" class="story-item__image-link" aria-label="Baca cerita ${name}">
        <img class="story-item__image" src="${photoUrl}" alt="Visual untuk cerita oleh ${name}">
      </a>
      <div class="story-item__body">
        <div class="story-item__main">
          <h2><a href="#/stories/${id}" class="story-item__title-link">${name}</a></h2>
          <p class="story-item__description">${description}</p>
        </div>
        <div class="story-item__more-info">
          <div class="story-item__author">
            <i class="fas fa-user"></i> ${name}
          </div>
          <div class="story-item__createdat">
            <i class="fas fa-calendar-alt"></i> ${showFormattedDate(
              createdAt,
              'id-ID'
            )}
          </div>
          ${
            lat != null && lon != null
              ? `
            <div class="story-item__location">
               <i class="fas fa-map-marker-alt"></i> Lokasi tersedia
            </div>
          `
              : ''
          }
        </div>
        <div class="story-item__actions">
          <a class="btn btn-light story-item__read-more" href="#/stories/${id}">
            Baca Selengkapnya <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}

export function generateStoriesDetailTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
  location,
}) {
  const createdAtFormatted = showFormattedDate(createdAt, 'id-ID');
  const imageUrl = photoUrl || 'images/placeholder-image.jpg';
  const displayPlaceName =
    location && location.placeName
      ? location.placeName
      : 'Detail lokasi tidak tersedia';

  return `
    <div class="story-detail__header">
      <h1 id="storyTitle" class="story-detail__title">Cerita oleh ${name}</h1>
      <div class="story-detail__more-info">
        <div class="story-detail__author" data-value="${name}">
          <i class="fas fa-user-edit"></i> Diposting oleh: 
        </div>
        <div class="story-detail__createdat" data-value="${createdAtFormatted}">
          <i class="fas fa-calendar-alt"></i> Pada: 
        </div>
      </div>
    </div>

    <div class="container story-detail__content-container">
      <div class="story-detail__images__container">
        <img class="story-detail__image" src="${imageUrl}" alt="Gambar utama untuk cerita oleh ${name}">
      </div>

      <div class="story-detail__body">
        <div class="story-detail__description-section">
          <h2 class="story-detail__description__title">Deskripsi Cerita</h2>
          <div id="storyDescription" class="story-detail__description">
            <p>${description.replace(/\n/g, '</p><p>')}</p>
          </div>
        </div>

        ${
          lat != null && lon != null
            ? `
        <div class="story-detail__map-section">
          <h2 class="story-detail__map__title">Lokasi Cerita: ${displayPlaceName}</h2>
          <div class="story-detail__map__container">
            <div id="mapDetail" class="story-detail__map"></div>
            <div id="mapDetail-loading-container"></div>
          </div>
          <div class="story-detail__coordinates">
            <span>Latitude: ${parseFloat(lat).toFixed(
              5
            )}</span> | <span>Longitude: ${parseFloat(lon).toFixed(5)}</span>
          </div>
        </div>
        `
            : `
        <div class="story-detail__map-section">
           <h2 class="story-detail__map__title">Lokasi Cerita</h2>
           <p>${displayPlaceName}</p>
        </div>
        `
        }
        
        <div class="story-detail__body__actions__container">
        </div>
      </div>
    </div>
  `;
}
