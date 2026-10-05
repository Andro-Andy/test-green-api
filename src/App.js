import { useState } from 'react';
import LoginForm from './components/LoginForm/LoginForm';
import Messenger from './components/Messenger/Messenger';
import { CHATS_STORAGE_KEY } from './hooks/useChats';
import { loadFromStorage, saveToStorage } from './utils/storage';

const CREDENTIALS_STORAGE_KEY = 'tg-chat.credentials';

export default function App() {
  const [credentials, setCredentials] = useState(() => loadFromStorage(CREDENTIALS_STORAGE_KEY, null));

  const handleLogin = (data) => {
    saveToStorage(CREDENTIALS_STORAGE_KEY, data);
    setCredentials(data);
  };

  const handleLogout = () => {
    saveToStorage(CREDENTIALS_STORAGE_KEY, null);
    saveToStorage(CHATS_STORAGE_KEY, null);
    setCredentials(null);
  };

  if (!credentials) {
    return <LoginForm onLogin={handleLogin} />;
  }
  return <Messenger credentials={credentials} onLogout={handleLogout} />;
}
