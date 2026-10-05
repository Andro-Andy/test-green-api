# Telegram Chat · GREEN-API

Тестовое задание «Фронтенд-разработчик React»: интерфейс для отправки и получения текстовых
сообщений в **Telegram** через сервис [GREEN-API](https://green-api.com/telegram).
Внешний вид повторяет [web.telegram.org](https://web.telegram.org).

## Возможности

1. Вход по учётным данным инстанса GREEN-API: `idInstance` и `apiTokenInstance`.
   При входе данные проверяются запросом `getStateInstance`, и инстанс должен быть авторизован.
2. Создание чата по номеру телефона получателя. Номер переводится в Telegram `chatId`
   методом `checkAccount`. Если номер не зарегистрирован в Telegram, появляется сообщение об ошибке.
3. Отправка текстовых сообщений методом
   [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/).
   Если отправка не удалась, её можно повторить.
   Статус показывается как в Telegram: одна галочка означает «отправлено», две — «прочитано».
   Статусы приходят уведомлениями `outgoingMessageStatus`.
4. Получение сообщений по технологии
   [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/):
   цикл `receiveNotification` → обработка → `deleteNotification`.
   Входящее сообщение от нового собеседника создаёт чат автоматически.
5. Учётные данные и переписка сохраняются в `localStorage`. Кнопка «Выйти» удаляет их.
6. Адаптивная вёрстка: на мобильных устройствах, как в Telegram, видна либо панель чатов, либо открытый чат.

## Стек

- React 18, Create React App, JavaScript
- CSS Modules
- Без сторонних библиотек: запросы через `fetch`, получение уведомлений в собственном хуке `useNotifications`

## Запуск

```bash
npm install
npm start        # http://localhost:3000
npm run build    # production-сборка в папке build/
```

Если у вашего инстанса `apiUrl` отличается от `https://api.green-api.com`, создайте файл `.env.local`
по образцу `.env.example`.

## Как проверить

1. В [личном кабинете GREEN-API](https://console.green-api.com) создайте инстанс Telegram и авторизуйте его.
2. В настройках инстанса (раздел «Уведомления»):
   - поле «Адрес отправки уведомлений (URL)» оставьте пустым, иначе очередь HTTP API будет пустой;
   - включите «Получать уведомления о входящих сообщениях и файлах»;
   - включите «Получать уведомления о статусах отправленных сообщений», чтобы работали галочки «прочитано».
3. Откройте приложение, введите `idInstance` и `apiTokenInstance`.
4. Введите номер телефона получателя (в международном формате) и нажмите «Создать чат».
5. Отправьте сообщение и ответьте на него из Telegram. Ответ появится в чате.

## Структура

```
src/
├── api/greenApi.js            # запросы к GREEN-API и обработка ошибок
├── hooks/
│   ├── useChats.js            # состояние чатов (useReducer) и их сохранение
│   └── useNotifications.js    # polling receiveNotification/deleteNotification
├── utils/                     # форматирование, разбор уведомлений, localStorage
└── components/
    ├── LoginForm/             # экран входа
    ├── Messenger/             # контейнер: связывает API, состояние и UI
    ├── Sidebar/               # список чатов и форма нового чата
    ├── ChatWindow/            # сообщения и поле ввода
    └── Avatar/
```
