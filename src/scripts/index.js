import 'leaflet/dist/leaflet.css';
import 'tiny-slider/dist/tiny-slider.css';
import '../styles/responsives.css';
import '../styles/styles.css';
import PushNotification from './utils/push-notification-helper';

import App from './pages/app';
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    navTogglerButton: document.getElementById('navToggler'),
    appNavigationMenu: document.getElementById('appNavigationMenu'),
    skipLinkButton: document.getElementById('skip-link'),
  });
  window.addEventListener('load', () => {
    app.renderPage();

    // Inisialisasi Push Notification setelah halaman dimuat
    PushNotification.init({
      vapidPublicKey:
        'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk',
    });
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    Camera.stopAllStreams();
  });
});
