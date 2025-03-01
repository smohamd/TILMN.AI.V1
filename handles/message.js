const request = require('request');
const axios = require('axios');

async function typingIndicator(senderId, pageAccessToken) {
    if (!senderId) {
        console.error('Invalid senderId for typing indicator.');
        return;
    }

    try {
        await axios.post(`https://graph.facebook.com/v13.0/me/messages`, {
            recipient: { id: senderId },
            sender_action: 'typing_on',
        }, {
            params: { access_token: pageAccessToken },
        });
    } catch (error) {
        console.error('Error sending typing indicator:', error.response?.data || error.message);
    }
}

function sendMessage(senderId, message, pageAccessToken) {
    if (!message || (!message.text && !message.attachment)) {
        console.error("Message must contain 'text' or 'attachment'.");
        return;
    }

    typingIndicator(senderId, pageAccessToken);

    const requestData = {
        recipient: { id: senderId },
        message,
    };

    request.post(
        {
            url: `https://graph.facebook.com/v13.0/me/messages`,
            qs: { access_token: pageAccessToken },
            json: requestData,
        },
        (error, response, body) => {
            if (error) {
                console.error('Error sending message:', error);
            } else {
                console.log('Message sent successfully:', body);
            }
        }
    );
}

module.exports = { sendMessage };

