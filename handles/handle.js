const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('./message');
const config = require('../configure.json');

const commands = new Map();
const prefix = '';

const commandFiles = fs.readdirSync(path.join(__dirname, '../cmds')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`../cmds/${file}`);
    commands.set(command.name.toLowerCase(), command);
    console.log(`✅ تم تحميل الأمر: ${command.name}`);
}

async function handleMessage(event, pageAccessToken) {
    if (!event?.sender?.id || event.sender.id.length < 10) {
        console.warn("⚠️ حدث بدون معرف مستخدم صالح، تم تجاهله.");
        return;
    }

    const senderId = event.sender.id;
    console.log(`📩 رسالة من المستخدم: ${senderId}`);

    if (event.message?.quick_reply) {
        const payload = event.message.quick_reply.payload;
        console.log(`📌 استجابة سريعة تم تلقيها: ${payload}`);

        if (payload.startsWith("صور_")) {
            const command = commands.get("صور");
            if (command) {
                try {
                    await command.execute(senderId, [], pageAccessToken, payload);
                } catch (error) {
                    console.error(`❌ خطأ في تنفيذ أمر "صور":`, error);
                    sendMessage(senderId, { text: 'حدث خطأ أثناء تنفيذ الأمر.' }, pageAccessToken);
                }
            }
            return;
        }
    }

    if (event.message?.text) {
        const messageText = event.message.text.trim();
        console.log(`📩 النص المستلم: ${messageText}`);

        const words = messageText.split(' ');
        const commandName = words.shift().toLowerCase();
        const args = words;

        if (commands.has(commandName)) {
            const command = commands.get(commandName);

            if (command.role === 0 && !config.adminId.includes(senderId)) {
                sendMessage(senderId, { text: '🚫 ليس لديك الصلاحيات لاستخدام هذا الأمر.' }, pageAccessToken);
                return;
            }

            try {
                let imageUrl = '';

                if (event.message?.reply_to?.mid) {
                    try {
                        imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
                    } catch (error) {
                        console.error("⚠️ فشل في جلب الصورة المرفقة:", error);
                    }
                } else if (event.message?.attachments?.[0]?.type === 'image') {
                    imageUrl = event.message.attachments[0].payload.url;
                }

                await command.execute(senderId, args, pageAccessToken, event, imageUrl);
            } catch (error) {
                console.error(`❌ خطأ أثناء تنفيذ الأمر "${commandName}":`, error);
                sendMessage(senderId, { text: 'حدث خطأ أثناء تنفيذ الأمر.' }, pageAccessToken);
            }
        } else {
            const defaultCommand = commands.get('ai');
            if (defaultCommand) {
                try {
                    await defaultCommand.execute(senderId, [messageText], pageAccessToken, event);
                } catch (error) {
                    console.error('❌ خطأ في تنفيذ الأمر الافتراضي "ai":', error);
                    sendMessage(senderId, { text: 'حدث خطأ أثناء معالجة طلبك.' }, pageAccessToken);
                }
            } else {
                sendMessage(senderId, { text: "❓ لم أفهم ذلك، حاول مرة أخرى." }, pageAccessToken);
            }
        }
    }
}

async function getAttachments(mid, pageAccessToken) {
    if (!mid) {
        throw new Error("❌ لا يوجد معرف رسالة للحصول على المرفقات.");
    }

    try {
        const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
            params: { access_token: pageAccessToken }
        });

        if (data?.data?.length > 0 && data.data[0].image_data) {
            return data.data[0].image_data.url;
        } else {
            throw new Error("⚠️ لم يتم العثور على صورة في الرسالة.");
        }
    } catch (error) {
        console.error("❌ خطأ أثناء جلب المرفقات:", error.response?.data || error.message);
        throw new Error("❌ فشل في جلب المرفقات.");
    }
}

module.exports = { handleMessage };
