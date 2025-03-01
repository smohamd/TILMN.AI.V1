const axios = require("axios");
const { sendMessage } = require("../handles/message");

console.log("sendMessage function:", sendMessage);

module.exports = {
  name: "تحويل",
  description: "تحويل النص إلى صوت أو صورة",
  role: 1,
  author: "developer",

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(" ");

    if (!prompt) {
      return sendMessage(senderId, {
        text: `الاستخدام: \n\n• تحويل النص إلى صوت: say [النص]\n• تحويل النص إلى صورة: img [النص]`
      }, pageAccessToken);
    }

    try {
      // توليد الصوت
      const audioUrl = `https://api.joshweb.click/api/aivoice?q=${encodeURIComponent(prompt)}&id=8`;
      console.log("Audio API URL:", audioUrl);

      await sendMessage(senderId, {
        attachment: {
          type: "audio",
          payload: {
            url: audioUrl
          }
        }
      }, pageAccessToken);

      // توليد الصورة
      const imageUrl = `https://i2img.com/api/text2image?q=${encodeURIComponent(prompt)}`;
      console.log("Image API URL:", imageUrl);

      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: imageUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error processing request:", error);
      sendMessage(senderId, {
        text: `حدث خطأ أثناء المعالجة. يرجى المحاولة مرة أخرى لاحقًا.`
      }, pageAccessToken);
    }
  }
};
