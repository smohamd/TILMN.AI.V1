const axios = require('axios');
const { sendMessage } = require('../handles/message');

module.exports = {
  name: "ذكاء",
  description: "دردشة مع GPT 4",
  role: 1,
  author: "𝗬 𝗔 𝗦 𝗦 𝗜 𝗡 𝗘　ツ",

  execute: async function(senderId, args, pageAccessToken, payload = null) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(senderId, { text: "❌ يرجى إدخال سؤال للاستفسار." }, pageAccessToken);
    }
    
    try {
      const response = await sendRequest(prompt);
      console.log(response);
      if (response) {
        return sendMessage(senderId, { text: `✅ 𝐆𝐏𝐓-4 : ${response}` }, pageAccessToken);
      } else {
        return sendMessage(senderId, { text: "🚫 خطأ من الخادم، يرجى المحاولة لاحقًا." }, pageAccessToken);
      }
    } catch (error) {
      return sendMessage(senderId, { text: `❌ خطأ: ${error.message}` }, pageAccessToken);
    }
  }
};

async function sendRequest(prompt) {
  const data = {
    prompt: prompt,
    userId: "#/chat/1741282764981",
    network: true,
    system: "أنت TILMN.AI، بوت فلسطيني ذكي تم تصميمه لمساعدة المستخدمين في الإجابة على الأسئلة وتقديم المعلومات المفيدة.",
    withoutContext: false,  // إزالة حفظ الذاكرة
    stream: false
  };

  const headersConfig = {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; VOX Alpha Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.123 Mobile Safari/537.36",
      "Origin": "https://cht18.aichatosclx.com",
      "X-Requested-With": "pure.lite.browser"
    }
  };

  try {
    const response = await axios.post(
      'https://api.binjie.fun/api/generateStream?refer__1360=n4jxnDBDciit0QNDQD%2FfG7Dyl7OplbgomSbD',
      data,
      headersConfig
    );
    if (response?.data) {
      return response.data;
    } else {
      throw new Error("رد غير متوقع من الخادم.");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
    }
