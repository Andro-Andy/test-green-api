const API_URL = (process.env.REACT_APP_GREEN_API_URL || 'https://api.green-api.com').replace(/\/+$/, '');

// Сервер держит receiveNotification открытым до N секунд, если очередь пуста (long polling).
const RECEIVE_TIMEOUT_SEC = 20;

const STATUS_MESSAGES = {
  400: 'Некорректный запрос',
  401: 'Неверный idInstance или apiTokenInstance',
  403: 'Неверный idInstance или apiTokenInstance',
  429: 'Слишком много запросов, попробуйте позже',
  466: 'Исчерпан лимит запросов тарифа GREEN-API',
};

export class GreenApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GreenApiError';
    this.status = status;
  }
}

async function request({ idInstance, apiTokenInstance }, apiMethod, options = {}) {
  const { httpMethod = 'GET', body, path = '', query = '', signal } = options;
  const url = `${API_URL}/waInstance${idInstance}/${apiMethod}/${apiTokenInstance}${path}${query}`;

  let response;
  try {
    response = await fetch(url, {
      method: httpMethod,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new GreenApiError('Нет связи с GREEN-API. Проверьте интернет-соединение');
  }

  if (!response.ok) {
    const fallback = `Ошибка GREEN-API (HTTP ${response.status})`;
    throw new GreenApiError(STATUS_MESSAGES[response.status] || fallback, response.status);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/** Проверка учётных данных: возвращает { stateInstance: 'authorized' | 'notAuthorized' | ... } */
export function getStateInstance(credentials) {
  return request(credentials, 'getStateInstance');
}

/** Поиск Telegram-аккаунта по номеру телефона: возвращает { exist, chatId } */
export function checkAccount(credentials, phoneNumber) {
  return request(credentials, 'checkAccount', {
    httpMethod: 'POST',
    body: { phoneNumber: Number(phoneNumber) },
  });
}

/** https://green-api.com/v3/docs/api/sending/SendMessage/ */
export function sendMessage(credentials, chatId, message) {
  return request(credentials, 'sendMessage', {
    httpMethod: 'POST',
    body: { chatId, message },
  });
}

/** https://green-api.com/v3/docs/api/receiving/technology-http-api/ */
export function receiveNotification(credentials, signal) {
  return request(credentials, 'receiveNotification', {
    query: `?receiveTimeout=${RECEIVE_TIMEOUT_SEC}`,
    signal,
  });
}

export function deleteNotification(credentials, receiptId) {
  return request(credentials, 'deleteNotification', {
    httpMethod: 'DELETE',
    path: `/${receiptId}`,
  });
}
