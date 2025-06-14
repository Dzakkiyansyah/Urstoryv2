import { BASE_URL } from '../config';
import { getAccessToken } from '../utils/auth';

async function fetchWithAuth(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const responseJson = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        message:
          responseJson.message || `HTTP error! status: ${response.status}`,
        ...responseJson,
      };
    }
    return { ok: true, ...responseJson };
  } catch (error) {
    console.error('Fetch error:', url, error);
    return {
      ok: false,
      message: error.message || 'Network error or invalid JSON response',
    };
  }
}

export async function getRegistered({ name, email, password }) {
  return fetchWithAuth(`${BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function getLogin({ email, password }) {
  return fetchWithAuth(`${BASE_URL}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getAllStories({ page, size, location } = {}) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (size) params.append('size', size);
  if (location != null) params.append('location', location);

  const queryString = params.toString();
  return fetchWithAuth(
    `${BASE_URL}/stories${queryString ? `?${queryString}` : ''}`,
    {
      method: 'GET',
    }
  );
}

export async function getStoryById(id) {
  return fetchWithAuth(`${BASE_URL}/stories/${id}`, {
    method: 'GET',
  });
}

export async function storeNewStory({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat != null) formData.append('lat', parseFloat(lat));
  if (lon != null) formData.append('lon', parseFloat(lon));

  return fetchWithAuth(`${BASE_URL}/stories`, {
    method: 'POST',
    body: formData,
  });
}

export async function storeNewGuestStory({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat != null) formData.append('lat', parseFloat(lat));
  if (lon != null) formData.append('lon', parseFloat(lon));

  try {
    const response = await fetch(`${BASE_URL}/stories/guest`, {
      method: 'POST',
      body: formData,
    });
    const responseJson = await response.json();
    if (!response.ok) {
      return {
        ok: false,
        message:
          responseJson.message || `HTTP error! status: ${response.status}`,
        ...responseJson,
      };
    }
    return { ok: true, ...responseJson };
  } catch (error) {
    console.error('Fetch error (guest story):', error);
    return {
      ok: false,
      message: error.message || 'Network error or invalid JSON response',
    };
  }
}

// PENAMBAHAN FUNGSI BARU UNTUK SUBSCRIBE NOTIFIKASI
export async function subscribeToNotifications(subscription) {
  return fetchWithAuth(`${BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
}