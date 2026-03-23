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
    help: "📋 *Available Features:*\n\n✅ Join channel to unlock access\n💳 Get premium access for exclusive content\n🌍 Change language anytime\n\n*Commands:*\nUse the buttons below to navigate",
    language_changed: "✅ Language changed to English!",
    language_selected: "Language selected",
    not_joined: "❌ You haven't joined the channel yet. Please join first!",
    language_button: "🌍 Change Language",
    premium_button: "💳 Premium Access",
    help_button: "ℹ️ Help",
    menu_button: "🏠 Main Menu",
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
    help: "📋 *Доступные функции:*\n\n✅ Подпишитесь на канал для доступа\n💳 Получите premium доступ для эксклюзивного контента\n🌍 Измените язык в любое время\n\n*Команды:*\nИспользуйте кнопки ниже для навигации",
    language_changed: "✅ Язык изменен на Русский!",
    language_selected: "Язык выбран",
    not_joined: "❌ Вы еще не подписались на канал. Пожалуйста, подпишитесь!",
    language_button: "🌍 Сменить язык",
    premium_button: "💳 Premium доступ",
    help_button: "ℹ️ Помощь",
    menu_button: "🏠 Главное меню",
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
    help: "📋 *Mavjud funksiyalar:*\n\n✅ Foydalanish uchun kanalga obuna bo‘ling\n💳 Eksklyuziv kontent uchun premium a'zolik oling\n🌍 Tilni istalgan vaqtda o‘zgartiring\n\n*Buyruqlar:*\nNavigatsiya uchun pastdagi tugmalardan foydalaning",
    language_changed: "✅ Til O‘zbek tiliga o‘zgartirildi!",
    language_selected: "Til tanlandi",
    not_joined:
      "❌ Siz hali kanalga obuna bo‘lmagansiz. Iltimos, avval obuna bo‘ling!",
    language_button: "🌍 Tilni o‘zgartirish",
    premium_button: "💳 Premium olish",
    help_button: "ℹ️ Yordam",
    menu_button: "🏠 Asosiy menyu",
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

// Show payment button with menu button
function getPaymentKeyboard(userId) {
  return Markup.inlineKeyboard([
    [Markup.button.url(t(userId, "payment_button"), t(userId, "payment_link"))],
    [Markup.button.callback(t(userId, "menu_button"), "main_menu")],
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

// Show main menu keyboard with all options
function getMainMenuKeyboard(userId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t(userId, "premium_button"), "show_premium"),
      Markup.button.callback(t(userId, "language_button"), "show_language"),
    ],
    [Markup.button.callback(t(userId, "help_button"), "show_help")],
  ]);
}

// Show language selection keyboard
function getLanguageKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🇺🇸 English", "lang_en")],
    [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
    [Markup.button.callback("🇺🇿 O‘zbek", "lang_uz")],
    [Markup.button.callback("🏠 Back to Menu", "main_menu")],
  ]);
}

// 🚀 START command
bot.start(async (ctx) => {
  const userId = ctx.from.id;

  // Step 1: Always show language selection first
  if (!users[userId]) {
    return ctx.reply(
      "🌍 " + texts.en.start,
      getLanguageKeyboard()
    );
  }

  // Step 2: After language selected, check channel membership
  const joined = await isJoined(ctx);

  if (!joined) {
    // Show join button if not joined
    return ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
  }

  // Step 3: If joined, show main menu
  await ctx.reply(t(userId, "now_can_use"));
  await ctx.reply(t(userId, "help"), {
    parse_mode: "Markdown",
    ...getMainMenuKeyboard(userId),
  });
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
    // Update message to show join button
    await ctx.editMessageText(t(userId, "join_required"), {
      reply_markup: getJoinKeyboard(userId).reply_markup
    });
    return;
  }

  // If already joined, show main menu
  await ctx.editMessageText(t(userId, "help"), {
    parse_mode: "Markdown",
    reply_markup: getMainMenuKeyboard(userId).reply_markup
  });
});

// 🔁 Check join button handler
bot.action("check_join", async (ctx) => {
  const userId = ctx.from.id;
  const joined = await isJoined(ctx);

  if (joined) {
    await ctx.answerCbQuery(t(userId, "joined_success"));
    // Update message to show main menu
    await ctx.editMessageText(t(userId, "help"), {
      parse_mode: "Markdown",
      reply_markup: getMainMenuKeyboard(userId).reply_markup
    });
  } else {
    await ctx.answerCbQuery(t(userId, "not_joined"), { show_alert: true });
  }
});

// Main menu action
bot.action("main_menu", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.answerCbQuery();
  
  const joined = await isJoined(ctx);
  
  if (!joined) {
    await ctx.editMessageText(t(userId, "join_required"), {
      reply_markup: getJoinKeyboard(userId).reply_markup
    });
    return;
  }
  
  await ctx.editMessageText(t(userId, "help"), {
    parse_mode: "Markdown",
    reply_markup: getMainMenuKeyboard(userId).reply_markup
  });
});

// Show language menu
bot.action("show_language", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.answerCbQuery();
  await ctx.editMessageText("🌍 " + t(userId, "language_button") + ":", {
    reply_markup: getLanguageKeyboard().reply_markup
  });
});

// Show premium menu
bot.action("show_premium", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.answerCbQuery();
  await ctx.editMessageText("🔓 " + t(userId, "payment_button") + ":", {
    reply_markup: getPaymentKeyboard(userId).reply_markup
  });
});

// Show help
bot.action("show_help", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.answerCbQuery();
  await ctx.editMessageText(t(userId, "help"), {
    parse_mode: "Markdown",
    reply_markup: getMainMenuKeyboard(userId).reply_markup
  });
});

// 💳 Premium command - kept for compatibility but shows menu
bot.command("premium", async (ctx) => {
  const userId = ctx.from.id;

  if (!users[userId]) {
    return ctx.reply("Please use /start first to set your language.", getLanguageKeyboard());
  }

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
  }

  await ctx.reply("🔓 " + t(userId, "payment_button") + ":", getPaymentKeyboard(userId));
});

// ℹ️ Help command - kept for compatibility but shows menu
bot.command("help", async (ctx) => {
  const userId = ctx.from.id;

  if (!users[userId]) {
    return ctx.reply("Please use /start first to set your language.", getLanguageKeyboard());
  }

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
  }

  await ctx.reply(t(userId, "help"), {
    parse_mode: "Markdown",
    ...getMainMenuKeyboard(userId),
  });
});

// 📝 Language command - kept for compatibility
bot.command("language", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.reply(
    "🌍 Choose your language / Tilni tanlang / Выберите язык:",
    getLanguageKeyboard()
  );
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply("An error occurred. Please try again later.").catch(console.error);
});

// Launch bot
bot
  .launch()
  .then(() => {
    console.log("🤖 Bot is running...");
    console.log(`📢 Channel: ${CHANNEL}`);
    console.log(`💡 Use buttons to navigate - no need to type commands!`);
  })
  .catch((err) => {
    console.error("Failed to launch bot:", err);
  });

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));