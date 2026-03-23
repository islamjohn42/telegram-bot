const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf("8228629364:AAF18TEVnvFjLHBVevWhLDVPy8TgvuWU0bo");
const CHANNEL = "@hujayoroff";
async function isJoined(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL, ctx.from.id);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch (err) {
    return false;
  }
}

bot.start(async (ctx) => {
  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(
      "❌ You must join our channel first!",
      Markup.inlineKeyboard([
        [
          Markup.button.url(
            "📢 Join Channel",
            `https://t.me/${CHANNEL.replace("@", "")}`,
          ),
        ],
        [Markup.button.callback("✅ I Joined", "check_join")],
      ]),
    );
  }

  ctx.reply("✅ Welcome! You can use the bot now.");
});

bot.action("check_join", async (ctx) => {
  const joined = await isJoined(ctx);

  if (joined) {
    await ctx.answerCbQuery("✅ Access granted!");
    await ctx.reply("🎉 Now you can use the bot!");
  } else {
    await ctx.answerCbQuery("❌ You didn’t join yet!", { show_alert: true });
  }
});

bot.command("premium", async (ctx) => {
  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply("❌ Join channel first!");
  }

  ctx.reply("🔥 Premium content here!");
});

bot.launch();
console.log("Bot running...");
