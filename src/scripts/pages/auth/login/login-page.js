import * as DicodingStoryAPI from '../../../data/api';
import * as AuthModel from '../../../utils/auth';
import LoginPresenter from './login-presenter';

export default class LoginPage {
  #presenter = null;
  #loginForm = null;

  async render() {
    return `
      <section class="login-page__container container">
        <article class="login-form-container">
          <h1 class="login__title">Masuk ke Akun Anda</h1>
          <form id="loginForm" class="login-form">
            <div class="form-control">
              <label for="emailInput">Alamat Email</label>
              <input id="emailInput" type="email" name="email" placeholder="contoh: nama@email.com" required>
            </div>
            <div class="form-control">
              <label for="passwordInput">Kata Sandi</label>
              <input id="passwordInput" type="password" name="password" placeholder="Masukkan kata sandi Anda" required>
            </div>
            <div class="form-buttons login-form__form-buttons">
              <div id="submitButtonContainerLogin">
                <button class="btn btn--primary" type="submit">Masuk</button>
              </div>
              <p class="form-text text-center mt-3">
                Belum punya akun? <a href="#/register">Daftar di sini</a>
              </p>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: DicodingStoryAPI,
      authModel: AuthModel,
    });

    this.#loginForm = document.getElementById('loginForm');
    this.#setupForm();
  }

  #setupForm() {
    if (!this.#loginForm) return;

    this.#loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      this.showSubmitLoadingButton();

      const data = {
        email: this.#loginForm.elements.namedItem('email').value,
        password: this.#loginForm.elements.namedItem('password').value,
      };
      await this.#presenter.getLogin(data);
    });
  }

  loginSuccessfully(message, loginResult) {
    this.hideSubmitLoadingButton();
    alert('Login berhasil!');
    location.hash = '/';
  }

  loginFailed(message) {
    alert(`Login gagal: ${message}`);
    this.hideSubmitLoadingButton();
  }

  showSubmitLoadingButton() {
    const container = document.getElementById('submitButtonContainerLogin');
    if (container) {
      container.innerHTML = `
        <button class="btn btn--primary" type="submit" disabled>
          <i class="fas fa-spinner fa-spin"></i> Sedang memproses...
        </button>
      `;
    }
  }

  hideSubmitLoadingButton() {
    const container = document.getElementById('submitButtonContainerLogin');
    if (container) {
      container.innerHTML = `
        <button class="btn btn--primary" type="submit">Masuk</button>
      `;
    }
  }
}
