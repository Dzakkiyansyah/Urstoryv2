import * as DicodingStoryAPI from '../../../data/api';
import RegisterPresenter from './register-presenter';

export default class RegisterPage {
  #presenter = null;
  #registerForm = null;

  async render() {
    return `
      <section class="register-page__container container">
        <div class="register-form-container">
          <h1 class="register__title">Buat Akun Baru</h1>
          <form id="registerForm" class="register-form">
            <div class="form-control">
              <label for="nameInput">Nama Lengkap</label>
              <input id="nameInput" type="text" name="name" placeholder="Masukkan nama lengkap Anda" required>
            </div>
            <div class="form-control">
              <label for="emailInput">Alamat Email</label>
              <input id="emailInput" type="email" name="email" placeholder="contoh: nama@email.com" required>
            </div>
            <div class="form-control">
              <label for="passwordInput">Kata Sandi</label>
              <input id="passwordInput" type="password" name="password" placeholder="Minimal 8 karakter" required minlength="8">
            </div>
            <div class="form-buttons register-form__form-buttons">
              <div id="submitButtonContainerRegister">
                <button class="btn btn--primary" type="submit">Daftar Sekarang</button>
              </div>
              <p class="form-text text-center mt-3">
                Sudah punya akun? <a href="#/login">Masuk di sini</a>
              </p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: DicodingStoryAPI,
    });

    this.#registerForm = document.getElementById('registerForm');
    this.#setupForm();
  }

  #setupForm() {
    if (!this.#registerForm) return;

    this.#registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      this.showSubmitLoadingButton();

      const data = {
        name: this.#registerForm.elements.namedItem('name').value,
        email: this.#registerForm.elements.namedItem('email').value,
        password: this.#registerForm.elements.namedItem('password').value,
      };
      await this.#presenter.getRegistered(data);
    });
  }

  registeredSuccessfully(message) {
    console.log(message);
    alert('Pendaftaran berhasil! Silakan masuk.');
    this.hideSubmitLoadingButton();
    location.hash = '/login';
  }

  registeredFailed(message) {
    alert(`Pendaftaran gagal: ${message}`);
    this.hideSubmitLoadingButton();
  }

  showSubmitLoadingButton() {
    const container = document.getElementById('submitButtonContainerRegister');
    if (container) {
      container.innerHTML = `
        <button class="btn btn--primary" type="submit" disabled>
          <i class="fas fa-spinner fa-spin"></i> Mendaftar...
        </button>
      `;
    }
  }

  hideSubmitLoadingButton() {
    const container = document.getElementById('submitButtonContainerRegister');
    if (container) {
      container.innerHTML = `
        <button class="btn btn--primary" type="submit">Daftar Sekarang</button>
      `;
    }
  }
}
