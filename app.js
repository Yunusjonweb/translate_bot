const TelegramBot = require("node-telegram-bot-api");
const { translate } = require("@vitalets/google-translate-api");
const { TOKEN } = require("./config");
const mongoose = require("./mongoose");
const users = require("./src/Model/users");

// Replace with your Telegram Bot API token

// Create a new bot instance
const bot = new TelegramBot(TOKEN, { polling: true });

mongoose();

// Languages keyboards

let languages = [
  [
    {
      text: "🇺🇿 O'zbekcha",
      callback_data: "uz",
    },
    {
      text: "🇷🇺 Ruscha",
      callback_data: "ru",
    },
  ],
  [
    {
      text: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglizcha",
      callback_data: "eng",
    },
    {
      text: "🇸🇦 Arabcha",
      callback_data: "ar",
    },
  ],
];

let langs = {
  uz: "O'zbekcha",
  ru: "Ruscha",
  eng: "Inglizcha",
  ar: "Arabcha",
};

// Handle incoming messages
bot.on("message", async (msg) => {
  const userId = msg.chat.id;
  const messageId = msg.message_id;
  const message = msg.text;

  let user = await users.findOne({
    id: `${userId}`,
  });

  if (!user) {
    user = await users.create({
      id: `${userId}`,
    });
  }

  if (user.step == 0) {
    let keyboard = {
      inline_keyboard: [...languages],
    };
    await bot.sendMessage(userId, "Qaysi  tildan tarjima qilmoqchisiz", {
      reply_markup: keyboard,
    });
  }

  if (message == "🔙 Ortga qaytish") {
    await users.findOneAndUpdate(
      {
        id: `${userId}`,
      },
      {
        step: 0,
      }
    );
    let keyboard = {
      inline_keyboard: [...languages],
    };
    await bot.sendMessage(userId, "Qaysi  tildan tarjima qilmoqchisiz", {
      reply_markup: keyboard,
    });
    return;
  }

  if (user.step == 2) {
    try {
      // Translate the received message
      const translation = await translate(message, {
        from: user.from,
        to: user.to,
      });

      // Send the translated message back to the user
      bot.sendMessage(userId, translation.text);
    } catch (error) {
      console.error("Translation error:", error);
      bot.sendMessage(
        userId,
        "An error occurred while translating the message."
      );
    }
  }
});

bot.on("callback_query", async (message) => {
  const userId = message.from.id;
  const data = message.data;

  let user = await users.findOne({
    id: userId,
  });

  if (user.step == 0) {
    await users.findOneAndUpdate(
      {
        id: userId,
      },
      {
        step: 1,
        from: data,
      }
    );
    let keyboard = {
      inline_keyboard: [...languages],
    };
    await bot.deleteMessage(userId, message.message.message_id);
    await bot.sendMessage(userId, "Qaysi  tildan tarjima qilmoqchisiz", {
      reply_markup: keyboard,
    });
  } else if (user.step == 1) {
    await users.findOneAndUpdate(
      {
        id: userId,
      },
      {
        step: 2,
        to: data,
      }
    );
    user = await users.findOne({
      id: userId,
    });
    await bot.deleteMessage(userId, message.message.message_id);

    await bot.sendMessage(
      userId,
      `Menga matn tashlang, men uni <b>${langs[user.from]}</b>dan <b>${
        langs[user.to]
      }</b>ga tarjima qilib beraman :)`,
      {
        parse_mode: "HTML",
        reply_markup: {
          resize_keyboard: true,
          keyboard: [
            [
              {
                text: "🔙 Ortga qaytish",
              },
            ],
          ],
        },
      }
    );
  }
});
