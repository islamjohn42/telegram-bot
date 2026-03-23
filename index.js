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
    payment_button: "💳 Premium Access",
    payment_details: "💳 *Payment Details:*\n\n💳 *Card:* `0000000000000001`\n👤 *Name:* ISLOMBEK NUMANOV\n💰 *Price:* 4,990 RUB / 559,000 UZS\n\n📸 *Please make the payment and send a photo of the receipt.*\n_(PDF files are not accepted. Screenshot only.)_\n\n✅ After payment, send the screenshot here and wait for confirmation.",
    help: "📋 *Available Features:*\n\n✅ Join channel to unlock access\n💳 Get premium access for exclusive content\n🌍 Change language anytime\n\n*Commands:*\nUse the buttons below to navigate\n\n📱 *Contact:* @hujayoroffit",
    language_changed: "✅ Language changed to English!",
    language_selected: "Language selected",
    not_joined: "❌ You haven't joined the channel yet. Please join first!",
    language_button: "🌍 Change Language",
    premium_button: "💳 Premium Access",
    help_button: "ℹ️ Help",
    menu_button: "🏠 Main Menu",
    send_receipt: "📸 Please send your payment receipt (screenshot)",
    receipt_received: "✅ Receipt received! Our team will verify your payment shortly.",
  },
  ru: {
    start: "Добро пожаловать! Пожалуйста, выберите язык:",
    now_can_use: "✅ Теперь вы можете пользоваться ботом!",
    join_required: "❌ Пожалуйста, сначала подпишитесь на наш канал!",
    joined_success: "✅ Вы успешно подписались!",
    check_button: "✅ Я подписался",
    join_button: "📢 Подписаться на канал",
    payment_button: "💳 Premium доступ",
    payment_details: "💳 *Платежные реквизиты:*\n\n💳 *Карта:* `0000000000000001`\n👤 *Имя:* ISLOMBEK NUMANOV\n💰 *Цена:* 4,990 RUB / 559,000 UZS\n\n📸 *Пожалуйста, оплатите и отправьте фото чека.*\n_(PDF файлы не принимаются. Только скриншот.)_\n\n✅ После оплаты отправьте скриншот сюда и дождитесь подтверждения.",
    help: "📋 *Доступные функции:*\n\n✅ Подпишитесь на канал для доступа\n💳 Получите premium доступ для эксклюзивного контента\n🌍 Измените язык в любое время\n\n*Команды:*\nИспользуйте кнопки ниже для навигации\n\n📱 *Контакты:* @hujayoroffit",
    language_changed: "✅ Язык изменен на Русский!",
    language_selected: "Язык выбран",
    not_joined: "❌ Вы еще не подписались на канал. Пожалуйста, подпишитесь!",
    language_button: "🌍 Сменить язык",
    premium_button: "💳 Premium доступ",
    help_button: "ℹ️ Помощь",
    menu_button: "🏠 Главное меню",
    send_receipt: "📸 Пожалуйста, отправьте чек об оплате (скриншот)",
    receipt_received: "✅ Чек получен! Наша команда проверит вашу оплату в ближайшее время.",
  },
  uz: {
    start: "Xush kelibsiz! Iltimos, tilni tanlang:",
    now_can_use: "✅ Endi botdan foydalanishingiz mumkin!",
    join_required: "❌ Iltimos, avval kanalga obuna bo‘ling!",
    joined_success: "✅ Siz muvaffaqiyatli obuna bo‘ldingiz!",
    check_button: "✅ Obuna bo‘ldim",
    join_button: "📢 Kanalga obuna bo‘lish",
    payment_button: "💳 Premium olish",
    payment_details: "💳 *To‘lov ma'lumotlari:*\n\n💳 *Karta:* `0000000000000001`\n👤 *Ism:* ISLOMBEK NUMANOV\n💰 *Narx:* 4,990 RUB / 559,000 UZS\n\n📸 *Iltimos, to‘lovni amalga oshiring va chek fotosuratini yuboring.*\n_(PDF fayllar qabul qilinmaydi. Faqat skrinshot.)_\n\n✅ To‘lovdan so‘ng skrinshotni shu yerga yuboring va tasdiqlanishni kuting.",
    help: "📋 *Mavjud funksiyalar:*\n\n✅ Foydalanish uchun kanalga obuna bo‘ling\n💳 Eksklyuziv kontent uchun premium a'zolik oling\n🌍 Tilni istalgan vaqtda o‘zgartiring\n\n*Buyruqlar:*\nNavigatsiya uchun pastdagi tugmalardan foydalaning\n\n📱 *Kontakt:* @hujayoroffit",
    language_changed: "✅ Til O‘zbek tiliga o‘zgartirildi!",
    language_selected: "Til tanlandi",
    not_joined:
      "❌ Siz hali kanalga obuna bo‘lmagansiz. Iltimos, avval obuna bo‘ling!",
    language_button: "🌍 Tilni o‘zgartirish",
    premium_button: "💳 Premium olish",
    help_button: "ℹ️ Yordam",
    menu_button: "🏠 Asosiy menyu",
    send_receipt: "📸 Iltimos, to‘lov chekini yuboring (skrinshot)",
    receipt_received: "✅ Chek qabul qilindi! Tez orada xodimlarimiz to‘lovni tekshirishadi.",
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

// Show payment details with menu button
function getPaymentKeyboard(userId) {
  return Markup.inlineKeyboard([
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
    try {
      await ctx.editMessageText(t(userId, "join_required"), {
        reply_markup: getJoinKeyboard(userId).reply_markup
      });
    } catch (error) {
      // If can't edit, send new message
      await ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
    }
    return;
  }

  // If already joined, show main menu
  try {
    await ctx.editMessageText(t(userId, "help"), {
      parse_mode: "Markdown",
      reply_markup: getMainMenuKeyboard(userId).reply_markup
    });
  } catch (error) {
    // If can't edit, send new message
    await ctx.reply(t(userId, "help"), {
      parse_mode: "Markdown",
      ...getMainMenuKeyboard(userId),
    });
  }
});

// 🔁 Check join button handler
bot.action("check_join", async (ctx) => {
  const userId = ctx.from.id;
  const joined = await isJoined(ctx);

  if (joined) {
    await ctx.answerCbQuery(t(userId, "joined_success"));
    // Update message to show main menu
    try {
      await ctx.editMessageText(t(userId, "help"), {
        parse_mode: "Markdown",
        reply_markup: getMainMenuKeyboard(userId).reply_markup
      });
    } catch (error) {
      // If can't edit, send new message
      await ctx.reply(t(userId, "help"), {
        parse_mode: "Markdown",
        ...getMainMenuKeyboard(userId),
      });
    }
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
    try {
      await ctx.editMessageText(t(userId, "join_required"), {
        reply_markup: getJoinKeyboard(userId).reply_markup
      });
    } catch (error) {
      await ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
    }
    return;
  }
  
  try {
    await ctx.editMessageText(t(userId, "help"), {
      parse_mode: "Markdown",
      reply_markup: getMainMenuKeyboard(userId).reply_markup
    });
  } catch (error) {
    await ctx.reply(t(userId, "help"), {
      parse_mode: "Markdown",
      ...getMainMenuKeyboard(userId),
    });
  }
});

// Show language menu
bot.action("show_language", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.answerCbQuery();
  
  try {
    await ctx.editMessageText("🌍 " + t(userId, "language_button") + ":", {
      reply_markup: getLanguageKeyboard().reply_markup
    });
  } catch (error) {
    await ctx.reply("🌍 " + t(userId, "language_button") + ":", getLanguageKeyboard());
  }
});

// Show premium menu with payment details
bot.action("show_premium", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.answerCbQuery();
  
  const paymentText = t(userId, "payment_details");
  
  try {
    await ctx.editMessageText(paymentText, {
      parse_mode: "Markdown",
      reply_markup: getPaymentKeyboard(userId).reply_markup
    });
  } catch (error) {
    await ctx.reply(paymentText, {
      parse_mode: "Markdown",
      ...getPaymentKeyboard(userId),
    });
  }
});

// Show help
bot.action("show_help", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.answerCbQuery();
  
  try {
    await ctx.editMessageText(t(userId, "help"), {
      parse_mode: "Markdown",
      reply_markup: getMainMenuKeyboard(userId).reply_markup
    });
  } catch (error) {
    // If can't edit the message (e.g., it's a new message), send a new one
    await ctx.reply(t(userId, "help"), {
      parse_mode: "Markdown",
      ...getMainMenuKeyboard(userId),
    });
  }
});

// Handle payment receipt (photos)
bot.on("photo", async (ctx) => {
  const userId = ctx.from.id;
  
  // Check if user has selected language
  if (!users[userId]) {
    return ctx.reply("Please use /start first to set your language.", getLanguageKeyboard());
  }
  
  // Check if user is a member of the channel
  const joined = await isJoined(ctx);
  if (!joined) {
    return ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
  }
  
  // Get the largest photo
  const photo = ctx.message.photo[ctx.message.photo.length - 1];
  const fileId = photo.file_id;
  
  // Here you can forward the photo to an admin or save it
  // For now, just acknowledge receipt
  await ctx.reply(t(userId, "receipt_received"));
  
  // Optional: Forward to admin channel or group
  // await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, fileId, {
  //   caption: `New payment receipt from @${ctx.from.username || ctx.from.first_name}\nUser ID: ${userId}`,
  //   reply_markup: Markup.inlineKeyboard([
  //     [Markup.button.callback("✅ Approve", `approve_${userId}`)],
  //     [Markup.button.callback("❌ Reject", `reject_${userId}`)]
  //   ])
  // });
  
  console.log(`📸 Receipt received from user ${userId} (${ctx.from.first_name})`);
});

// Handle document (PDF) files - reject them
bot.on("document", async (ctx) => {
  const userId = ctx.from.id;
  
  // Check if user has selected language
  if (!users[userId]) {
    return ctx.reply("Please use /start first to set your language.", getLanguageKeyboard());
  }
  
  // Check if user is a member of the channel
  const joined = await isJoined(ctx);
  if (!joined) {
    return ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
  }
  
  // Reject PDF files
  const document = ctx.message.document;
  if (document.mime_type === "application/pdf") {
    await ctx.reply("❌ " + t(userId, "payment_details").split("\n")[0] + "\n\n❌ PDF files are not accepted. Please send a screenshot (photo) instead.");
  } else {
    // If it's another type of document, also reject
    await ctx.reply("❌ Please send a photo (screenshot) of your payment receipt, not a document file.");
  }
});

// 💳 Premium command - kept for compatibility but shows payment details
bot.command("premium", async (ctx) => {
  const userId = ctx.from.id;

  if (!users[userId]) {
    return ctx.reply("Please use /start first to set your language.", getLanguageKeyboard());
  }

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(t(userId, "join_required"), getJoinKeyboard(userId));
  }

  await ctx.reply(t(userId, "payment_details"), {
    parse_mode: "Markdown",
    ...getPaymentKeyboard(userId),
  });
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