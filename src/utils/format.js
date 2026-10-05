export function normalizePhone(value) {
  return value.replace(/\D/g, '');
}

export function formatPhone(digits) {
  return digits ? `+${digits}` : '';
}

export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/** Из уведомления GREEN-API достаёт текстовое сообщение или возвращает null. */
export function parseTextNotification(body) {
  const { typeWebhook, senderData, messageData, idMessage, timestamp } = body || {};
  const isIncoming = typeWebhook === 'incomingMessageReceived';
  // outgoingMessageReceived — сообщение, отправленное с телефона/другого клиента, а не через API
  const isOutgoing = typeWebhook === 'outgoingMessageReceived';
  if ((!isIncoming && !isOutgoing) || !senderData?.chatId) return null;

  const text =
    messageData?.textMessageData?.textMessage ?? messageData?.extendedTextMessageData?.text;
  if (!text) return null;

  return {
    chatId: senderData.chatId,
    name: senderData.chatName || senderData.senderName || '',
    message: {
      id: idMessage,
      text,
      timestamp: timestamp ? timestamp * 1000 : Date.now(),
      outgoing: isOutgoing,
      status: 'sent',
    },
  };
}

// Статусы GREEN-API: sent → delivered → read; остальные (noAccount, failed, ...) — ошибка доставки
const DELIVERY_STATUSES = { sent: 'sent', delivered: 'delivered', read: 'read' };

/** Из уведомления outgoingMessageStatus достаёт новый статус исходящего сообщения или возвращает null. */
export function parseStatusNotification(body) {
  if (body?.typeWebhook !== 'outgoingMessageStatus' || !body.idMessage) return null;
  return {
    chatId: body.chatId,
    id: body.idMessage,
    status: DELIVERY_STATUSES[body.status] || 'failed',
  };
}
