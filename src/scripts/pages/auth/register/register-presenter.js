export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async getRegistered({ name, email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getRegistered({
        name,
        email,
        password,
      });

      if (!response.ok) {
        console.error('getRegistered: response error:', response);
        this.#view.registeredFailed(response.message || 'Registrasi gagal.');
        return;
      }
      this.#view.registeredSuccessfully(response.message);
    } catch (error) {
      console.error('getRegistered: caught exception:', error);
      this.#view.registeredFailed(
        error.message || 'Terjadi kesalahan saat registrasi.'
      );
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
