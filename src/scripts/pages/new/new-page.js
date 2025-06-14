import * as DicodingStoryAPI from '../../data/api';
import { generateLoaderAbsoluteTemplate } from '../../templates';
import { convertBase64ToBlob } from '../../utils';
import Camera from '../../utils/camera';
import Map from '../../utils/map';
import NewPresenter from './new-presenter';

export default class NewPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenDocumentations = [];
  #map = null;

  async render() {
    return `
      <section class="new-story__page-header-section">
        <div class="new-story__header">
          <div class="container">
            <h1 class="new-story__header__title">Buat Cerita Baru</h1>
            <p class="new-story__header__subtitle">
              Bagikan momen atau pengalaman menarikmu di sini.
            </p>
          </div>
        </div>
      </section>

      <section class="container new-story__form-section">
        <div class="new-form__container">
          <form id="newStoryForm" class="new-form">

            <div class="form-control">
              <label for="descriptionInput">Deskripsi Cerita</label>
              <textarea
                id="descriptionInput"
                name="description"
                rows="5"
                placeholder="Apa yang ingin kamu ceritakan?"
                required
              ></textarea>
            </div>

            <div class="form-control">
              <label for="photoInputButton">Foto Pendukung</label>
              <small id="photoInfo" class="form-text text-muted">Satu foto utama untuk ceritamu (Max 1MB).</small>
              
              <div class="new-form__photo-upload-options">
                <button id="photoInputButton" class="btn btn-outline" type="button">
                  <i class="fas fa-upload"></i> Unggah Foto
                </button>
                <input
                  id="photoInput"
                  name="photo"
                  type="file"
                  accept="image/jpeg, image/png, image/gif"
                  hidden="hidden"
                  aria-describedby="photoInfo"
                />
                <button id="openCameraButton" class="btn btn-outline" type="button">
                  <i class="fas fa-camera"></i> Buka Kamera
                </button>
              </div>

              <div id="cameraContainer" class="new-form__camera__container">
                <video id="cameraVideo" class="new-form__camera__video" playsinline>
                  Video stream tidak tersedia.
                </video>
                <canvas id="cameraCanvas" class="new-form__camera__canvas"></canvas>
                <div class="new-form__camera__tools">
                  <select id="cameraSelect" class="form-select"></select>
                  <button id="takePictureButton" class="btn btn--primary" type="button">
                    <i class="fas fa-camera-retro"></i> Ambil Foto
                  </button>
                </div>
              </div>

              <div id="photoPreviewContainer" class="new-form__photo-preview-container">
                <p class="text-muted">Belum ada foto dipilih.</p>
              </div>
            </div>

            <div class="form-control">
              <label>Lokasi Cerita (Opsional)</label>
              <small class="form-text text-muted">Klik pada peta untuk memilih lokasi atau biarkan peta mendeteksi lokasimu saat ini.</small>
              <div class="new-form__location__container">
                <div class="new-form__location__map__container">
                  <div id="storyLocationMap" class="new-form__location__map"></div>
                  <div id="mapLoadingContainer" class="map-loading-container--form"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <div class="form-control-inline">
                    <label for="latitudeInput">Latitude</label>
                    <input type="number" id="latitudeInput" name="latitude" step="any" readonly placeholder="Mendeteksi...">
                  </div>
                  <div class="form-control-inline">
                    <label for="longitudeInput">Longitude</label>
                    <input type="number" id="longitudeInput" name="longitude" step="any" readonly placeholder="Mendeteksi...">
                  </div>
                </div>
              </div>
            </div>

            <div class="form-buttons new-form__action-buttons">
              <button class="btn btn--primary btn-submit-story" type="submit" id="submitStoryButton">
                <i class="fas fa-paper-plane"></i> Publikasikan Cerita
              </button>
              <a class="btn btn-outline" href="#/">Batal</a>
            </div>

          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: DicodingStoryAPI,
    });
    this.#takenDocumentations = [];

    this.#setupForm();
    await this.#presenter.showNewFormMap();
  }

  #setupForm() {
    this.#form = document.getElementById('newStoryForm');
    if (!this.#form) return;

    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();
      this.showSubmitLoadingButton();

      const photoToSubmit =
        this.#takenDocumentations.length > 0
          ? this.#takenDocumentations[0].blob
          : null;

      const data = {
        description: this.#form.elements.namedItem('description').value,
        photo: photoToSubmit,
        latitude: this.#form.elements.namedItem('latitude').value || null,
        longitude: this.#form.elements.namedItem('longitude').value || null,
      };

      if (!data.description || !data.photo) {
        alert('Deskripsi dan Foto wajib diisi!');
        this.hideSubmitLoadingButton();
        return;
      }

      await this.#presenter.postNewStory(data);
    });

    const photoInputElement = document.getElementById('photoInput');
    const photoInputButtonElement = document.getElementById('photoInputButton');
    if (photoInputButtonElement && photoInputElement) {
      photoInputButtonElement.addEventListener('click', () => {
        photoInputElement.click();
      });
      photoInputElement.addEventListener('change', async (event) => {
        if (event.target.files && event.target.files[0]) {
          const file = event.target.files[0];
          this.#takenDocumentations = [];
          await this.#addTakenPicture(file);
          await this.#populateTakenPictures();
        }
      });
    }

    const cameraContainer = document.getElementById('cameraContainer');
    const openCameraButton = document.getElementById('openCameraButton');
    if (openCameraButton && cameraContainer) {
      openCameraButton.addEventListener('click', async (event) => {
        cameraContainer.classList.toggle('open');
        this.#isCameraOpen = cameraContainer.classList.contains('open');

        if (this.#isCameraOpen) {
          event.currentTarget.innerHTML =
            '<i class="fas fa-times"></i> Tutup Kamera';
          await this.#setupCamera();
          if (this.#camera) await this.#camera.launch();
        } else {
          event.currentTarget.innerHTML =
            '<i class="fas fa-camera"></i> Buka Kamera';
          if (this.#camera) this.#camera.stop();
        }
      });
    }
  }

  async initialMap() {
    const mapElement = document.getElementById('storyLocationMap');
    if (!mapElement) {
      console.error('Elemen peta #storyLocationMap tidak ditemukan.');
      this.hideMapLoading();
      return;
    }

    try {
      this.#map = await Map.build('#storyLocationMap', {
        zoom: 13,
        locate: true,
      });

      const centerCoordinate = this.#map.getCenter();
      this.#updateLatLngInput(centerCoordinate.lat, centerCoordinate.lng);

      const draggableMarker = this.#map.addMarker(
        [centerCoordinate.lat, centerCoordinate.lng],
        { draggable: 'true' },
        { content: 'Geser untuk memilih lokasi cerita' }
      );

      draggableMarker.on('dragend', (event) => {
        const coordinate = event.target.getLatLng();
        this.#updateLatLngInput(coordinate.lat, coordinate.lng);
        this.#map.changeCamera([coordinate.lat, coordinate.lng]);
      });

      this.#map.addMapEventListener('click', (event) => {
        const { lat, lng } = event.latlng;
        draggableMarker.setLatLng([lat, lng]);
        this.#updateLatLngInput(lat, lng);
        this.#map.changeCamera([lat, lng]);
      });
    } catch (error) {
      console.error('Gagal inisialisasi peta di form:', error);
      this.#updateLatLngInput('Error', 'Error');
      this.hideMapLoading();
    }
  }

  #updateLatLngInput(latitude, longitude) {
    const latInput = this.#form.elements.namedItem('latitude');
    const lonInput = this.#form.elements.namedItem('longitude');
    if (latInput)
      latInput.value =
        typeof latitude === 'number'
          ? parseFloat(latitude).toFixed(6)
          : latitude;
    if (lonInput)
      lonInput.value =
        typeof longitude === 'number'
          ? parseFloat(longitude).toFixed(6)
          : longitude;
  }

  async #setupCamera() {
    if (!this.#camera) {
      const videoElement = document.getElementById('cameraVideo');
      const cameraSelectElement = document.getElementById('cameraSelect');
      const canvasElement = document.getElementById('cameraCanvas');

      if (!videoElement || !cameraSelectElement || !canvasElement) {
        console.error('Elemen kamera tidak ditemukan.');
        return;
      }

      this.#camera = new Camera({
        video: videoElement,
        cameraSelect: cameraSelectElement,
        canvas: canvasElement,
      });
    }

    const takePictureButton = document.getElementById('takePictureButton');
    if (takePictureButton && this.#camera) {
      const newButton = takePictureButton.cloneNode(true);
      takePictureButton.parentNode.replaceChild(newButton, takePictureButton);

      newButton.addEventListener('click', async () => {
        const imageBlob = await this.#camera.takePictureAsBlob('image/jpeg');
        if (imageBlob) {
          this.#takenDocumentations = [];
          await this.#addTakenPicture(imageBlob);
          await this.#populateTakenPictures();

          const openCameraButton = document.getElementById('openCameraButton');
          if (openCameraButton && this.#isCameraOpen) openCameraButton.click();
        }
      });
    }
  }

  async #addTakenPicture(imageSource) {
    let blob = imageSource;
    if (imageSource instanceof File) {
      blob = imageSource;
    } else if (typeof imageSource === 'string') {
      blob = await convertBase64ToBlob(imageSource, 'image/jpeg');
    }

    const newDocumentation = {
      id: `pic-${Date.now()}`,
      blob: blob,
    };
    this.#takenDocumentations = [newDocumentation];
  }

  async #populateTakenPictures() {
    const previewContainer = document.getElementById('photoPreviewContainer');
    if (!previewContainer) return;

    if (this.#takenDocumentations.length === 0) {
      previewContainer.innerHTML =
        '<p class="text-muted">Belum ada foto dipilih.</p>';
      return;
    }

    const picture = this.#takenDocumentations[0];
    const imageUrl = URL.createObjectURL(picture.blob);
    previewContainer.innerHTML = `
      <div class="new-form__photo-preview-item">
        <img src="${imageUrl}" alt="Preview foto cerita">
        <button type="button" data-deletepictureid="${picture.id}" class="btn btn-danger btn-sm delete-preview-btn">
          <i class="fas fa-trash-alt"></i> Hapus
        </button>
      </div>
    `;

    previewContainer
      .querySelector('.delete-preview-btn')
      .addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;
        this.#removePicture(pictureId);
        this.#populateTakenPictures();
        const photoInput = document.getElementById('photoInput');
        if (photoInput) photoInput.value = '';
      });
  }

  #removePicture(id) {
    const initialLength = this.#takenDocumentations.length;
    this.#takenDocumentations = this.#takenDocumentations.filter(
      (pic) => pic.id !== id
    );
    return this.#takenDocumentations.length < initialLength;
  }

  storeSuccessfully(message) {
    console.log(message);
    alert('Cerita berhasil dipublikasikan!');
    this.clearForm();
    location.hash = '/';
  }

  storeFailed(message) {
    alert(`Gagal menyimpan cerita: ${message}`);
    this.hideSubmitLoadingButton();
  }

  clearForm() {
    if (this.#form) this.#form.reset();
    this.#takenDocumentations = [];
    this.#populateTakenPictures();

    const latInput = this.#form.elements.namedItem('latitude');
    const lonInput = this.#form.elements.namedItem('longitude');
    const defaultLat = -6.175389;
    const defaultLon = 106.827139;

    if (latInput) latInput.value = defaultLat.toFixed(6);
    if (lonInput) lonInput.value = defaultLon.toFixed(6);

    if (this.#map) {
      this.#map.changeCamera([defaultLat, defaultLon], 13);
    }
  }

  showMapLoading() {
    const mapLoadingEl = document.getElementById('mapLoadingContainer');
    if (mapLoadingEl) mapLoadingEl.innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    const mapLoadingEl = document.getElementById('mapLoadingContainer');
    if (mapLoadingEl) mapLoadingEl.innerHTML = '';
  }

  showSubmitLoadingButton() {
    const submitButton = document.getElementById('submitStoryButton');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i> Mempublikasikan...
      `;
    }
  }

  hideSubmitLoadingButton() {
    const submitButton = document.getElementById('submitStoryButton');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = `
        <i class="fas fa-paper-plane"></i> Publikasikan Cerita
      `;
    }
  }
}
