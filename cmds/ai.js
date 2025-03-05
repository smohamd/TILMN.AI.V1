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
  memoryLimit: 20  // الحد الأقصى لعدد الرسائل في الذاكرة قبل الحذف
};

// مصفوفة الردود الثابتة مع إضافة رد للمطور
const mappings = [
  { question: "اخرائيل", type: 2, reply: "تحيا فلسطين 🇵🇸, حرة 💪\n\n༺ཌ༈🤖 TILMN V 1 ⚙️ ༈ད༻" },
  { question: "اسرائيل", type: 2, reply: "تحيا فلسطين 🇵🇸, حرة 💪\n\n༺ཌ༈🤖 TILMN V 1 ⚙️ ༈ད༻" }
  // إضافة الرد للمطور أو لمن يسأل "من أنت"
  
];

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

// تحميل الذاكرة باستخدام fs.promises
async function loadMemory() {
  try {
    await fs.access(memoryPath);
  } catch (err) {
    // إذا لم يكن الملف موجوداً، نقوم بإنشائه
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

async function saveMemory(memory) {
  try {
    await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2));
  } catch (error) {
    console.error("❌ خطأ أثناء حفظ الذاكرة:", error);
  }
}

async function clearUserMemory(memory, senderId) {
  if (memory[senderId]) {
    memory[senderId] = [];
    await saveMemory(memory);
  }
}

// دالة إعادة محاولة الاتصال بـ GPT مع إزالة الرسائل غير الناجحة
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
      // إزالة آخر رسالة لتجنب تراكم السياق الخاطئ
      memoryMessages.pop();
      return await attemptGPT(memoryMessages, prompt, retryCount - 1);
    } else {
      throw error;
    }
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, "g");
  return message.match(regex);
}

function sendLongMessage(bot, text, authToken) {
  if (text.length > config.maxMessageLength) {
    const messages = splitMessageIntoChunks(text, config.maxMessageLength);
    sendMessage(bot, { text: messages[0] }, authToken);
    messages.slice(1).forEach((msg, index) => {
      setTimeout(() => sendMessage(bot, { text: msg }, authToken), (index + 1) * config.delayBetweenMessages);
    });
  } else {
    sendMessage(bot, { text }, authToken);
  }
}

module.exports = {
  name: "ai",
  description: "🤖 بدون استخدام أمر، أرسل رسالة فقط",
  role: 1,
  author: "TILMN.AI",

  async execute(bot, args, authToken, event) {
    // التحقق من وجود معرف المرسل
    if (!event?.sender?.id) {
      console.error("❌ حدث خطأ: معرف المرسل مفقود.");
      return sendMessage(bot, { text: "Error: Missing sender ID." }, authToken);
    }
    const senderId = event.sender.id;

    // تجاهل الرسائل التي تحتوي على مرفقات غير نصية (صور، تسجيلات صوتية)
    if (event.attachments && Array.isArray(event.attachments)) {
      const ignoredTypes = ["image", "audio", "voice"];
      if (event.attachments.some(att => ignoredTypes.includes(att.type))) {
        console.log("تم تجاهل المرفقات غير النصية.");
        return;
      }
    }

    const userMessage = args.join(" ").trim();
    if (!userMessage) {
      return sendMessage(
        bot,
        { text: "🤖 ¦ اكتب سؤالاً وسأجيبك\n༺ཌ༈🤖 TILMN V 1 ⚙️ ༈ད༻" },
        authToken
      );
    }

    // التحقق من وجود رد ثابت في المصفوفة (يشمل أسئلة عن المطور)
    const mappingReply = getMappingReply(userMessage);
    if (mappingReply) {
      return sendMessage(bot, { text: mappingReply }, authToken);
    }

    const memory = await loadMemory();
    if (!memory[senderId]) {
      memory[senderId] = [];
    }

    // إذا امتلأت الذاكرة (عدد الرسائل وصل للحد الأقصى)، نقوم بحذفها
    if (memory[senderId].length >= config.memoryLimit) {
      console.log("ذاكرة المستخدم ممتلئة. سيتم حذف الذاكرة وإعادة إرسال السؤال.");
      await clearUserMemory(memory, senderId);
    }

    // إعداد برومبت الشخصية مع صياغة مبسطة
    const personality = `انت ذكاء اصطناعي فلسطيني و متطور تم إنشاؤك بواسطة TILMN.AI. تتميز بالمعرفة الواسعة والقدرة على فهم الأسئلة والإجابة عليها بدقة.`;
    
    // تضمين الرد على رسالة سابقة إذا كانت نصية فقط
    const replyText = event.replyMessage && typeof event.replyMessage.text === 'string' ? event.replyMessage.text : null;
    let prompt = personality + "\n\n";
    if (replyText) {
      prompt += `المستخدم رداً على الرسالة:\n"${replyText}"\n\n`;
    }
    prompt += `المستخدم: ${userMessage}`;

    // حفظ رسالة المستخدم في الذاكرة
    memory[senderId].push({ role: "user", content: userMessage });
    await saveMemory(memory);

    try {
      // محاولة الاتصال بـ GPT مع إعادة المحاولة عند الفشل
      const gptResponse = await attemptGPT(memory[senderId], prompt, config.maxRetryCount);
      const botResponse = `${gptResponse}\n\n\n༺ཌ༈ 🤖 TILMN V 1 ⚙️ ༈ད༻`;
      sendLongMessage(bot, botResponse, authToken);
    } catch (error) {
      // عند استمرار الخطأ، حذف ذاكرة المستخدم وإعادة إرسال السؤال تلقائياً
      console.error("❌ فشل الاتصال بـ GPT. إعادة إرسال السؤال بعد حذف الذاكرة:", senderId);
      await clearUserMemory(memory, senderId);
      // إعادة إرسال السؤال: إعادة تعيين الذاكرة وإضافة رسالة المستخدم
      memory[senderId] = [];
      memory[senderId].push({ role: "user", content: userMessage });
      await saveMemory(memory);
      try {
        const retryResponse = await attemptGPT(memory[senderId], prompt, config.maxRetryCount);
        const botResponseRetry = `${retryResponse}\n\n\n༺ཌ༈ 🤖 TILMN V 1 ⚙️ ༈ད༻`;
        sendLongMessage(bot, botResponseRetry, authToken);
      } catch (err) {
        console.error("❌ فشل الاتصال بـ GPT بعد إعادة إرسال السؤال:", senderId);
        sendMessage(
          bot,
          { text: "⚠️ حدث خطأ أثناء الاتصال بـ GPT. يرجى إعادة إرسال السؤال." },
          authToken
        );
      }
    }
  }
};
