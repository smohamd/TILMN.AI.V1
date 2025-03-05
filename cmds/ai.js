const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const { sendMessage } = require("../handles/message");
const { gpt } = require("gpti");

const memoryPath = path.join(__dirname, "DB/memory.json");

// إعدادات البوت
const config = {
  maxMessageLength: 2000,
  delayBetweenMessages: 1000, // بالمللي ثانية
  maxRetryCount: 2,
  memoryLimit: 20 // الحد الأقصى للرسائل المخزنة لكل مستخدم
};

// قائمة الردود الثابتة
const mappings = [
  { question: "ما هو tilmn", type: 2, reply: "TILMN هو مشروع يستخدم الذكاء الاصطناعي لتحسين التفاعل مع المستخدمين." },
  { question: "اخرائيل", type: 2, reply: "تحيا فلسطين 🇵🇸, حرة 💪" },
  { question: "اسرائيل", type: 2, reply: "تحيا فلسطين 🇵🇸, حرة 💪" }
];

// تحميل الذاكرة من الملف
async function loadMemory() {
  try {
    await fs.access(memoryPath);
  } catch {
    await fs.writeFile(memoryPath, JSON.stringify({}, null, 2));
  }

  try {
    const data = await fs.readFile(memoryPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ خطأ أثناء تحميل الذاكرة:", error);
    return {};
  }
}

// حفظ الذاكرة
async function saveMemory(memory) {
  try {
    await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2));
  } catch (error) {
    console.error("❌ خطأ أثناء حفظ الذاكرة:", error);
  }
}

// حذف ذاكرة مستخدم معين
async function clearUserMemory(memory, senderId) {
  if (memory[senderId]) {
    memory[senderId] = [];
    await saveMemory(memory);
  }
}

// البحث عن رد ثابت في القائمة
function getMappingReply(message) {
  const lowerMsg = message.trim().toLowerCase();
  const normalizedMsg = lowerMsg.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟]/g, "").trim();

  for (let m of mappings) {
    if (m.type === 1 && normalizedMsg === m.question) {
      return m.reply;
    } else if (m.type === 2 && lowerMsg.includes(m.question)) {
      return m.reply;
    }
  }
  return null;
}

// إرسال رسالة طويلة مقسمة
function sendLongMessage(bot, text, authToken) {
  if (text.length > config.maxMessageLength) {
    const messages = text.match(new RegExp(`.{1,${config.maxMessageLength}}`, "g"));
    sendMessage(bot, { text: messages[0] }, authToken);
    messages.slice(1).forEach((msg, index) => {
      setTimeout(() => sendMessage(bot, { text: msg }, authToken), (index + 1) * config.delayBetweenMessages);
    });
  } else {
    sendMessage(bot, { text }, authToken);
  }
}

// دالة استدعاء GPT مع محاولات إعادة
async function attemptGPT(memoryMessages, prompt, retryCount) {
  try {
    const data = await gpt.v1({
      messages: memoryMessages,
      prompt: prompt,
      model: "GPT-4",
      markdown: false
    });
    return data.gpt;
  } catch (error) {
    console.error("❌ خطأ أثناء طلب GPT:", error);
    if (retryCount > 0) {
      console.log(`إعادة محاولة الاتصال بـ GPT... المتبقي: ${retryCount}`);
      memoryMessages.pop(); // إزالة آخر رسالة عند الفشل
      return await attemptGPT(memoryMessages, prompt, retryCount - 1);
    } else {
      throw error;
    }
  }
}

// تنفيذ الأمر عند تلقي رسالة
module.exports = {
  name: "ai",
  description: "🤖 بدون استخدام أمر، أرسل رسالة فقط",
  role: 1,
  author: "TILMN.AI",

  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error("❌ حدث خطأ: معرف المرسل مفقود.");
      return sendMessage(bot, { text: "Error: Missing sender ID." }, authToken);
    }
    const senderId = event.sender.id;

    // تجاهل الرسائل التي تحتوي على مرفقات غير نصية
    if (event.attachments && event.attachments.some(att => ["image", "audio", "voice"].includes(att.type))) {
      console.log("تم تجاهل المرفقات غير النصية.");
      return;
    }

    const userMessage = args.join(" ").trim();
    if (!userMessage) {
      return sendMessage(bot, { text: "🤖 ¦ اكتب سؤالاً وسأجيبك" }, authToken);
    }

    // التحقق من وجود رد ثابت
    const mappingReply = getMappingReply(userMessage);
    if (mappingReply) {
      return sendMessage(bot, { text: mappingReply }, authToken);
    }

    const memory = await loadMemory();
    if (!memory[senderId]) {
      memory[senderId] = [];
    }

    // تنظيف الذاكرة إذا امتلأت
    if (memory[senderId].length >= config.memoryLimit) {
      console.log("ذاكرة المستخدم ممتلئة. سيتم حذف الذاكرة وإعادة إرسال السؤال.");
      await clearUserMemory(memory, senderId);
    }

    // تحضير البرومبت الشخصي باستخدام النص المطلوب
    const personality = `انا ذكاء فلسطيني تم تطويري بواسطة المبدعين TILMN AI`;
    const replyText = event.replyMessage?.text ? `المستخدم رداً على: "${event.replyMessage.text}"\n\n` : "";
    const prompt = `${personality}\n\n${replyText}المستخدم: ${userMessage}`;

    // حفظ رسالة المستخدم
    memory[senderId].push({ role: "user", content: userMessage });
    await saveMemory(memory);

    try {
      // استدعاء GPT
      const gptResponse = await attemptGPT(memory[senderId], prompt, config.maxRetryCount);
      const botResponse = `${gptResponse}\n\n🤖 مساعدك الذكي هنا لمساعدتك!`;
      sendLongMessage(bot, botResponse, authToken);
    } catch (error) {
      console.error("❌ فشل الاتصال بـ GPT. سيتم حذف الذاكرة وإعادة المحاولة:", senderId);
      await clearUserMemory(memory, senderId);
      sendMessage(bot, { text: "⚠️ حدث خطأ أثناء الاتصال بـ GPT. يرجى إعادة إرسال السؤال." }, authToken);
    }
  }
};
