const { sendMessage } = require('./message');

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

}

module.exports = { handlePostback };
