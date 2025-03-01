const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/message');

module.exports = {
  name: 'مساعدة',
  description: 'عرض الأوامر المتاحة مع أوصافها',
  role: 1,
  author: 'TILMN.AI ¦ ᎷᏫᎻᎯ ᎷᎬᎠ',

  execute(senderId, args, pageAccessToken) {
    const commandsDir = path.join(__dirname, '../cmds');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map((file) => {
      const command = require(path.join(commandsDir, file));
      return {
        title: ` ${command.name.charAt(0).toUpperCase() + command.name.slice(1)}`,
        description: command.description,
        payload: `${command.name.toUpperCase()}_PAYLOAD`
      };
    });

    const totalCommands = commands.length;
    const commandsPerPage = 8;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    let page = parseInt(args[0], 10);

    if (isNaN(page) || page < 1) page = 1;

    // إذا تم تمرير "all" لعرض جميع الأوامر دفعة واحدة
    if (args[0]?.toLowerCase() === 'all') {
      const helpTextMessage = 
`╭─❍「 قائمة الإبداع 」
│ مرحباً بك في عالمنا الساحر حيث تتراقص الأوامر بألوان الإلهام!
│ إجمالي الأوامر: [ ${totalCommands} ]
│${commands.map((cmd, index) => `
│ ${index + 1}. ${cmd.title}
│    ✦ ${cmd.description}`).join('')}
╰────────────⧕

┌─────⚙️⋆
│  المبدع: TILMN.AI
│  العمر: 18 سنة
└────────────`;
      return sendMessage(senderId, { text: helpTextMessage }, pageAccessToken);
    }

    const startIndex = (page - 1) * commandsPerPage;
    const commandsForPage = commands.slice(startIndex, startIndex + commandsPerPage);

    if (commandsForPage.length === 0) {
      return sendMessage(senderId, {
        text: `❌ عذراً! الصفحة ${page} غير موجودة. يوجد فقط ${totalPages} صفحة متوفرة.`,
      }, pageAccessToken);
    }

    const helpTextMessage = 
`╭─❍「 نافذة الإلهام 」
│ أنت الآن تشاهد الصفحة: [ ${page}/${totalPages} ]
│ مجموع الأوامر: [ ${totalCommands} ]
│${commandsForPage.map((cmd, index) => `
│ ${startIndex + index + 1}. ${cmd.title}
│    ✦ ${cmd.description}`).join('')}
╰────────────⧕

┌─────⚙️⋆
│ للتنقل بين صفحات الأوامر، استخدم: "مساعدة [رقم الصفحة]"
│ أو اكتشف كل جواهر الأوامر بكتابة: "مساعدة all"
└────────────`;
    
    const quickReplies = commandsForPage.map((cmd) => ({
      content_type: "text",
      title: cmd.title.trim(),
      payload: cmd.payload
    }));

    sendMessage(senderId, {
      text: helpTextMessage,
      quick_replies: quickReplies
    }, pageAccessToken);
  }
};
