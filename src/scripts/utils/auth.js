import { ACCESS_TOKEN_KEY, USER_INFO_KEY } from '../config';
import { getActiveRoute } from '../routes/url-parser';

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (
      accessToken === null ||
      accessToken === 'null' ||
      accessToken === 'undefined'
    ) {
      return null;
    }
    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

export function saveLoginData(loginResult) {
  try {
    if (!loginResult || !loginResult.token) {
      console.error(
        'saveLoginData: loginResult atau token tidak valid',
        loginResult
      );
      return false;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, loginResult.token);

    const userInfo = {
      userId: loginResult.userId,
      name: loginResult.name,
    };
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    return true;
  } catch (error) {
    console.error('saveLoginData: error:', error);
    return false;
  }
}

export function getUserNameFromAuth() {
  try {
    const userInfoString = localStorage.getItem(USER_INFO_KEY);
    if (
      userInfoString &&
      userInfoString !== 'null' &&
      userInfoString !== 'undefined'
    ) {
      const userInfo = JSON.parse(userInfoString);
      return userInfo.name || null;
    }
    return null;
  } catch (error) {
    console.error('getUserNameFromAuth: error:', error);
    return null;
  }
}

export function getUserInfoFromAuth() {
  try {
    const userInfoString = localStorage.getItem(USER_INFO_KEY);
    if (
      userInfoString &&
      userInfoString !== 'null' &&
      userInfoString !== 'undefined'
    ) {
      return JSON.parse(userInfoString);
    }
    return null;
  } catch (error) {
    console.error('getUserInfoFromAuth: error:', error);
    return null;
  }
}

export function clearAuthData() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    return true;
  } catch (error) {
    console.error('clearAuthData: error:', error);
    return false;
  }
}

export function getLogout() {
  return clearAuthData();
}

const unauthenticatedRoutesOnly = ['/login', '/register'];

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = '/';
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const isLogin = !!getAccessToken();

  if (!isLogin) {
    location.hash = '/login';
    return null;
  }

  return page;
}
