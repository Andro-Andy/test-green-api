// localStorage может быть недоступен (приватный режим, запрет cookies), поэтому все обращения в try/catch.

export function loadFromStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Хранилище недоступно — приложение продолжит работать без сохранения
  }
}
