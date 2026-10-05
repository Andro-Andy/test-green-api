import { useEffect, useReducer } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export const CHATS_STORAGE_KEY = 'tg-chat.chats';

// Уведомления о статусах могут прийти не по порядку: «прочитано» не должно смениться на «доставлено»
const STATUS_RANK = { sending: 0, sent: 1, delivered: 2, read: 3 };

function isStatusUpgrade(current, next) {
  if (next === 'failed') return current !== 'read' && current !== 'failed';
  return current !== 'failed' && STATUS_RANK[next] > STATUS_RANK[current];
}

function updateChat(chats, chatId, update) {
  return chats.map((chat) => (chat.chatId === chatId ? update(chat) : chat));
}

function chatsReducer(chats, action) {
  switch (action.type) {
    case 'createChat': {
      if (chats.some((chat) => chat.chatId === action.chat.chatId)) return chats;
      return [{ messages: [], unread: 0, ...action.chat }, ...chats];
    }

    case 'receiveMessage': {
      const { chatId, name, message, unread } = action;
      const existing = chats.find((chat) => chat.chatId === chatId);

      if (!existing) {
        const chat = { chatId, name: name || chatId, phone: '', messages: [message], unread: unread ? 1 : 0 };
        return [chat, ...chats];
      }
      if (existing.messages.some((m) => m.id === message.id)) return chats;

      const updated = {
        ...existing,
        name: name || existing.name,
        messages: [...existing.messages, message],
        unread: unread ? existing.unread + 1 : existing.unread,
      };
      // Чат с новым сообщением поднимается наверх списка, как в Telegram
      return [updated, ...chats.filter((chat) => chat.chatId !== chatId)];
    }

    case 'updateMessage':
      return updateChat(chats, action.chatId, (chat) => ({
        ...chat,
        messages: chat.messages.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)),
      }));

    case 'setStatus':
      return chats.map((chat) => {
        if (action.chatId && chat.chatId !== action.chatId) return chat;
        const message = chat.messages.find((m) => m.id === action.id);
        if (!message || !isStatusUpgrade(message.status, action.status)) return chat;
        return {
          ...chat,
          messages: chat.messages.map((m) => (m === message ? { ...m, status: action.status } : m)),
        };
      });

    case 'markRead':
      return updateChat(chats, action.chatId, (chat) => (chat.unread ? { ...chat, unread: 0 } : chat));

    default:
      return chats;
  }
}

// Отправка, прерванная перезагрузкой страницы, считается неудавшейся — её можно повторить
function loadChats() {
  return loadFromStorage(CHATS_STORAGE_KEY, []).map((chat) => ({
    ...chat,
    messages: chat.messages.map((m) => (m.status === 'sending' ? { ...m, status: 'failed' } : m)),
  }));
}

export function useChats() {
  const [chats, dispatch] = useReducer(chatsReducer, undefined, loadChats);

  useEffect(() => {
    saveToStorage(CHATS_STORAGE_KEY, chats);
  }, [chats]);

  return [chats, dispatch];
}
