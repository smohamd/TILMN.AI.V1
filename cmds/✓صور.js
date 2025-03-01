const axios = require('axios');
const { sendMessage } = require('../handles/message');

// تخزين الصور لكل مستخدم (مفتاح: senderId)
const userImages = {};

// مصفوفة الكلمات المحظورة (يمكنك إضافة المزيد من الكلمات)
const forbiddenWords = ["xnxx","x.n.x.x","سكس","عريانة","الكلمات"];

module.exports = {
  name: 'صور',
  description: '🤖 البحث عن صور ',
  role: 1,
  author: 'YASSINE',

  async execute(senderId, args, pageAccessToken, payload = null) {
    try {
      // 1) التحقق من الـ payload (إذا جاء من Quick Reply)
      if (payload && typeof payload === 'string') {
        if (payload.startsWith("صور_المزيد_")) {
          const query = payload.replace("صور_المزيد_", "");
          return sendMoreImages(senderId, query, pageAccessToken);
        }
        if (payload === "صور_إلغاء") {
          delete userImages[senderId];
          return sendMessage(senderId, { text: "✅ | تم إلغاء العملية." }, pageAccessToken);
        }
      }

      // 2) إذا لم يكن هناك payload، نقرأ نص البحث
      const query = args.join(' ').trim();
      if (!query) {
        return sendMessage(senderId, { text: "❌ | يرجى إدخال كلمة للبحث عنها!" }, pageAccessToken);
      }

      // التحقق من الكلمات المحظورة
      if (forbiddenWords.some(word => query.toLowerCase().includes(word))) {
          return sendMessage(senderId, { text: "🚫 ¦ لا يمكن البحث هاذا محظور من طرف TILMN.AI \n 🤖 ¦ هدفنا حماية مستخدمين \n  ༺ཌ༈🤖 TILMN V 1 ⚙️ ༈ད༻" }, pageAccessToken);
      }

      // 3) جلب الصور من API خارجي
      const apiUrl = `https://api-tilmn-ai-dz-img.onrender.com/api/images?query=${encodeURIComponent(query)}&count=50`;
      let response;
      try {
        response = await axios.get(apiUrl);
      } catch (error) {
        console.error("❌ خطأ أثناء جلب الصور:", error.message);
        return sendMessage(senderId, { text: "⚠️ | فشل الاتصال بالخادم، حاول مرة أخرى لاحقًا." }, pageAccessToken);
      }

      const images = response?.data?.images;
      if (!Array.isArray(images) || images.length === 0) {
        return sendMessage(senderId, { text: "❌ | لم يتم العثور على صور لكلمة البحث هذه!" }, pageAccessToken);
      }

      // 4) تخزين الصور مؤقتًا في الذاكرة
      userImages[senderId] = {
        query,
        images
      };

      // 5) إرسال أول دفعة (6 صور)
      return sendMoreImages(senderId, query, pageAccessToken);

    } catch (err) {
      console.error("❌ خطأ غير متوقع:", err);
      return sendMessage(senderId, { text: "⚠️ | حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى لاحقًا." }, pageAccessToken);
    }
  }
};

async function sendMoreImages(senderId, query, pageAccessToken) {
  // التحقق من وجود صور للمستخدم
  if (!userImages[senderId] || !userImages[senderId].images || userImages[senderId].images.length === 0) {
    return sendMessage(senderId, { text: "✅ | تم إعطاؤك كل الصور." }, pageAccessToken);
  }

  const batchSize = 6;
  const imagesBatch = userImages[senderId].images.splice(0, batchSize);

  // إرسال كل صورة في رسالة منفصلة
  for (let i = 0; i < imagesBatch.length; i++) {
    const imageUrl = imagesBatch[i];
    await sendMessage(senderId, {
      attachment: {
        type: "image",
        payload: {
          url: imageUrl,
          is_reusable: false
        }
      }
    }, pageAccessToken);

    // تأخير بسيط (1 ثانية) بين إرسال كل صورة
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // تجهيز أزرار سريعة (Quick Replies)
  const quickReplies = [];
  if (userImages[senderId].images.length > 0) {
    quickReplies.push({
      content_type: "text",
      title: " 🔁بحث مزيد",
      payload: `صور_المزيد_${query}`
    });
  }
  quickReplies.push({
    content_type: "text",
    title: "إلغاء ❌",
    payload: "صور_إلغاء"
  });

  // انتظر ثانيتين قبل إرسال رسالة الأزرار
  await new Promise(resolve => setTimeout(resolve, 2000));

  // إرسال الرسالة النصية التي تحتوي على الأزرار
  return sendMessage(senderId, {
    text: "بحث المزيد : لجلب صور اخرة\n إلغاء: لي ايقاف لبحث",
    quick_replies: quickReplies
  }, pageAccessToken);
}