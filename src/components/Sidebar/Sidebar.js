import { useState } from 'react';
import { formatTime } from '../../utils/format';
import Avatar from '../Avatar/Avatar';
import styles from './Sidebar.module.css';

function NewChatForm({ onCreateChat }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onCreateChat(phone);
      setPhone('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.newChat} onSubmit={handleSubmit}>
      <div className={styles.newChatRow}>
        <input
          className={styles.phoneInput}
          type="tel"
          placeholder="+7 900 123-45-67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-label="Номер телефона получателя"
        />
        <button className={styles.createButton} type="submit" disabled={loading || !phone.trim()}>
          {loading ? '…' : 'Создать чат'}
        </button>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </form>
  );
}

function ChatItem({ chat, active, onSelect }) {
  const last = chat.messages[chat.messages.length - 1];
  return (
    <li>
      <button
        type="button"
        className={`${styles.chatItem} ${active ? styles.active : ''}`}
        onClick={() => onSelect(chat.chatId)}
      >
        <Avatar name={chat.name} seed={chat.chatId} />
        <div className={styles.chatInfo}>
          <div className={styles.chatRow}>
            <span className={styles.chatName}>{chat.name}</span>
            {last && <span className={styles.chatTime}>{formatTime(last.timestamp)}</span>}
          </div>
          <div className={styles.chatRow}>
            <span className={styles.chatPreview}>
              {last ? `${last.outgoing ? 'Вы: ' : ''}${last.text}` : 'Нет сообщений'}
            </span>
            {chat.unread > 0 && <span className={styles.badge}>{chat.unread}</span>}
          </div>
        </div>
      </button>
    </li>
  );
}

export default function Sidebar({ className, chats, activeChatId, idInstance, onSelect, onCreateChat, onLogout }) {
  return (
    <aside className={`${styles.sidebar} ${className}`}>
      <header className={styles.header}>
        <div>
          <div className={styles.title}>Telegram</div>
          <div className={styles.instance}>Инстанс {idInstance}</div>
        </div>
        <button className={styles.logout} type="button" onClick={onLogout}>
          Выйти
        </button>
      </header>

      <NewChatForm onCreateChat={onCreateChat} />

      {chats.length === 0 ? (
        <p className={styles.empty}>
          Чатов пока нет. Введите номер телефона, чтобы начать переписку.
        </p>
      ) : (
        <ul className={styles.list}>
          {chats.map((chat) => (
            <ChatItem key={chat.chatId} chat={chat} active={chat.chatId === activeChatId} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </aside>
  );
}
