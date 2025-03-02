const axios = require('axios');

module.exports.config = {
  name: "ذكاء",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝗬 𝗔 𝗦 𝗦 𝗜 𝗡 𝗘　ツ",
  description: "دردشة معا نموذج GPT 4 ",
  commandCategory: "دردشة",
  usages: "[السؤال]",
  cooldowns: 5
};

async function sendRequest(prompt) {
  const data = {
    prompt: prompt,
    userId: "#/chat/1735674979151",
    network: true,
    system: "أنت TILMN.AI، بوت فلسطيني ذكي تم تصميمه لمساعدة المستخدمين في الإجابة على الأسئلة وتقديم المعلومات المفيدة.", // برومبت النظام
    withoutContext: false, // عدم حفظ الذاكرة
    stream: false
  };

  const headersConfig = {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; VOX Alpha Build/O11019) AppleWebKit/537.36 (KHTML, مثل Gecko) Version/4.0 Chrome/126.0.6478.123 Mobile Safari/537.36",
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

module.exports.run = async ({ api, event, args }) => {
  const { threadID: tDy, messageID: mDy } = event;
  const prompt = args.join(" ");
  
  if (!prompt) {
    return api.sendMessage("❌ يرجى إدخال سؤال للاستفسار.", tDy, mDy);
  }

  try {
    const response = await sendRequest(prompt);
    console.log(response);
    
    if (response) {
      return api.sendMessage(`✅ 𝐆𝐏𝐓-4 : ${response}`, tDy, mDy);
    } else {
      return api.sendMessage("🚫 خطأ من الخادم، يرجى المحاولة لاحقًا.", tDy, mDy);
    }
  } catch (error) {
    return api.sendMessage(`❌ خطأ: ${error.message}`, tDy, mDy);
  }
};
