const axios = require("axios");
const fs = require("fs-extra");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const { sendMessage } = require("../handles/message");

module.exports = {
  name: "شغلي",
  description: "قم بتشغيل الأغنية التي تحب",
  role: 0,
  author: "MOHAMED X ZINO",

  async execute(senderId, args, pageAccessToken) {
    try {
      // **1) التحقق من أن المستخدم أدخل اسم الأغنية**
      const query = args.join(" ").trim();
      if (!query) {
        return sendMessage(senderId, { text: "❌ | يرجى إدخال اسم الأغنية التي تريد تشغيلها!" }, pageAccessToken);
      }

      // **2) البحث عن الأغنية في YouTube**
      sendMessage(senderId, { text: `🎼︙ جارِ إحضار نتائج حول『${query}』` }, pageAccessToken);

      const searchResults = await yts(query);
      if (!searchResults.videos.length) {
        return sendMessage(senderId, { text: "⚠️ | لم يتم العثور على نتائج." }, pageAccessToken);
      }

      const video = searchResults.videos[0];
      return playMusic(senderId, video.url, pageAccessToken);

    } catch (error) {
      console.error('[ERROR]', error);
      sendMessage(senderId, { text: '⚠️ | حدث خطأ أثناء معالجة الأمر.' }, pageAccessToken);
    }
  }
};

// **🔹 تحميل وإرسال الموسيقى**
async function playMusic(senderId, videoUrl, pageAccessToken) {
  try {
    const stream = ytdl(videoUrl, { filter: "audioonly" });
    const fileName = `${senderId}.mp3`;
    const filePath = __dirname + `/cache/${fileName}`;

    stream.pipe(fs.createWriteStream(filePath));

    stream.on('end', async () => {
      if (fs.statSync(filePath).size > 26214400) {
        fs.unlinkSync(filePath);
        return sendMessage(senderId, { text: "⚠️ | تعذر إرسال الملف لأن حجمه أكبر من 25 ميغابايت." }, pageAccessToken);
      }

      const message = {
        text: "✅︙تم تحميل الموسيقى بنجاح!",
        attachment: fs.createReadStream(filePath)
      };

      sendMessage(senderId, message, pageAccessToken, () => {
        fs.unlinkSync(filePath);
      });
    });

  } catch (error) {
    console.error('[ERROR]', error);
    sendMessage(senderId, { text: '⚠️ | حدث خطأ أثناء تحميل الموسيقى.' }, pageAccessToken);
  }
}
