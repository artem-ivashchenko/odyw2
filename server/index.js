import { WebSocketServer } from 'ws';

/**
 * 
 * @param {object} message
 * @returns {bool}
 */
const validateMessage = (message) => {
  if (!message.hasOwnProperty('type') || !message.hasOwnProperty('payload'))
    return false;

  return true;
};

/**
 * 
 * @param {string} username 
 * @param {string} message 
 * @param {string} timestamp 
 * @returns {string}
 */
const newMessage = (username, message, timestamp) => {
  return JSON.stringify({
    type: 'message',
    payload: { nickname: username, message, timestamp }
  });
};

/**
 * 
 * @param {string} message 
 * @returns {string}
 */
const newError = (message) => {
  return JSON.stringify({
    type: 'error',
    payload: { message }
  })
};

const websocketServer = new WebSocketServer({ port: 8080 });

websocketServer.on('connection', (connection) => { 
  connection.on('error', (error) => {
    console.error(error);
  });

  connection.on('message', (data) => {
    console.log('received: %s', data);
    let parsedData;

    try {
      parsedData = JSON.parse(data);
    } catch (error) {
      return connection.send(newError('failed to parse'));
    }

    if (!validateMessage(parsedData))
      return connection.send(newError('failed to validate'));

    switch (parsedData.type) {
      case 'message':
        const payload = parsedData.payload;

        if (!payload.nickname || !payload.message)
          return connection.send(newError('failed to validate'));

        const dateFormatted = new Date(parseInt(payload.timestamp))
          .toLocaleTimeString();

        websocketServer.clients.forEach((client) => {
          client.send(newMessage(payload.nickname, payload.message, dateFormatted));
        });
        break;
      default:
        connection.send(newError('unknown message type'));
        break;
    }
  });
});
