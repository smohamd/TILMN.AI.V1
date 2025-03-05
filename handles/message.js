const axios = require('axios');

async function sendMessage(senderId, message, pageAccessToken) {
    if (!senderId || senderId.length < 10) {
        console.error(`❌ معرف المستخدم غير صالح: ${senderId}`);
        return;
    }

    try {
        console.log(`📤 إرسال رسالة إلى: ${senderId}`);
        const response = await axios.post(`https://graph.facebook.com/v21.0/me/messages`, {
            recipient: { id: senderId },
            message
        }, {
            params: { access_token: pageAccessToken }
        });

        console.log("✅ تم إرسال الرسالة بنجاح:", response.data);
    } catch (error) {
        if (error.response?.data?.code === 100 && error.response?.data?.error_subcode === 2018001) {
            console.warn(`⚠️ المستخدم ${senderId} غير موجود أو لم يبدأ محادثة مع البوت.`);
        } else {
            console.error("❌ خطأ أثناء إرسال الرسالة:", error.response?.data || error.message);
        }
    }
}

module.exports = { sendMessage };
