import { useState } from 'react';
import { getStateInstance } from '../../api/greenApi';
import styles from './LoginForm.module.css';

export default function LoginForm({ onLogin }) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const credentials = { idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() };
    if (!credentials.idInstance || !credentials.apiTokenInstance) {
      setError('Заполните оба поля');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { stateInstance } = await getStateInstance(credentials);
      if (stateInstance !== 'authorized') {
        setError('Инстанс не авторизован. Авторизуйте Telegram в личном кабинете GREEN-API');
        return;
      }
      onLogin(credentials);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.logo} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="56" height="56">
            <path
              fill="currentColor"
              d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
            />
          </svg>
        </div>
        <h1 className={styles.title}>Вход в чат</h1>
        <p className={styles.subtitle}>Введите данные инстанса из личного кабинета GREEN-API</p>

        <label className={styles.field}>
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            inputMode="numeric"
            autoComplete="username"
            autoFocus
          />
        </label>
        <label className={styles.field}>
          <span>apiTokenInstance</span>
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Проверка…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
