 const fs = require("fs-extra");
const gTTS = require("gtts");
const { sendMessage } = require("../handles/message");

module.exports = {
  name: "قول",
  description: "يقوم بتحويل النص إلى كلام وإرساله كملف صوتي",
  role: 0,
  author: "MOHAMED X ZINO",

  async execute(senderId, args, pageAccessToken) {
    try {
      const text = args.join(" ").trim();
      if (!text) {
        return sendMessage(senderId, { text: "❌ | يرجى إدخال النص الذي تريد تحويله إلى صوت!" }, pageAccessToken);
      }

      sendMessage(senderId, { text: "🔄︙جارٍ تحويل النص إلى صوت..." }, pageAccessToken);

      const fileName = `${senderId}.mp3`;
      const filePath = __dirname + `/cache/${fileName}`;
      const tts = new gTTS(text, "ar");

      tts.save(filePath, async (err) => {
        if (err) {
          console.error("[ERROR]", err);
          return sendMessage(senderId, { text: "⚠️ | حدث خطأ أثناء تحويل النص إلى صوت." }, pageAccessToken);
        }

        sendMessage(senderId, {
          text: "✅︙تم تحويل النص إلى صوت!",
          attachment: fs.createReadStream(filePath)
        }, pageAccessToken, () => {
          fs.unlinkSync(filePath);
        });
      });

    } catch (error) {
      console.error("[ERROR]", error);
      sendMessage(senderId, { text: "⚠️ | حدث خطأ أثناء معالجة الأمر." }, pageAccessToken);
    }
  }
};
