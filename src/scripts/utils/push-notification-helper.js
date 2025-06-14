import { subscribeToNotifications } from '../data/api'; 
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const PushNotification = {
  async init({ vapidPublicKey }) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push Messaging tidak didukung.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        console.log('Belum berlangganan notifikasi, proses subscribe...');
        subscription = await this._subscribe(registration, vapidPublicKey);
        
     
        console.log('Mengirim subscription ke server...');
        await subscribeToNotifications(subscription);
        console.log('Subscription berhasil dikirim ke server.');

      } else {
        console.log('Sudah berlangganan notifikasi:', subscription);
      }
    } catch (error) {
      console.error('Inisialisasi Push Notification gagal:', error);
    }
  },

  async _subscribe(registration, vapidPublicKey) {
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  },
};

export default PushNotification;