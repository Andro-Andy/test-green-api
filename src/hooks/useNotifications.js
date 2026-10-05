import { useEffect, useRef } from 'react';
import { deleteNotification, receiveNotification } from '../api/greenApi';

const RETRY_DELAY_MS = 5000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Получение входящих по технологии HTTP API:
 * receiveNotification - обработка - deleteNotification - следующий запрос.
 * Уведомление удаляется в любом случае, иначе очередь «застрянет» на нём.
 */
export function useNotifications(credentials, onNotification) {
  const handlerRef = useRef(onNotification);
  handlerRef.current = onNotification;

  useEffect(() => {
    if (!credentials) return undefined;

    const controller = new AbortController();
    let active = true;

    (async () => {
      while (active) {
        try {
          const notification = await receiveNotification(credentials, controller.signal);
          if (!notification) continue;

          try {
            handlerRef.current(notification.body);
          } finally {
            await deleteNotification(credentials, notification.receiptId);
          }
        } catch (error) {
          if (!active) return;
          console.error('Ошибка получения уведомлений:', error);
          await delay(RETRY_DELAY_MS);
        }
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [credentials]);
}
