import { useCallback, useEffect, useRef, useState } from 'react';
import { checkAccount, sendMessage } from '../../api/greenApi';
import { useChats } from '../../hooks/useChats';
import { useNotifications } from '../../hooks/useNotifications';
import { formatPhone, normalizePhone, parseStatusNotification, parseTextNotification } from '../../utils/format';
import ChatWindow from '../ChatWindow/ChatWindow';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Messenger.module.css';

export default function Messenger({ credentials, onLogout }) {
  const [chats, dispatch] = useChats();
  const [activeChatId, setActiveChatId] = useState(null);
  const activeChatIdRef = useRef(activeChatId);
  activeChatIdRef.current = activeChatId;

  const activeChat = chats.find((chat) => chat.chatId === activeChatId) || null;

  const handleNotification = useCallback(
    (body) => {
      const status = parseStatusNotification(body);
      if (status) {
        dispatch({ type: 'setStatus', ...status });
        return;
      }

      const parsed = parseTextNotification(body);
      if (!parsed) return;
      const unread = !parsed.message.outgoing && parsed.chatId !== activeChatIdRef.current;
      dispatch({ type: 'receiveMessage', ...parsed, unread });
    },
    [dispatch],
  );

  useNotifications(credentials, handleNotification);

  useEffect(() => {
    if (activeChatId) dispatch({ type: 'markRead', chatId: activeChatId });
  }, [activeChatId, activeChat?.unread, dispatch]);

  const handleCreateChat = async (input) => {
    const phone = normalizePhone(input);
    if (phone.length < 10 || phone.length > 15) {
      throw new Error('Введите номер в международном формате, например +79001234567');
    }

    const existing = chats.find((chat) => chat.phone === phone);
    if (existing) {
      setActiveChatId(existing.chatId);
      return;
    }

    const { exist, chatId } = await checkAccount(credentials, phone);
    if (!exist || !chatId) {
      throw new Error(`Номер ${formatPhone(phone)} не зарегистрирован в Telegram`);
    }
    dispatch({ type: 'createChat', chat: { chatId, phone, name: formatPhone(phone) } });
    setActiveChatId(chatId);
  };

  const deliver = async (chatId, id, text) => {
    try {
      const { idMessage } = await sendMessage(credentials, chatId, text);
      dispatch({ type: 'updateMessage', chatId, id, patch: { id: idMessage, status: 'sent' } });
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      dispatch({ type: 'updateMessage', chatId, id, patch: { status: 'failed' } });
    }
  };

  const handleSend = (text) => {
    const chatId = activeChatId;
    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    dispatch({
      type: 'receiveMessage',
      chatId,
      message: { id, text, timestamp: Date.now(), outgoing: true, status: 'sending' },
      unread: false,
    });
    deliver(chatId, id, text);
  };

  const handleRetry = (message) => {
    dispatch({ type: 'updateMessage', chatId: activeChatId, id: message.id, patch: { status: 'sending' } });
    deliver(activeChatId, message.id, message.text);
  };

  return (
    <div className={`${styles.layout} ${activeChat ? styles.chatOpen : ''}`}>
      <Sidebar
        className={styles.sidebar}
        chats={chats}
        activeChatId={activeChatId}
        idInstance={credentials.idInstance}
        onSelect={setActiveChatId}
        onCreateChat={handleCreateChat}
        onLogout={onLogout}
      />
      <ChatWindow
        className={styles.main}
        chat={activeChat}
        onSend={handleSend}
        onRetry={handleRetry}
        onBack={() => setActiveChatId(null)}
      />
    </div>
  );
}
