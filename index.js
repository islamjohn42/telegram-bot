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
    now_can_use: "✅ You can now use the bot!",
    join_required: "❌ Please join our channel first!",
    joined_success: "✅ You have successfully joined!",
    check_button: "✅ I Joined",
    join_button: "📢 Join Channel",
    payment_button: "💳 Buy Premium Access",
    payment_link: "https://islamjohn42.github.io/hujayoroff/",
    help: "Available commands:\n/start - Restart bot\n/language - Change language\n/premium - Get premium access\n/help - Show this help",
    language_changed: "✅ Language changed to English!",
    language_selected: "Language selected",
    not_joined: "❌ You haven't joined the channel yet. Please join first!",
    language_button: "🌍 Change Language",
    premium_button: "💳 Get Premium",
    help_button: "ℹ️ Help",
    main_menu: "Main Menu:",
  },
  ru: {
    start: "Добро пожаловать! Пожалуйста, выберите язык:",
    now_can_use: "✅ Теперь вы можете пользоваться ботом!",
    join_required: "❌ Пожалуйста, сначала подпишитесь на наш канал!",
    joined_success: "✅ Вы успешно подписались!",
    check_button: "✅ Я подписался",
    join_button: "📢 Подписаться на канал",
    payment_button: "💳 Купить Premium доступ",
    payment_link: "https://islamjohn42.github.io/hujayoroff/",
    help: "Доступные команды:\n/start - Перезапустить бота\n/language - Сменить язык\n/premium - Получить premium доступ\n/help - Показать помощь",
    language_changed: "✅ Язык изменен на Русский!",
    language_selected: "Язык выбран",
    not_joined: "❌ Вы еще не подписались на канал. Пожалуйста, подпишитесь!",
    language_button: "🌍 Сменить язык",
    premium_button: "💳 Получить Premium",
    help_button: "ℹ️ Помощь",
    main_menu: "Главное меню:",
  },
  uz: {
    start: "Xush kelibsiz! Iltimos, tilni tanlang:",
    now_can_use: "✅ Endi botdan foydalanishingiz mumkin!",
    join_required: "❌ Iltimos, avval kanalga obuna bo‘ling!",
    joined_success: "✅ Siz muvaffaqiyatli obuna bo‘ldingiz!",
    check_button: "✅ Obuna bo‘ldim",
    join_button: "📢 Kanalga obuna bo‘lish",
    payment_button: "💳 Premium a'zolik olish",
    payment_link: "https://islamjohn42.github.io/hujayoroff/",
    help: "Mavjud buyruqlar:\n/start - Botni qayta ishga tushirish\n/language - Tilni o‘zgartirish\n/premium - Premium a'zolik olish\n/help - Yordam",
    language_changed: "✅ Til O‘zbek tiliga o‘zgartirildi!",
    language_selected: "Til tanlandi",
    not_joined:
      "❌ Siz hali kanalga obuna bo‘lmagansiz. Iltimos, avval obuna bo‘ling!",
    language_button: "🌍 Tilni o‘zgartirish",
    premium_button: "💳 Premium olish",
    help_button: "ℹ️ Yordam",
    main_menu: "Asosiy menyu:",
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

// Show payment button
function getPaymentKeyboard(userId) {
  return Markup.inlineKeyboard([
    [Markup.button.url(t(userId, "payment_button"), t(userId, "payment_link"))],
  ]);
}

// Show join channel keyboard
function getJoinKeyboard(userId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.url(
        t(userId, "join_button"),
        `https://t.me/${CHANNEL.replace("@", "")}`,
      ),
    ],
    [Markup.button.callback(t(userId, "check_button"), "check_join")],
  ]);
}

// Show main menu keyboard
function getMainMenuKeyboard(userId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(userId, "language_button"), "show_language")],
    [Markup.button.callback(t(userId, "premium_button"), "show_premium")],
    [Markup.button.callback(t(userId, "help_button"), "show_help")],
  ]);
}

// 🚀 START command - exact flow
bot.start(async (ctx) => {
  const userId = ctx.from.id;

  // Step 1: Always show language selection first
  if (!users[userId]) {
    return ctx.reply(
      "🌍 " + texts.en.start + "\n\n🇺🇿 Tilni tanlang\n🇷🇺 Выберите язык",
      Markup.inlineKeyboard([
        [Markup.button.callback("🇺🇸 English", "lang_en")],
        [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
        [Markup.button.callback("🇺🇿 O‘zbek", "lang_uz")],
      ]),
    );
  }

  // Step 2: After language selected, check channel membership
  const joined = await isJoined(ctx);

  if (!joined) {
    // Show join button if not joined
    return ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
  }

  // Step 3: If joined, show "now you can use" message and payment button
  await ctx.reply(t(userId, "now_can_use"));
  await ctx.reply(
    "🔓 " + t(userId, "payment_button") + ":",
    getPaymentKeyboard(userId),
  );
  await ctx.reply(t(userId, "main_menu"), getMainMenuKeyboard(userId));
});

// 🌐 Language selection handler
bot.action(/lang_(en|ru|uz)/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = ctx.match[1];

  // Store user's language
  users[userId] = lang;

  await ctx.answerCbQuery(t(userId, "language_selected"));

  // After language selection, check membership
  const joined = await isJoined(ctx);

  if (!joined) {
    // Show join button if not joined
    return ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
  }

  // If already joined, show success message and payment button
  await ctx.reply(t(userId, "now_can_use"));
  await ctx.reply(
    "🔓 " + t(userId, "payment_button") + ":",
    getPaymentKeyboard(userId),
  );
  await ctx.reply(t(userId, "main_menu"), getMainMenuKeyboard(userId));
});

// 🔁 Check join button handler
bot.action("check_join", async (ctx) => {
  const userId = ctx.from.id;
  const joined = await isJoined(ctx);

  if (joined) {
    await ctx.answerCbQuery(t(userId, "joined_success"));
    // Show "now you can use" message and payment button
    await ctx.reply(t(userId, "now_can_use"));
    await ctx.reply(
      "🔓 " + t(userId, "payment_button") + ":",
      getPaymentKeyboard(userId),
    );
    await ctx.reply(t(userId, "main_menu"), getMainMenuKeyboard(userId));
  } else {
    await ctx.answerCbQuery(t(userId, "not_joined"), { show_alert: true });
  }
});

// Main menu actions
bot.action("show_language", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.editMessageText(t(userId, "start"));
  await ctx.editMessageReplyMarkup({
    inline_keyboard: [
      [Markup.button.callback("🇺🇸 English", "lang_en")],
      [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
      [Markup.button.callback("🇺🇿 O‘zbek", "lang_uz")],
    ]
  });
});

bot.action("show_premium", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.editMessageText("🔓 " + t(userId, "payment_button") + ":");
  await ctx.editMessageReplyMarkup(getPaymentKeyboard(userId));
});

bot.action("show_help", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.editMessageText(t(userId, "help"));
  await ctx.editMessageReplyMarkup(getMainMenuKeyboard(userId));
});

// 📝 Language command to change language anytime
bot.command("language", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.reply(
    "🌍 Choose your language / Tilni tanlang / Выберите язык:",
    Markup.inlineKeyboard([
      [Markup.button.callback("🇺🇸 English", "lang_en")],
      [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
      [Markup.button.callback("🇺🇿 O‘zbek", "lang_uz")],
    ]),
  );
});

// 💳 Premium command - shows payment button directly (checks membership first)
bot.command("premium", async (ctx) => {
  const userId = ctx.from.id;

  if (!users[userId]) {
    return ctx.reply("Please use /start first to set your language.");
  }

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
  }

  await ctx.reply(
    "🔓 " + t(userId, "payment_button") + ":",
    getPaymentKeyboard(userId),
  );
});

// ℹ️ Help command
bot.command("help", async (ctx) => {
  const userId = ctx.from.id;

  if (!users[userId]) {
    return ctx.reply("Please use /start first to set your language.");
  }

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
  }

  await ctx.reply(t(userId, "main_menu"), getMainMenuKeyboard(userId));
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
