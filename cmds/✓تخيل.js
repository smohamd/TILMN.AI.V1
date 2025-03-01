const axios = require('axios');
const { sendMessage } = require('../handles/message');

module.exports = {
  name: 'تخيل',
  description: 'إنشاء صورة بناءً على وصف معين.',
  role: 1,
  author: 'TILMN.AI',
  
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'يرجى إدخال وصف للصورة.\n\nالاستخدام:\nمثال: تخيل قطة أو كلب'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `https://zaikyoo.onrender.com/api/artv1?p=${encodeURIComponent(prompt)}`;
    
    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('حدث خطأ أثناء إنشاء الصورة:', error);
      await sendMessage(senderId, {
        text: 'حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة لاحقًا.'
      }, pageAccessToken);
    }
  }
};
