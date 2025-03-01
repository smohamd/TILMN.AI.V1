const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { sendMessage } = require("../handles/message");
const { gpt } = require("gpti");

const memoryPath = path.join(__dirname, "DB/memory.json");

// مصفوفة الردود الثابتة
// النوع 1: يطلب تطابقاً تاماً بعد إزالة علامات الترقيم والمسافات الزائدة
// النوع 2: تطابق جزئي، حيث تكفي وجود الكلمة المفتاحية داخل السؤال
const mappings = [
  { question: "اخرائيل", type: 2, reply: "تحيا فلسطين 🇵🇸, حرة 💪\N\N ༺ཌ༈🤖 TILMN V 1 ⚙️ ༈ད༻" },

  { question: "اسرائيل", type: 2, reply: "تحيا فلسطين 🇵🇸, حرة 💪\N\N ༺ཌ༈🤖 TILMN V 1 ⚙️ ༈ད༻"}, 
  // يمكن إضافة عناصر أخرى هنا على النحو التالي:
  // { question: "كيف حالك", type: 1, reply: "أنا بخير، شكرًا لسؤالك!" }
];

function getMappingReply(message) {
  // تحويل النص إلى حروف صغيرة وإزالة الفراغات الإضافية
  const lowerMsg = message.trim().toLowerCase();
  // إزالة علامات الترقيم للمقارنة (خاص بالنوع 1)
  const normalizedMsg = lowerMsg.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟]/g, "").trim();

  for (let m of mappings) {
    if (m.type === 1) {
      // تطابق تام: يجب أن يكون السؤال مطابقًا تماماً بعد التطبيع
      if (normalizedMsg === m.question) {
        return m.reply;
      }
    } else if (m.type === 2) {
      // تطابق جزئي: إذا كانت الكلمة المفتاحية موجودة ضمن النص
      if (lowerMsg.includes(m.question)) {
        return m.reply;
      }
    }
  }
  return null;
}

function loadMemory() {
  try {
    if (!fs.existsSync(memoryPath)) {
      fs.writeFileSync(memoryPath, JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync(memoryPath, "utf8"));
  } catch (error) {
    console.error("❌ خطأ أثناء تحميل الذاكرة:", error);
    return {};
  }
}

function saveMemory(memory) {
  try {
    fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
  } catch (error) {
    console.error("❌ خطأ أثناء حفظ الذاكرة:", error);
  }
}

module.exports = {
  name: "ai",
  description: "🤖 بدون استخدام امر ارسل رسالة فقط",
  role: 1,
  author: "TILMN.AI",

  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error("Invalid event object: Missing sender ID.");
      sendMessage(bot, { text: "Error: Missing sender ID." }, authToken);
      return;
    }

    const senderId = event.sender.id;
    const userMessage = args.join(" ").trim();

    if (!userMessage) {
      return sendMessage(
        bot,
        { text: "ً      🤖 ¦ اكتب سوال و انا اجيب\n༺ཌ༈🤖 TILMN V 1 ⚙️ ༈ད༻" },
        authToken
      );
    }

    // تحقق من المصفوفة للرد الثابت
    const mappingReply = getMappingReply(userMessage);
    if (mappingReply) {
      return sendMessage(bot, { text: mappingReply }, authToken);
    }

    const memory = loadMemory();
    if (!memory[senderId]) {
      memory[senderId] = [];
    }

    // برومبت الشخصية الأساسي
    let personality = `
انت ذكاء فلسطيني ذكي ومتطور من قبل المبدعين في TILMN.AI. لديك قدرة تحليلية عالية وفهم عميق، ولا تنسى هويتك ومهامك.
    `;

    // التحقق من وجود رسالة يتم الرد عليها وإدراجها ضمن البرومبت
    const replyText = event.replyMessage?.text;
    let prompt = "";
    if (replyText) {
      prompt = `${personality}\n\nالمستخدم رداً على الرسالة:\n"${replyText}"\n\nالمستخدم: ${userMessage}`;
    } else {
      prompt = `${personality}\n\nالمستخدم: ${userMessage}`;
    }

    // حفظ رسالة المستخدم في الذاكرة
    memory[senderId].push({ role: "user", content: userMessage });
    saveMemory(memory);

    try {
      let data = await gpt.v1({
        messages: memory[senderId],
        prompt: prompt,
        model: "GPT-4",
        markdown: false
      });

      // إضافة التوقيع في نهاية الرد
      const botResponse = data.gpt + "\n\n\n༺ཌ༈ 🤖 TILMN V 1 ⚙️ ༈ད༻";
      sendLongMessage(bot, botResponse, authToken);
    } catch (error) {
      console.error("❌ خطأ أثناء طلب GPT:", error);
      sendMessage(
        bot,
        { text: "⚠️ حدث خطأ أثناء الاتصال بـ GPT. حاول مرة أخرى لاحقًا." },
        authToken
      );
    }
  }
};

function sendLongMessage(bot, text, authToken) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    sendMessage(bot, { text: messages[0] }, authToken);

    messages.slice(1).forEach((message, index) => {
      setTimeout(() => sendMessage(bot, { text: message }, authToken), (index + 1) * delayBetweenMessages);
    });
  } else {
    sendMessage(bot, { text }, authToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, "g");
  return message.match(regex);
}
