export function showFormattedDate(dateString, locale = 'id-ID') {
  if (!dateString) return 'Tanggal tidak tersedia';
  try {
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

export function convertBase64ToBlob(base64, type = 'application/octet-stream') {
  try {
    const base64Data = base64.split(',')[1] || base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  } catch (e) {
    console.error('Error converting base64 to blob:', e);
    return null;
  }
}

export function setupSkipToContent(skipLink, contentElement) {
  if (skipLink && contentElement) {
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      contentElement.focus();
    });
  }
}
