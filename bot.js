const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");

const app = express();

dotenv.config();
const token = process.env.BOT_TOKEN;

// Create a new Telegram bot instance
const bot = new TelegramBot(token, { polling: false });

// app.use(bodyParser.json());

// Handle incoming messages
bot.on("message", (msg) => {
  // Get the message text
  const text = msg.text;

  // Send a reply message
  bot.sendMessage(
    msg.chat.id,
    `Hello, ${msg.from.first_name}! You said: ${text}`
  );
});

bot.on("command", (cmd) => {
  if (cmd.command === "/hello") {
    bot.sendMessage(
      cmd.message.chat.id,
      `Hello, ${cmd.message.from.first_name}!`
    );
  }
});
