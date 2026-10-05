import { useEffect, useRef, useState } from 'react';
import { formatPhone, formatTime } from '../../utils/format';
import Avatar from '../Avatar/Avatar';
import styles from './ChatWindow.module.css';

const CHECK_PATH = 'M4.5 12.5l4 4 9-9';

// Как в Telegram: одна галочка — отправлено/доставлено, две — прочитано
function StatusIcon({ status }) {
  if (status === 'failed') return <span className={styles.failed}>!</span>;
  if (status === 'sending') {
    return (
      <svg className={styles.statusIcon} viewBox="0 0 24 24" aria-label="Отправляется">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  const read = status === 'read';
  return (
    <svg className={styles.statusIcon} viewBox="0 0 24 24" aria-label={read ? 'Прочитано' : 'Отправлено'}>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={CHECK_PATH} transform={read ? 'translate(-2.5 0)' : undefined} />
        {read && <path d="M11.5 15.5l1 1 9-9" />}
      </g>
    </svg>
  );
}

function MessageBubble({ message, onRetry }) {
  const failed = message.status === 'failed';
  return (
    <div className={`${styles.bubble} ${message.outgoing ? styles.outgoing : styles.incoming}`}>
      <span className={styles.text}>{message.text}</span>
      <span className={styles.meta}>
        {formatTime(message.timestamp)}
        {message.outgoing && (
          <StatusIcon status={message.status} />
        )}
      </span>
      {failed && (
        <button className={styles.retry} type="button" onClick={() => onRetry(message)}>
          Не отправлено. Повторить
        </button>
      )}
    </div>
  );
}

function Composer({ onSend }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [text]);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={textareaRef}
        className={styles.input}
        rows={1}
        placeholder="Сообщение"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Текст сообщения"
        autoFocus
      />
      <button className={styles.send} type="submit" disabled={!text.trim()} aria-label="Отправить">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  );
}

export default function ChatWindow({ className, chat, onSend, onRetry, onBack }) {
  const listRef = useRef(null);
  const messageCount = chat?.messages.length ?? 0;

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [chat?.chatId, messageCount]);

  if (!chat) {
    return (
      <section className={`${styles.window} ${className}`}>
        <div className={styles.placeholder}>
          <span>Выберите чат или создайте новый</span>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.window} ${className}`}>
      <header className={styles.header}>
        <button className={styles.back} type="button" onClick={onBack} aria-label="Назад к списку чатов">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <Avatar name={chat.name} seed={chat.chatId} size={42} />
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>{chat.name}</div>
          <div className={styles.headerSub}>{chat.phone ? formatPhone(chat.phone) : `id ${chat.chatId}`}</div>
        </div>
      </header>

      <div className={styles.messages} ref={listRef}>
        <div className={styles.messagesInner}>
          {messageCount === 0 && (
            <div className={styles.placeholder}>
              <span>Сообщений пока нет. Напишите первым!</span>
            </div>
          )}
          {chat.messages.map((message) => (
            <MessageBubble key={message.id} message={message} onRetry={onRetry} />
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <Composer key={chat.chatId} onSend={onSend} />
      </div>
    </section>
  );
}
