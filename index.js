require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL = process.env.CHANNEL;

// 🌍 Language storage (simple memory, later you can use DB)
const users = {};

// 🌐 Translations
const texts = {
  en: {
    start: "Welcome! Please choose your language:",
    join: "❌ Please join our channel first!",
    joined: "✅ You can now use the bot!",
    check: "✅ I Joined",
    buy: "💳 Buy Premium",
    success: "✅ Payment successful!",
  },
  ru: {
    start: "Добро пожаловать! Выберите язык:",
    join: "❌ Сначала подпишитесь на канал!",
    joined: "✅ Теперь вы можете пользоваться ботом!",
    check: "✅ Я подписался",
    buy: "💳 Купить премиум",
    success: "✅ Оплата прошла успешно!",
  },
  uz: {
    start: "Xush kelibsiz! Tilni tanlang:",
    join: "❌ Avval kanalga obuna bo‘ling!",
    joined: "✅ Endi botdan foydalanishingiz mumkin!",
    check: "✅ Obuna bo‘ldim",
    buy: "💳 Premium sotib olish",
    success: "✅ To‘lov muvaffaqiyatli!",
  },
};

// 🌐 Helper
function t(userId, key) {
  const lang = users[userId] || "en";
  return texts[lang][key];
}

// ✅ Check join
async function isJoined(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL, ctx.from.id);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch {
    return false;
  }
}

// 🚀 START
bot.start((ctx) => {
  ctx.reply(
    "🌍 Choose language / Tilni tanlang / Выберите язык",
    Markup.inlineKeyboard([
      [Markup.button.callback("🇺🇸 English", "lang_en")],
      [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
      [Markup.button.callback("🇺🇿 O‘zbek", "lang_uz")],
    ]),
  );
});

// 🌐 Language selection
bot.action(/lang_(.+)/, async (ctx) => {
  const lang = ctx.match[1];
  users[ctx.from.id] = lang;

  await ctx.answerCbQuery("Language selected");

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(
      t(ctx.from.id, "join"),
      Markup.inlineKeyboard([
        [
          Markup.button.url(
            "📢 Join",
            `https://t.me/${CHANNEL.replace("@", "")}`,
          ),
        ],
        [Markup.button.callback(t(ctx.from.id, "check"), "check_join")],
      ]),
    );
  }

  ctx.reply(t(ctx.from.id, "joined"));
});

// 🔁 Check join
bot.action("check_join", async (ctx) => {
  const joined = await isJoined(ctx);

  if (joined) {
    await ctx.answerCbQuery("✅");
    await ctx.reply(t(ctx.from.id, "joined"));
  } else {
    await ctx.answerCbQuery("❌", { show_alert: true });
  }
});

// 💳 Buy command
bot.command("buy", async (ctx) => {
  if (!(await isJoined(ctx))) {
    return ctx.reply(t(ctx.from.id, "join"));
  }

  await ctx.replyWithInvoice({
    title: "Premium",
    description: "Unlock premium",
    payload: "premium_payload",
    provider_token: process.env.PROVIDER_TOKEN,
    currency: "USD",
    prices: [{ label: "Premium", amount: 500 }],
  });
});

// ✅ Payment
bot.on("successful_payment", (ctx) => {
  ctx.reply(t(ctx.from.id, "success"));
});

bot.launch();
console.log("Bot running...");
