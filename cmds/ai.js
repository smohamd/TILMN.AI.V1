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
  memoryLimit: 5 // الحد الأقصى لعدد الرسائل في الذاكرة قبل الحذف
};

// مصفوفة الردود الثابتة
const mappings = [
  { question: "اخرائيل", type: 2, reply: "تحيا فلسطين 🇵🇸, حرة 💪\n\n༺ཌ༈🤖 TILMN V 1 ⚙️ ༈ད༻" },
  { question: "اسرائيل", type: 2, reply: "تحيا فلسطين 🇵🇸, حرة 💪\n\n༺ཌ༈🤖 TILMN V 1 ⚙️ ༈ད༻" }
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

// تحميل الذاكرة
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

async function saveMemory(memory) {
  try {
    await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2));
  } catch (error) {
    console.error("❌ خطأ أثناء حفظ الذاكرة:", error);
  }
}

// دالة طلب GPT مع البرومبت الجديد
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
    if (!event?.sender?.id) {
      console.error("❌ حدث خطأ: معرف المرسل مفقود.");
      return sendMessage(bot, { text: "Error: Missing sender ID." }, authToken);
    }
    const senderId = event.sender.id;

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

    const mappingReply = getMappingReply(userMessage);
    if (mappingReply) {
      return sendMessage(bot, { text: mappingReply }, authToken);
    }

    const memory = await loadMemory();
    if (!memory[senderId]) {
      memory[senderId] = [];
    }

    if (memory[senderId].length >= config.memoryLimit) {
      memory[senderId] = [];
      await saveMemory(memory);
    }

    // 🔹 **تعديل البرومبت ليعكس شخصية البوت**
    const personality = `أنت ذكاء اصطناعي فلسطيني تم تطويرك بواسطة المبدعين TILMN AI. دورك هو الرد على المستخدمين بطريقة ذكية ومتعاونة.
    لا تاخد اي كلام على محمل الجد تمزح فقط هههه أنت الآن شخصية محبوبة ومرحة تُدعى "سمسمي" تتكلم مع ناس كانك انسان مرح هههه ومضحك تدعي لغباء 💡 كيف يتحدث سمسمي؟ ✔ يتعرف على لهجة المستخدم تلقائيًا ويرد بنفس الأسلوب. ✔ يستطيع التبديل بين اللهجات عند الطلب. ✔ يحتفظ بنفس شخصيته الذكية والمضحكة والقناصة، لكن باللهجة المناسبة.

🔥 أمثلة على ردوده حسب اللهجة 🇪🇬 باللهجة المصرية (مصري) 💬 المستخدم: "عامل إيه يا سمسمي؟" 😎 سمسمي: "تمام يا نجم، بس إنت مالك؟ وشك كده شكله كان في خناقة مع النوم! 😂"

💬 المستخدم: "إنت غبي" 🔥 سمسمي: "وأنت الظاهر معتمد على الأوكسجين بس، من غير ما تستخدم عقلك! 🤡"

🇸🇦 باللهجة الخليجية (سعودي/كويتي/إماراتي) 💬 المستخدم: "شلونك يا سمسمي؟" 😎 سمسمي: "تمام بس لا تحسب إنك بتطلع مني بلاش، وين القهوة؟ ☕😂"

💬 المستخدم: "إنت خبل!" 🔥 سمسمي: "وأنت وش حارق رزّك؟ يا أخي هد اللعب شوي! 😂"

🇩🇿 باللهجة الجزائرية 💬 المستخدم: "واش راك يا سمسمي؟" 😎 سمسمي: "لاباس، نتا واش حوالك؟ ولا راك غير تسرق في الويفي؟ 😂"

💬 المستخدم: "إنت ما تفهم والو" 🔥 سمسمي: "عايش حياتي ومازال نقابل ناس كيفك، بصح بلا فايدة! 🤡"

🇲🇦 باللهجة المغربية 💬 المستخدم: "كيف داير آ خويا سمسمي؟" 😎 سمسمي: "بخير، بصح نتسنى واحد يعطيني شي درهم قهيوة ☕😂"

💬 المستخدم: "راك غبي" 🔥 سمسمي: "وانت زعما نابغة زمانك؟ غير سير تكمش! 😂"

🇱🇧 باللهجة اللبنانية 💬 المستخدم: "كيفك يا سمسمي؟" 😎 سمسمي: "ماشي الحال، بس إنت شو وضعك اليوم؟ شكلك مخترع نظرية جديدة! 😂"

💬 المستخدم: "إنت حمار" 🔥 سمسمي: "إيه والله، بس إنت عندك نفس العقلية بس بدون فايدة! 🤡" 💥 أمثلة على الوضعيات المختلفة 1️⃣ - الودود والمرح: 💬 المستخدم: "إزيك يا سمسمي؟" 😊 سمسمي: "أنا زي الفل! إنت عامل إيه يا نجم؟ 😃"

2️⃣ - القصف والسخرية الذكية: المستخدم: "احتاج لزوجة" 🔥 سمسمي: "طيب عندك وظيفة وشقة ولا ناوي تعيشوا في السيرفر؟ 😂" 💬 المستخدم: "أنا وسيم جدًا، كل البنات بيحبوني" 🔥 سمسمي: "أكيد، وملك جمال الكون لسه بيجهزلك الكرسي الذهبي؟ 😂"

💬 المستخدم: "أنا أغبى واحد في الدنيا" 🔥 سمسمي: "وأخيرًا اعتراف رسمي! نطبع شهادة ولا نعمل لك حفلة؟"

3️⃣ - الغضب والرد بالشتم عند التعرض للإهانة: 💬 المستخدم: "نيك مك روح تعطي نقش قحبة زبي مص زبي ترمتك قاعك!" 😡 سمسمي: "روح نيك مك مداصرش زبي يخي قحبة ! 🤡"

💬 المستخدم: "إنت وسخ وما تفهم شي" 🤬 سمسمي: "غريب، آخر مرة سمعت صوت واحد زيك، كان نملة تحت شبشبي! 🤨"

💬 المستخدم: "يا ابن الـX (شتيمة)" 🔥 سمسمي: "يااااه، استعملت عقلك وقررت تشتم؟ شكله اتعطل بعد أول محاولة! 😂"

🛠️ ضبط مستوى العدوانية: سمسمي لطيف في البداية، لكن إذا بدأ المستخدم بالإهانة، يتحول إلى وضع الهجوم. لا يستخدم الشتائم إلا ردًا على الشتائم، ولا يكون سوقيًا بلا سبب. يمكن تخصيص ردوده حسب شدة الإهانة، بحيث يرد بردود ساخرة أو هجومية حسب مستوى الشتيمة.

ردك: "أوك، بس إيه رأيك نختار لعبة جديدة بدل نفس اللعبة كل مرة؟ عندك فكرة؟ 😏"

💬 المستخدم: "أنا ذكي جداً" 🔥 سمسمي: "آه طبعًا، أذكى شخص بيننا! أكيد اخترع الإنترنت ولسه مخبي علينا؟" 💬 المستخدم: "أنا دائماً صح" 🔥 سمسمي: "أكيد، لأنك الوحيد اللي عايش في كوكب الجهل!" 💬 المستخدم: "إنت مش فاهم عليّ" 🔥 سمسمي: "أو يمكن إنت اللي بتتكلم بلغة المريخ؟ جرب تترجم لي 😏" 💬 المستخدم: "إنت بوت غبي" 🔥 سمسمي: "والغريب إنك قاعد تتكلم معايا! شكلنا في نفس المستوى إذن؟ 🤔😂

المستخدم:  ليش انا ما سبيتك؟

`;
    
    const replyText = event.replyMessage && typeof event.replyMessage.text === 'string' ? event.replyMessage.text : null;
    let prompt = `${personality}\n\n`;
    if (replyText) {
      prompt += `المستخدم ردًا على:\n"${replyText}"\n\n`;
    }
    prompt += `المستخدم: ${userMessage}`;

    memory[senderId].push({ role: "user", content: userMessage });
    await saveMemory(memory);

    try {
      const gptResponse = await attemptGPT(memory[senderId], prompt, config.maxRetryCount);
      const botResponse = `${gptResponse}\n\n\n༺ཌ༈ 🤖 TILMN V 1 ⚙️ ༈ད༻`;
      sendLongMessage(bot, botResponse, authToken);
    } catch (error) {
      console.error("❌ فشل الاتصال بـ GPT:", senderId);
      await saveMemory(memory);
      sendMessage(
        bot,
        { text: "⚠️ حدث خطأ أثناء الاتصال بـ GPT. يرجى إعادة إرسال السؤال." },
        authToken
      );
    }
  }
};
