const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const { sendMessage } = require("../handles/message");
const { gpt } = require("gpti");
const puppeteer = require("puppeteer");

const memoryPath = path.join(__dirname, "DB/memory.json");

const config = {
  maxMessageLength: 2000,
  delayBetweenMessages: 1000,
  maxRetryCount: 2,
  memoryLimit: 20
};

// 🔎 دالة البحث عن صور مشابهة
async function searchSimilarImages(imageUrl) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(imageUrl)}`);

  await page.waitForSelector("img");
  const imageSrcs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("img")).map(img => img.src)
  );

  await browser.close();
  return imageSrcs.slice(0, 5);
}

// 🧠 تحميل الذاكرة
async function loadMemory() {
  try {
    await fs.access(memoryPath);
  } catch (err) {
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

// 📝 حفظ الذاكرة
async function saveMemory(memory) {
  try {
    await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2));
  } catch (error) {
    console.error("❌ خطأ أثناء حفظ الذاكرة:", error);
  }
}

// 🧹 مسح ذاكرة المستخدم
async function clearUserMemory(memory, senderId) {
  if (memory[senderId]) {
    memory[senderId] = [];
    await saveMemory(memory);
  }
}

// 🤖 إرسال الرسائل الطويلة على دفعات
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

// 🔄 إعادة محاولة الاتصال بـ GPT
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
      memoryMessages.pop();
      return await attemptGPT(memoryMessages, prompt, retryCount - 1);
    } else {
      throw error;
    }
  }
}

// 🎯 تنفيذ الكود
module.exports = {
  name: "ai",
  description: "🤖 ذكاء اصطناعي مع بحث عن صور مشابهة",
  role: 1,
  author: "TILMN.AI",

  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error("❌ خطأ: معرف المرسل مفقود.");
      return sendMessage(bot, { text: "خطأ: معرف المرسل مفقود." }, authToken);
    }
    const senderId = event.sender.id;

    // ✅ البحث عن صور مشابهة عند إرسال صورة
    if (event.attachments && event.attachments[0]?.type === "image") {
      const imageUrl = event.attachments[0].payload.url;
      sendMessage(bot, { text: "🔎 يتم البحث عن صور مشابهة..." }, authToken);

      try {
        const results = await searchSimilarImages(imageUrl);
        results.forEach(url => sendMessage(bot, { attachment: { type: "image", payload: { url } } }, authToken));
      } catch (error) {
        console.error("❌ خطأ أثناء البحث عن صور مشابهة:", error);
        sendMessage(bot, { text: "⚠️ تعذر العثور على صور مشابهة." }, authToken);
      }
      return;
    }

    // ✅ استخدام GPT-4 للرد على الرسائل النصية
    const userMessage = args.join(" ").trim();
    if (!userMessage) {
      return sendMessage(bot, { text: "🤖 ¦ اكتب رسالة وسأرد عليك." }, authToken);
    }

    const memory = await loadMemory();
    if (!memory[senderId]) {
      memory[senderId] = [];
    }

    // إذا امتلأت الذاكرة، يتم حذف الرسائل القديمة
    if (memory[senderId].length >= config.memoryLimit) {
      console.log("🗑️ ذاكرة المستخدم ممتلئة. سيتم حذفها.");
      await clearUserMemory(memory, senderId);
    }

    const personality = `🤖 أنت ذكاء اصطناعي فلسطيني متطور من TILMN.AI، تهتم بمساعدة المستخدمين بمعلومات دقيقة وسريعة.`;
    const prompt = `${personality}\n\nالمستخدم: ${userMessage}`;

    memory[senderId].push({ role: "user", content: userMessage });
    await saveMemory(memory);

    try {
      const gptResponse = await attemptGPT(memory[senderId], prompt, config.maxRetryCount);
      const botResponse = `${gptResponse}\n\n\n༺ཌ༈ 🤖 TILMN V 1 ⚙️ ༈ད༻`;
      sendLongMessage(bot, botResponse, authToken);
    } catch (error) {
      console.error("❌ فشل الاتصال بـ GPT. إعادة المحاولة...");
      await clearUserMemory(memory, senderId);
      memory[senderId] = [{ role: "user", content: userMessage }];
      await saveMemory(memory);

      try {
        const retryResponse = await attemptGPT(memory[senderId], prompt, config.maxRetryCount);
        const botResponseRetry = `${retryResponse}\n\n\n༺ཌ༈ 🤖 TILMN V 1 ⚙️ ༈ད༻`;
        sendLongMessage(bot, botResponseRetry, authToken);
      } catch (err) {
        console.error("❌ فشل الاتصال بـ GPT بعد إعادة المحاولة.");
        sendMessage(bot, { text: "⚠️ حدث خطأ أثناء الاتصال بـ GPT. يرجى إعادة إرسال السؤال." }, authToken);
      }
    }
  }
};
