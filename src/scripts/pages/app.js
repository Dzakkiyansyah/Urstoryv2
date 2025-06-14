import { routes } from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generatePrimaryNavigationLinks,
  generateUnauthenticatedNavigationListTemplate,
} from '../templates';
import { setupSkipToContent } from '../utils';
import { getAccessToken, getLogout, getUserNameFromAuth } from '../utils/auth';
import NotFoundPage from './errors/not-found-page.js';

export default class App {
  #content;
  #navTogglerButton;
  #appNavigationMenu;
  #skipLinkButton;

  constructor({
    content,
    navTogglerButton,
    appNavigationMenu,
    skipLinkButton,
  }) {
    this.#content = content;
    this.#navTogglerButton = navTogglerButton;
    this.#appNavigationMenu = appNavigationMenu;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupNavigationDrawer();
  }

  #setupNavigationDrawer() {
    if (!this.#navTogglerButton || !this.#appNavigationMenu) return;

    this.#navTogglerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#appNavigationMenu.classList.toggle('open');
      this.#navTogglerButton.classList.toggle('active');
      this.#navTogglerButton.setAttribute(
        'aria-expanded',
        this.#appNavigationMenu.classList.contains('open')
      );

      if (this.#appNavigationMenu.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    document.body.addEventListener('click', (event) => {
      if (window.innerWidth < 1024) {
        if (this.#appNavigationMenu.classList.contains('open')) {
          const isTargetInsideDrawer = this.#appNavigationMenu.contains(
            event.target
          );
          const isTargetInsideButton = this.#navTogglerButton.contains(
            event.target
          );

          if (!(isTargetInsideDrawer || isTargetInsideButton)) {
            this.#appNavigationMenu.classList.remove('open');
            this.#navTogglerButton.classList.remove('active');
            this.#navTogglerButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }
        }
      }
    });

    this.#appNavigationMenu.addEventListener('click', (event) => {
      const targetLink = event.target.closest(
        '.app-nav__link, .app-nav__action-button'
      );
      if (targetLink) {
        if (this.#appNavigationMenu.classList.contains('open')) {
          this.#appNavigationMenu.classList.remove('open');
          this.#navTogglerButton.classList.remove('active');
          this.#navTogglerButton.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      }
    });
  }

  #setupNavigationList() {
    if (!this.#appNavigationMenu) return;

    const isLogin = !!getAccessToken();

    const navListPrimary = this.#appNavigationMenu.querySelector(
      '.app-nav__list--primary'
    );
    const navListSecondary = this.#appNavigationMenu.querySelector(
      '.app-nav__list--secondary'
    );

    if (!navListPrimary || !navListSecondary) {
      console.error(
        'Elemen list navigasi primer atau sekunder tidak ditemukan.'
      );
      return;
    }

    navListPrimary.innerHTML = generatePrimaryNavigationLinks();

    if (!isLogin) {
      navListSecondary.innerHTML =
        generateUnauthenticatedNavigationListTemplate();
    } else {
      const userName = getUserNameFromAuth() || 'Pengguna';
      navListSecondary.innerHTML =
        generateAuthenticatedNavigationListTemplate(userName);

      const logoutButton = navListSecondary.querySelector('#logout-button');
      if (logoutButton) {
        const newLogoutButton = logoutButton.cloneNode(true);
        logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);

        newLogoutButton.addEventListener('click', async (event) => {
          event.preventDefault();
          if (confirm('Apakah Anda yakin ingin keluar?')) {
            getLogout();
            window.location.hash = '#/login';
            await this.renderPage();
          }
        });
      }
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const routeHandler = routes[url];

    const renderPageContent = async (pageInstance) => {
      if (!pageInstance) {
        console.warn(
          `Rendering dibatalkan untuk ${url} karena instance halaman null (kemungkinan oleh route guard).`
        );
        this.#content.innerHTML = '';
        return;
      }
      this.#content.innerHTML = await pageInstance.render();
      if (typeof pageInstance.afterRender === 'function') {
        await pageInstance.afterRender();
      }
    };

    let pageToDisplay;

    if (!routeHandler) {
      console.warn(
        `Rute untuk "${url}" tidak ditemukan. Menampilkan halaman 404.`
      );
      pageToDisplay = new NotFoundPage();
    } else {
      pageToDisplay = routeHandler();
    }

    if (pageToDisplay) {
      if (document.startViewTransition && this.#content.innerHTML !== '') {
        const transition = document.startViewTransition(() =>
          renderPageContent(pageToDisplay)
        );
        try {
          await transition.finished;
        } catch (error) {
          console.error('View transition gagal:', error);
          await renderPageContent(pageToDisplay);
        }
      } else {
        await renderPageContent(pageToDisplay);
      }
    } else {
      this.#content.innerHTML = '';
    }

    scrollTo({ top: 0, behavior: 'instant' });
    this.#setupNavigationList();
  }
}
