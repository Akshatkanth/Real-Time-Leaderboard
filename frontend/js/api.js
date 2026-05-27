/* ═══════════════════════════════════════════
   API Client — Fetch wrapper with JWT auth
   ═══════════════════════════════════════════ */

const API = (() => {
  const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '/api';

  function getToken() {
    return localStorage.getItem('lb_token');
  }

  function setToken(token) {
    localStorage.setItem('lb_token', token);
  }

  function removeToken() {
    localStorage.removeItem('lb_token');
  }

  function getUser() {
    const data = localStorage.getItem('lb_user');
    return data ? JSON.parse(data) : null;
  }

  function setUser(user) {
    localStorage.setItem('lb_user', JSON.stringify(user));
  }

  function removeUser() {
    localStorage.removeItem('lb_user');
  }

  function isLoggedIn() {
    return !!getToken();
  }

  async function request(method, path, body = null) {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  // Auth
  async function register(username, email, password) {
    const data = await request('POST', '/auth/register', { username, email, password });
    return data;
  }

  async function login(email, password) {
    const data = await request('POST', '/auth/login', { email, password });
    setToken(data.data.token);
    setUser(data.data.user);
    return data;
  }

  function logout() {
    removeToken();
    removeUser();
  }

  // Scores
  async function submitText(text) {
    return request('POST', '/scores/submit', { text });
  }

  // Leaderboard
  async function getLeaderboard(category) {
    return request('GET', `/leaderboard/${category}`);
  }

  // Rank
  async function getUserRank(category) {
    return request('GET', `/leaderboard/rank/${category}`);
  }

  // Report
  async function getReport(period) {
    return request('GET', `/leaderboard/report?period=${period}`);
  }

  return {
    BASE_URL,
    getToken, setToken, removeToken,
    getUser, setUser, removeUser,
    isLoggedIn,
    register, login, logout,
    submitText,
    getLeaderboard,
    getUserRank,
    getReport,
  };
})();
