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
    already_joined: "✅ You can now use the bot!",
    join_required: "❌ Please join our channel first to use this bot!",
    joined_success: "✅ Thank you for joining! You can now use the bot.",
    check_button: "✅ Check Membership",
    join_button: "📢 Join Channel",
    buy_command: "❌ This command is not available",
    premium_not_available: "Premium features are currently not available",
    help: "Available commands:\n/start - Start the bot\n/language - Change language\n/help - Show this help message",
    language_changed: "✅ Language changed to English!",
    language_selected: "Language selected",
    not_joined: "❌ You haven't joined the channel yet!",
  },
  ru: {
    start: "Добро пожаловать! Пожалуйста, выберите язык:",
    already_joined: "✅ Теперь вы можете пользоваться ботом!",
    join_required: "❌ Пожалуйста, сначала подпишитесь на наш канал!",
    joined_success:
      "✅ Спасибо за подписку! Теперь вы можете пользоваться ботом.",
    check_button: "✅ Проверить подписку",
    join_button: "📢 Подписаться",
    buy_command: "❌ Эта команда недоступна",
    premium_not_available: "Премиум функции временно недоступны",
    help: "Доступные команды:\n/start - Запустить бота\n/language - Сменить язык\n/help - Показать это сообщение",
    language_changed: "✅ Язык изменен на Русский!",
    language_selected: "Язык выбран",
    not_joined: "❌ Вы еще не подписались на канал!",
  },
  uz: {
    start: "Xush kelibsiz! Iltimos, tilni tanlang:",
    already_joined: "✅ Endi botdan foydalanishingiz mumkin!",
    join_required: "❌ Iltimos, avval kanalga obuna bo‘ling!",
    joined_success:
      "✅ Obuna bo‘lganingiz uchun rahmat! Endi botdan foydalanishingiz mumkin.",
    check_button: "✅ Obunani tekshirish",
    join_button: "📢 Kanalga obuna bo‘lish",
    buy_command: "❌ Bu buyruq mavjud emas",
    premium_not_available: "Premium funksiyalar hozircha mavjud emas",
    help: "Mavjud buyruqlar:\n/start - Botni ishga tushirish\n/language - Tilni o‘zgartirish\n/help - Yordam xabarini ko‘rsatish",
    language_changed: "✅ Til O‘zbek tiliga o‘zgartirildi!",
    language_selected: "Til tanlandi",
    not_joined: "❌ Siz hali kanalga obuna bo‘lmagansiz!",
  },
};

// 🌐 Helper function to get text in user's language
function t(userId, key) {
  const lang = users[userId] || "en";
  return texts[lang][key] || texts.en[key];
}

// ✅ Check if user is a member of the channel
async function isJoined(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL, ctx.from.id);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch (error) {
    console.error("Error checking membership:", error);
    return false;
  }
}

// 🔒 Middleware to check membership for protected commands
async function requireJoin(ctx, next) {
  const joined = await isJoined(ctx);

  if (!joined) {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.url(
          t(ctx.from.id, "join_button"),
          `https://t.me/${CHANNEL.replace("@", "")}`,
        ),
      ],
      [Markup.button.callback(t(ctx.from.id, "check_button"), "check_join")],
    ]);

    await ctx.reply(t(ctx.from.id, "join_required"), keyboard);
    return;
  }

  return next();
}

// 🚀 START command
bot.start(async (ctx) => {
  const userId = ctx.from.id;

  // Check if user already has a language set
  if (!users[userId]) {
    // Show language selection if no language is set
    return ctx.reply(
      "🌍 Choose your language / Tilni tanlang / Выберите язык:",
      Markup.inlineKeyboard([
        [Markup.button.callback("🇺🇸 English", "lang_en")],
        [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
        [Markup.button.callback("🇺🇿 O‘zbek", "lang_uz")],
      ]),
    );
  }

  // User has language set, check membership
  const joined = await isJoined(ctx);

  if (!joined) {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.url(
          t(userId, "join_button"),
          `https://t.me/${CHANNEL.replace("@", "")}`,
        ),
      ],
      [Markup.button.callback(t(userId, "check_button"), "check_join")],
    ]);

    return ctx.reply(t(userId, "join_required"), keyboard);
  }

  await ctx.reply(t(userId, "already_joined"));
  await ctx.reply(t(userId, "help"));
});

// 🌐 Language selection handler
bot.action(/lang_(en|ru|uz)/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = ctx.match[1];

  // Store user's language
  users[userId] = lang;

  await ctx.answerCbQuery(t(userId, "language_selected"));

  // Check membership after language selection
  const joined = await isJoined(ctx);

  if (!joined) {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.url(
          t(userId, "join_button"),
          `https://t.me/${CHANNEL.replace("@", "")}`,
        ),
      ],
      [Markup.button.callback(t(userId, "check_button"), "check_join")],
    ]);

    return ctx.reply(t(userId, "join_required"), keyboard);
  }

  await ctx.reply(t(userId, "language_changed"));
  await ctx.reply(t(userId, "already_joined"));
});

// 🔁 Check join button handler
bot.action("check_join", async (ctx) => {
  const userId = ctx.from.id;
  const joined = await isJoined(ctx);

  if (joined) {
    await ctx.answerCbQuery(t(userId, "joined_success"));
    await ctx.reply(t(userId, "joined_success"));
    await ctx.reply(t(userId, "help"));
  } else {
    await ctx.answerCbQuery(t(userId, "not_joined"), { show_alert: true });
  }
});

// 📝 Language command to change language anytime
bot.command("language", async (ctx) => {
  await ctx.reply(
    "🌍 Choose your language / Tilni tanlang / Выберите язык:",
    Markup.inlineKeyboard([
      [Markup.button.callback("🇺🇸 English", "lang_en")],
      [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
      [Markup.button.callback("🇺🇿 O‘zbek", "lang_uz")],
    ]),
  );
});

// ℹ️ Help command
bot.command("help", requireJoin, async (ctx) => {
  await ctx.reply(t(ctx.from.id, "help"));
});

// ❌ Remove payment-related command
bot.command("buy", requireJoin, async (ctx) => {
  await ctx.reply(t(ctx.from.id, "premium_not_available"));
});

// 🏠 Home/Start alias
bot.command("home", async (ctx) => {
  const userId = ctx.from.id;

  if (!users[userId]) {
    return bot.telegram.sendMessage(ctx.chat.id, "Please use /start to begin");
  }

  const joined = await isJoined(ctx);

  if (!joined) {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.url(
          t(userId, "join_button"),
          `https://t.me/${CHANNEL.replace("@", "")}`,
        ),
      ],
      [Markup.button.callback(t(userId, "check_button"), "check_join")],
    ]);

    return ctx.reply(t(userId, "join_required"), keyboard);
  }

  await ctx.reply(t(userId, "already_joined"));
  await ctx.reply(t(userId, "help"));
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply("An error occurred. Please try again later.");
});

// Launch bot
bot
  .launch()
  .then(() => {
    console.log("🤖 Bot is running...");
    console.log(`📢 Channel: ${CHANNEL}`);
  })
  .catch((err) => {
    console.error("Failed to launch bot:", err);
  });

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
