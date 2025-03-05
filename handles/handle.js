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
    console.log(`Loaded command: ${command.name}`);
}

async function handleMessage(event, pageAccessToken) {
    if (!event?.sender?.id) {
        console.error('Invalid event object: Missing sender ID.', JSON.stringify(event, null, 2));
        return;
    }

    const senderId = event.sender.id.toString().trim();
    console.log(`Received message from user: ${senderId}`);

    // التحقق أولاً من وجود زر (Quick Reply)
    if (event.message?.quick_reply) {
        const payload = event.message.quick_reply.payload;
        console.log(`Received quick reply payload: ${payload}`);

        if (payload.startsWith("صور_")) {
            const command = commands.get("صور");
            if (command) {
                try {
                    await command.execute(senderId, [], pageAccessToken, payload);
                } catch (error) {
                    console.error(`Error executing command "صور" with payload:`, error);
                    sendMessage(senderId, { text: 'حدث خطأ أثناء تنفيذ الأمر.' }, pageAccessToken);
                }
                return;
            }
        }
    }

    // معالجة النصوص العادية
    if (event.message?.text) {
        const messageText = event.message.text.trim();
        console.log(`Received message: ${messageText}`);

        const words = messageText.split(' ');
        const commandName = words.shift().toLowerCase();
        const args = words;

        console.log(`Parsed command: ${commandName} with arguments: ${args}`);

        if (commands.has(commandName)) {
            const command = commands.get(commandName);

            if (command.role === 0 && !config.adminId.includes(senderId)) {
                sendMessage(senderId, { text: 'ليس لديك الصلاحية لاستخدام هذا الأمر.' }, pageAccessToken);
                return;
            }

            try {
                let imageUrl = '';

                if (event.message?.reply_to?.mid) {
                    try {
                        imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
                    } catch (error) {
                        console.error("Failed to get attachment:", error);
                        imageUrl = '';
                    }
                } else if (event.message?.attachments?.[0]?.type === 'image') {
                    imageUrl = event.message.attachments[0].payload.url;
                }

                await command.execute(senderId, args, pageAccessToken, event, imageUrl);
            } catch (error) {
                console.error(`Error executing command "${commandName}":`, error);
                sendMessage(senderId, { text: 'حدث خطأ أثناء تنفيذ الأمر.' }, pageAccessToken);
            }
        } else {
            const defaultCommand = commands.get('ai');
            if (defaultCommand) {
                try {
                    await defaultCommand.execute(senderId, [messageText], pageAccessToken, event);
                } catch (error) {
                    console.error('Error executing default "ai" command:', error);
                    sendMessage(senderId, { text: 'حدث خطأ أثناء معالجة طلبك.' }, pageAccessToken);
                }
            } else {
                sendMessage(senderId, { text: "لم أفهم ذلك. حاول مرة أخرى." }, pageAccessToken);
            }
        }
    } else {
        console.error('Message or text is not present in the event.');
    }
}

async function getAttachments(mid, pageAccessToken) {
    if (!mid) {
        console.error("No message ID provided for getAttachments.");
        throw new Error("No message ID provided.");
    }

    try {
        const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
            params: { access_token: pageAccessToken }
        });

        if (data?.data?.length > 0 && data.data[0].image_data) {
            return data.data[0].image_data.url;
        } else {
            console.error("No image found in the replied message.");
            throw new Error("No image found in the replied message.");
        }
    } catch (error) {
        console.error("Error fetching attachments:", error.response?.data || error.message);
        throw new Error("Failed to fetch attachments.");
    }
}

module.exports = { handleMessage };
