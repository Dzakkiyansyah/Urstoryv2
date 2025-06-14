export default class Camera {
  #currentStream;
  #streaming = false;
  #width = 640;
  #height = 0;

  #videoElement;
  #selectCameraElement;
  #canvasElement;

  static addNewStream(stream) {
    if (!window.currentStreams || !Array.isArray(window.currentStreams)) {
      window.currentStreams = [];
    }
    if (stream) {
      window.currentStreams.push(stream);
    }
  }

  static stopAllStreams() {
    if (window.currentStreams && Array.isArray(window.currentStreams)) {
      window.currentStreams.forEach((stream) => {
        if (stream && stream.active) {
          stream.getTracks().forEach((track) => track.stop());
        }
      });
      window.currentStreams = [];
    }
  }

  constructor({ video, cameraSelect, canvas }) {
    this.#videoElement = video;
    this.#selectCameraElement = cameraSelect;
    this.#canvasElement = canvas;
    this.#initialListener();
  }

  #initialListener() {
    if (
      !this.#videoElement ||
      !this.#selectCameraElement ||
      !this.#canvasElement
    ) {
      console.warn('Camera elements not fully provided for initial listener.');
      return;
    }

    this.#videoElement.oncanplay = () => {
      if (
        this.#streaming ||
        !this.#videoElement.videoWidth ||
        !this.#videoElement.videoHeight
      ) {
        return;
      }
      this.#height =
        (this.#videoElement.videoHeight * this.#width) /
        this.#videoElement.videoWidth;
      this.#canvasElement.setAttribute('width', this.#width);
      this.#canvasElement.setAttribute('height', this.#height);
      this.#streaming = true;
    };

    this.#selectCameraElement.onchange = async () => {
      await this.stop();
      await this.launch();
    };
  }

  async #populateDeviceList(currentStream) {
    try {
      if (!(currentStream instanceof MediaStream)) {
        console.error('PopulateDeviceList: MediaStream not found!');
        return;
      }
      const currentVideoTrack = currentStream.getVideoTracks()[0];
      if (!currentVideoTrack) return;

      const { deviceId: currentDeviceId } = currentVideoTrack.getSettings();
      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = enumeratedDevices.filter(
        (device) => device.kind === 'videoinput'
      );

      let html = '';
      if (videoInputDevices.length === 0) {
        html = '<option value="">Tidak ada kamera ditemukan</option>';
      } else {
        html = videoInputDevices.reduce((accumulator, device, currentIndex) => {
          return accumulator.concat(`
            <option
              value="${device.deviceId}"
              ${currentDeviceId === device.deviceId ? 'selected' : ''}
            >
              ${device.label || `Kamera ${currentIndex + 1}`}
            </option>
          `);
        }, '');
      }

      if (this.#selectCameraElement) {
        this.#selectCameraElement.innerHTML = html;
      }
    } catch (error) {
      console.error('#populateDeviceList: error:', error);
      if (this.#selectCameraElement) {
        this.#selectCameraElement.innerHTML =
          '<option value="">Error memuat daftar kamera</option>';
      }
    }
  }

  async #getStream() {
    try {
      const selectedDeviceId = this.#selectCameraElement
        ? this.#selectCameraElement.value
        : undefined;
      const constraints = {
        video: {
          aspectRatio: 4 / 3,
          width: { ideal: this.#width },
        },
      };
      if (selectedDeviceId) {
        constraints.video.deviceId = { exact: selectedDeviceId };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (stream) {
        // Pastikan stream berhasil didapatkan sebelum populate
        await this.#populateDeviceList(stream);
      }
      return stream;
    } catch (error) {
      console.error('Gagal mendapatkan stream kamera:', error);
      alert(
        'Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin dan tidak ada aplikasi lain yang sedang menggunakan kamera.'
      );
      return null;
    }
  }

  async launch() {
    if (!this.#videoElement) {
      console.error('Video element for camera not found.');
      return;
    }
    await this.stop();

    this.#currentStream = await this.#getStream();
    if (!this.#currentStream) {
      console.error('Gagal memulai kamera: stream tidak didapatkan.');
      this.#clearCanvas();
      return;
    }

    Camera.addNewStream(this.#currentStream);
    this.#videoElement.srcObject = this.#currentStream;
    this.#videoElement.muted = true;
    this.#videoElement.setAttribute('playsinline', ''); // Tambahkan playsinline
    this.#videoElement
      .play()
      .catch((e) => console.error('Error playing video:', e));
    this.#clearCanvas();
  }

  stop() {
    if (this.#videoElement) {
      this.#videoElement.pause();
      this.#videoElement.srcObject = null;
    }
    this.#streaming = false;

    if (
      this.#currentStream instanceof MediaStream &&
      this.#currentStream.active
    ) {
      this.#currentStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    this.#currentStream = null;
    this.#clearCanvas();
  }

  #clearCanvas() {
    if (!this.#canvasElement) return;
    const context = this.#canvasElement.getContext('2d');
    // Set ukuran canvas ke ukuran video jika streaming, atau default jika tidak
    const canvasWidth =
      this.#streaming && this.#videoElement
        ? this.#videoElement.videoWidth
        : this.#width;
    const canvasHeight =
      this.#streaming && this.#videoElement
        ? this.#videoElement.videoHeight
        : this.#height || this.#width * (3 / 4);

    this.#canvasElement.width = canvasWidth;
    this.#canvasElement.height = canvasHeight;
    context.fillStyle = '#EEEEEE';
    context.fillRect(
      0,
      0,
      this.#canvasElement.width,
      this.#canvasElement.height
    );
  }

  async takePictureAsBlob(type = 'image/jpeg', quality = 0.9) {
    if (
      !(
        this.#streaming &&
        this.#videoElement &&
        this.#videoElement.readyState >= 3 &&
        this.#canvasElement
      )
    ) {
      console.error(
        'Kamera belum siap atau stream tidak aktif untuk mengambil gambar.'
      );
      alert('Kamera belum siap. Pastikan kamera aktif dan coba lagi.');
      return null;
    }

    const context = this.#canvasElement.getContext('2d');

    this.#canvasElement.width = this.#videoElement.videoWidth;
    this.#canvasElement.height = this.#videoElement.videoHeight;

    context.drawImage(
      this.#videoElement,
      0,
      0,
      this.#canvasElement.width,
      this.#canvasElement.height
    );

    return new Promise((resolve) => {
      this.#canvasElement.toBlob((blob) => resolve(blob), type, quality);
    });
  }
}
