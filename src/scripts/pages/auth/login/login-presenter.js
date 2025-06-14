export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        console.error('getLogin: response error:', response);
        this.#view.loginFailed(
          response.message || 'Login gagal karena error server.'
        );
        return;
      }

      if (response.loginResult) {
        const isLoginDataSaved = this.#authModel.saveLoginData(
          response.loginResult
        );

        if (isLoginDataSaved) {
          this.#view.loginSuccessfully(response.message, response.loginResult);
        } else {
          console.error('getLogin: Failed to save login data.');
          this.#view.loginFailed(
            'Gagal menyimpan sesi login. Silakan coba lagi.'
          );
        }
      } else {
        console.error('getLogin: loginResult is missing in the response.');
        this.#view.loginFailed('Respons login tidak valid dari server.');
      }
    } catch (error) {
      console.error('getLogin: caught exception:', error);
      this.#view.loginFailed(
        error.message || 'Terjadi kesalahan saat mencoba login.'
      );
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
