const { sendMessage } = require("../handles/message");

// قائمة شاملة لجميع الدول (العربية والأجنبية) مع روابط أعلامها
const countries = [
  { country: "أفغانستان", image: "https://flagcdn.com/w320/af.png" },
  { country: "جزر آلاند", image: "https://flagcdn.com/w320/ax.png" },
  { country: "ألبانيا", image: "https://flagcdn.com/w320/al.png" },
  { country: "الجزائر", image: "https://flagcdn.com/w320/dz.png" },
  { country: "ساموا الأمريكية", image: "https://flagcdn.com/w320/as.png" },
  { country: "أندورا", image: "https://flagcdn.com/w320/ad.png" },
  { country: "أنغولا", image: "https://flagcdn.com/w320/ao.png" },
  { country: "أنغيلا", image: "https://flagcdn.com/w320/ai.png" },
  { country: "أنتيغوا وباربودا", image: "https://flagcdn.com/w320/ag.png" },
  { country: "الأرجنتين", image: "https://flagcdn.com/w320/ar.png" },
  { country: "أرمينيا", image: "https://flagcdn.com/w320/am.png" },
  { country: "أروبا", image: "https://flagcdn.com/w320/aw.png" },
  { country: "أستراليا", image: "https://flagcdn.com/w320/au.png" },
  { country: "النمسا", image: "https://flagcdn.com/w320/at.png" },
  { country: "أذربيجان", image: "https://flagcdn.com/w320/az.png" },
  { country: "الباهاماس", image: "https://flagcdn.com/w320/bs.png" },
  { country: "البحرين", image: "https://flagcdn.com/w320/bh.png" },
  { country: "بنغلاديش", image: "https://flagcdn.com/w320/bd.png" },
  { country: "بربادوس", image: "https://flagcdn.com/w320/bb.png" },
  { country: "بيلاروس", image: "https://flagcdn.com/w320/by.png" },
  { country: "بلجيكا", image: "https://flagcdn.com/w320/be.png" },
  { country: "بيليز", image: "https://flagcdn.com/w320/bz.png" },
  { country: "بنين", image: "https://flagcdn.com/w320/bj.png" },
  { country: "بوتان", image: "https://flagcdn.com/w320/bt.png" },
  { country: "بوليفيا", image: "https://flagcdn.com/w320/bo.png" },
  { country: "البوسنة والهرسك", image: "https://flagcdn.com/w320/ba.png" },
  { country: "بوتسوانا", image: "https://flagcdn.com/w320/bw.png" },
  { country: "البرازيل", image: "https://flagcdn.com/w320/br.png" },
  { country: "بروني", image: "https://flagcdn.com/w320/bn.png" },
  { country: "بلغاريا", image: "https://flagcdn.com/w320/bg.png" },
  { country: "بوركينا فاسو", image: "https://flagcdn.com/w320/bf.png" },
  { country: "بوروندي", image: "https://flagcdn.com/w320/bi.png" },
  { country: "كمبوديا", image: "https://flagcdn.com/w320/kh.png" },
  { country: "الكاميرون", image: "https://flagcdn.com/w320/cm.png" },
  { country: "كندا", image: "https://flagcdn.com/w320/ca.png" },
  { country: "الرأس الأخضر", image: "https://flagcdn.com/w320/cv.png" },
  { country: "تشاد", image: "https://flagcdn.com/w320/td.png" },
  { country: "تشيلي", image: "https://flagcdn.com/w320/cl.png" },
  { country: "الصين", image: "https://flagcdn.com/w320/cn.png" },
  { country: "كولومبيا", image: "https://flagcdn.com/w320/co.png" },
  { country: "جزر القمر", image: "https://flagcdn.com/w320/km.png" },
  { country: "الكونغو (برازافيل)", image: "https://flagcdn.com/w320/cg.png" },
  { country: "كوستاريكا", image: "https://flagcdn.com/w320/cr.png" },
  { country: "كرواتيا", image: "https://flagcdn.com/w320/hr.png" },
  { country: "كوبا", image: "https://flagcdn.com/w320/cu.png" },
  { country: "قبرص", image: "https://flagcdn.com/w320/cy.png" },
  { country: "التشيك", image: "https://flagcdn.com/w320/cz.png" },
  { country: "الدنمارك", image: "https://flagcdn.com/w320/dk.png" },
  { country: "جيبوتي", image: "https://flagcdn.com/w320/dj.png" },
  { country: "دومينيكا", image: "https://flagcdn.com/w320/dm.png" },
  { country: "الجمهورية الدومينيكية", image: "https://flagcdn.com/w320/do.png" },
  { country: "الإكوادور", image: "https://flagcdn.com/w320/ec.png" },
  { country: "مصر", image: "https://flagcdn.com/w320/eg.png" },
  { country: "السلفادور", image: "https://flagcdn.com/w320/sv.png" },
  { country: "غينيا الاستوائية", image: "https://flagcdn.com/w320/gq.png" },
  { country: "إريتريا", image: "https://flagcdn.com/w320/er.png" },
  { country: "إستونيا", image: "https://flagcdn.com/w320/ee.png" },
  { country: "إثيوبيا", image: "https://flagcdn.com/w320/et.png" },
  { country: "فيجي", image: "https://flagcdn.com/w320/fj.png" },
  { country: "فنلندا", image: "https://flagcdn.com/w320/fi.png" },
  { country: "فرنسا", image: "https://flagcdn.com/w320/fr.png" },
  { country: "الغابون", image: "https://flagcdn.com/w320/ga.png" },
  { country: "غامبيا", image: "https://flagcdn.com/w320/gm.png" },
  { country: "جورجيا", image: "https://flagcdn.com/w320/ge.png" },
  { country: "ألمانيا", image: "https://flagcdn.com/w320/de.png" },
  { country: "غانا", image: "https://flagcdn.com/w320/gh.png" },
  { country: "اليونان", image: "https://flagcdn.com/w320/gr.png" },
  { country: "غرينادا", image: "https://flagcdn.com/w320/gd.png" },
  { country: "غواتيمالا", image: "https://flagcdn.com/w320/gt.png" },
  { country: "غينيا", image: "https://flagcdn.com/w320/gn.png" },
  { country: "غينيا بيساو", image: "https://flagcdn.com/w320/gw.png" },
  { country: "غيانا", image: "https://flagcdn.com/w320/gy.png" },
  { country: "هايتي", image: "https://flagcdn.com/w320/ht.png" },
  { country: "الفاتيكان", image: "https://flagcdn.com/w320/va.png" },
  { country: "هندوراس", image: "https://flagcdn.com/w320/hn.png" },
  { country: "المجر", image: "https://flagcdn.com/w320/hu.png" },
  { country: "آيسلندا", image: "https://flagcdn.com/w320/is.png" },
  { country: "الهند", image: "https://flagcdn.com/w320/in.png" },
  { country: "إندونيسيا", image: "https://flagcdn.com/w320/id.png" },
  { country: "إيران", image: "https://flagcdn.com/w320/ir.png" },
  { country: "العراق", image: "https://flagcdn.com/w320/iq.png" },
  { country: "أيرلندا", image: "https://flagcdn.com/w320/ie.png" },
  { country: "إسرائيل", image: "https://flagcdn.com/w320/il.png" },
  { country: "إيطاليا", image: "https://flagcdn.com/w320/it.png" },
  { country: "جامايكا", image: "https://flagcdn.com/w320/jm.png" },
  { country: "اليابان", image: "https://flagcdn.com/w320/jp.png" },
  { country: "الأردن", image: "https://flagcdn.com/w320/jo.png" },
  { country: "كازاخستان", image: "https://flagcdn.com/w320/kz.png" },
  { country: "كينيا", image: "https://flagcdn.com/w320/ke.png" },
  { country: "كيريباس", image: "https://flagcdn.com/w320/ki.png" },
  { country: "الكويت", image: "https://flagcdn.com/w320/kw.png" },
  { country: "قيرغيزستان", image: "https://flagcdn.com/w320/kg.png" },
  { country: "لاوس", image: "https://flagcdn.com/w320/la.png" },
  { country: "لاتفيا", image: "https://flagcdn.com/w320/lv.png" },
  { country: "لبنان", image: "https://flagcdn.com/w320/lb.png" },
  { country: "ليسوتو", image: "https://flagcdn.com/w320/ls.png" },
  { country: "ليبيريا", image: "https://flagcdn.com/w320/lr.png" },
  { country: "ليبيا", image: "https://flagcdn.com/w320/ly.png" },
  { country: "ليختنشتاين", image: "https://flagcdn.com/w320/li.png" },
  { country: "ليتوانيا", image: "https://flagcdn.com/w320/lt.png" },
  { country: "لوكسمبورغ", image: "https://flagcdn.com/w320/lu.png" },
  { country: "مقدونيا الشمالية", image: "https://flagcdn.com/w320/mk.png" },
  { country: "مدغشقر", image: "https://flagcdn.com/w320/mg.png" },
  { country: "مالاوي", image: "https://flagcdn.com/w320/mw.png" },
  { country: "ماليزيا", image: "https://flagcdn.com/w320/my.png" },
  { country: "المالديف", image: "https://flagcdn.com/w320/mv.png" },
  { country: "مالي", image: "https://flagcdn.com/w320/ml.png" },
  { country: "مالطا", image: "https://flagcdn.com/w320/mt.png" },
  { country: "جزر مارشال", image: "https://flagcdn.com/w320/mh.png" },
  { country: "موريتانيا", image: "https://flagcdn.com/w320/mr.png" },
  { country: "موريشيوس", image: "https://flagcdn.com/w320/mu.png" },
  { country: "المكسيك", image: "https://flagcdn.com/w320/mx.png" },
  { country: "ميكرونيزيا", image: "https://flagcdn.com/w320/fm.png" },
  { country: "مولدوفا", image: "https://flagcdn.com/w320/md.png" },
  { country: "موناكو", image: "https://flagcdn.com/w320/mc.png" },
  { country: "منغوليا", image: "https://flagcdn.com/w320/mn.png" },
  { country: "الجبل الأسود", image: "https://flagcdn.com/w320/me.png" },
  { country: "المغرب", image: "https://flagcdn.com/w320/ma.png" },
  { country: "موزمبيق", image: "https://flagcdn.com/w320/mz.png" },
  { country: "ميانمار", image: "https://flagcdn.com/w320/mm.png" },
  { country: "ناميبيا", image: "https://flagcdn.com/w320/na.png" },
  { country: "ناورو", image: "https://flagcdn.com/w320/nr.png" },
  { country: "نيبال", image: "https://flagcdn.com/w320/np.png" },
  { country: "هولندا", image: "https://flagcdn.com/w320/nl.png" },
  { country: "نيوزيلندا", image: "https://flagcdn.com/w320/nz.png" },
  { country: "نيكاراغوا", image: "https://flagcdn.com/w320/ni.png" },
  { country: "النيجر", image: "https://flagcdn.com/w320/ne.png" },
  { country: "نيجيريا", image: "https://flagcdn.com/w320/ng.png" },
  { country: "كوريا الشمالية", image: "https://flagcdn.com/w320/kp.png" },
  { country: "النرويج", image: "https://flagcdn.com/w320/no.png" },
  { country: "عمان", image: "https://flagcdn.com/w320/om.png" },
  { country: "باكستان", image: "https://flagcdn.com/w320/pk.png" },
  { country: "بالاو", image: "https://flagcdn.com/w320/pw.png" },
  { country: "فلسطين", image: "https://flagcdn.com/w320/ps.png" },
  { country: "بنما", image: "https://flagcdn.com/w320/pa.png" },
  { country: "بابوا غينيا الجديدة", image: "https://flagcdn.com/w320/pg.png" },
  { country: "باراغواي", image: "https://flagcdn.com/w320/py.png" },
  { country: "بيرو", image: "https://flagcdn.com/w320/pe.png" },
  { country: "الفلبين", image: "https://flagcdn.com/w320/ph.png" },
  { country: "بولندا", image: "https://flagcdn.com/w320/pl.png" },
  { country: "البرتغال", image: "https://flagcdn.com/w320/pt.png" },
  { country: "قطر", image: "https://flagcdn.com/w320/qa.png" },
  { country: "رومانيا", image: "https://flagcdn.com/w320/ro.png" },
  { country: "روسيا", image: "https://flagcdn.com/w320/ru.png" },
  { country: "رواندا", image: "https://flagcdn.com/w320/rw.png" },
  { country: "سانت كيتس ونيفيس", image: "https://flagcdn.com/w320/kn.png" },
  { country: "سانت لوسيا", image: "https://flagcdn.com/w320/lc.png" },
  { country: "سانت فنسنت والغرينادين", image: "https://flagcdn.com/w320/vc.png" },
  { country: "ساموا", image: "https://flagcdn.com/w320/ws.png" },
  { country: "سان مارينو", image: "https://flagcdn.com/w320/sm.png" },
  { country: "ساو تومي وبرينسيب", image: "https://flagcdn.com/w320/st.png" },
  { country: "المملكة العربية السعودية", image: "https://flagcdn.com/w320/sa.png" },
  { country: "السنغال", image: "https://flagcdn.com/w320/sn.png" },
  { country: "صربيا", image: "https://flagcdn.com/w320/rs.png" },
  { country: "سيشل", image: "https://flagcdn.com/w320/sc.png" },
  { country: "سيرا ليون", image: "https://flagcdn.com/w320/sl.png" },
  { country: "سنغافورة", image: "https://flagcdn.com/w320/sg.png" },
  { country: "سلوفاكيا", image: "https://flagcdn.com/w320/sk.png" },
  { country: "سلوفينيا", image: "https://flagcdn.com/w320/si.png" },
  { country: "جزر سليمان", image: "https://flagcdn.com/w320/sb.png" },
  { country: "الصومال", image: "https://flagcdn.com/w320/so.png" },
  { country: "جنوب أفريقيا", image: "https://flagcdn.com/w320/za.png" },
  { country: "كوريا الجنوبية", image: "https://flagcdn.com/w320/kr.png" },
  { country: "جنوب السودان", image: "https://flagcdn.com/w320/ss.png" },
  { country: "إسبانيا", image: "https://flagcdn.com/w320/es.png" },
  { country: "سريلانكا", image: "https://flagcdn.com/w320/lk.png" },
  { country: "السودان", image: "https://flagcdn.com/w320/sd.png" },
  { country: "سورينام", image: "https://flagcdn.com/w320/sr.png" },
  { country: "السويد", image: "https://flagcdn.com/w320/se.png" },
  { country: "سويسرا", image: "https://flagcdn.com/w320/ch.png" },
  { country: "سوريا", image: "https://flagcdn.com/w320/sy.png" },
  { country: "طاجيكستان", image: "https://flagcdn.com/w320/tj.png" },
  { country: "تنزانيا", image: "https://flagcdn.com/w320/tz.png" },
  { country: "تايلاند", image: "https://flagcdn.com/w320/th.png" },
  { country: "تيمور الشرقية", image: "https://flagcdn.com/w320/tl.png" },
  { country: "توغو", image: "https://flagcdn.com/w320/tg.png" },
  { country: "تونغا", image: "https://flagcdn.com/w320/to.png" },
  { country: "ترينيداد وتوباغو", image: "https://flagcdn.com/w320/tt.png" },
  { country: "تونس", image: "https://flagcdn.com/w320/tn.png" },
  { country: "تركيا", image: "https://flagcdn.com/w320/tr.png" },
  { country: "تركمانستان", image: "https://flagcdn.com/w320/tm.png" },
  { country: "توفالو", image: "https://flagcdn.com/w320/tv.png" },
  { country: "أوغندا", image: "https://flagcdn.com/w320/ug.png" },
  { country: "أوكرانيا", image: "https://flagcdn.com/w320/ua.png" },
  { country: "الإمارات العربية المتحدة", image: "https://flagcdn.com/w320/ae.png" },
  { country: "المملكة المتحدة", image: "https://flagcdn.com/w320/gb.png" },
  { country: "الولايات المتحدة", image: "https://flagcdn.com/w320/us.png" },
  { country: "أوروجواي", image: "https://flagcdn.com/w320/uy.png" },
  { country: "أوزبكستان", image: "https://flagcdn.com/w320/uz.png" },
  { country: "فانواتو", image: "https://flagcdn.com/w320/vu.png" },
  { country: "فنزويلا", image: "https://flagcdn.com/w320/ve.png" },
  { country: "فيتنام", image: "https://flagcdn.com/w320/vn.png" },
  { country: "اليمن", image: "https://flagcdn.com/w320/ye.png" },
  { country: "زامبيا", image: "https://flagcdn.com/w320/zm.png" },
  { country: "زيمبابوي", image: "https://flagcdn.com/w320/zw.png" }
];

module.exports = {
  name: "اعلام",
  description: "لعبة تخمين اسم الدولة من خلال صورة العلم باستخدام أزرار اقتراح",
  role: 1,
  author: "MOHAMED X ZINO",

  async execute(senderId, args, pageAccessToken, payload = null) {
    // التحقق من payload (إذا ضغط المستخدم على أحد أزرار الإجابة)
    if (payload && payload.startsWith("flag_answer|")) {
      const parts = payload.split("|");
      const correctAnswer = parts[1];
      const selectedAnswer = parts[2];
      // عند الإجابة، لا تُرسل أي أزرار إضافية (أي تُنهي اللعبة)
      if (selectedAnswer === correctAnswer) {
        return sendMessage(senderId, { text: "🎉 احسنت، اجابتك صحيحة!" }, pageAccessToken);
      } else {
        return sendMessage(senderId, { text: "❌ خطأ! حاول مجدد!" }, pageAccessToken);
      }
    }

    // بدء لعبة جديدة: اختيار دولة عشوائية كإجابة صحيحة
    const correctCountry = countries[Math.floor(Math.random() * countries.length)];

    // اختيار خيارين خاطئين عشوائيين
    const incorrectOptions = countries.filter(c => c.country !== correctCountry.country);
    incorrectOptions.sort(() => Math.random() - 0.5);
    const chosenIncorrect = incorrectOptions.slice(0, 2);

    // جمع الخيارات وخلطها عشوائيًا
    let options = [correctCountry.country, chosenIncorrect[0].country, chosenIncorrect[1].country];
    options.sort(() => Math.random() - 0.5);

    // إعداد أزرار الاقتراح (postback buttons) بحيث تبقى ثابتة مع النص
    const buttons = options.map(option => ({
      type: "postback",
      title: option,
      payload: `flag_answer|${correctCountry.country}|${option}`
    }));

    // إرسال صورة العلم أولاً في رسالة منفصلة
    sendMessage(senderId, {
      attachment: {
        type: "image",
        payload: {
          url: correctCountry.image,
          is_reusable: true
        }
      }
    }, pageAccessToken, () => {
      // بعد إرسال الصورة، إرسال رسالة زرّات ثابتة مع النص "اختر اسم الدولة:"
      sendMessage(senderId, {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: "🤔 ما اسم هذا العلم؟",
            buttons: buttons
          }
        }
      }, pageAccessToken);
    });
  }
};
