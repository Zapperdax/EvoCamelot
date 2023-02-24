const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const User = require("./Model/userModel");

const token = process.env.BOT_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const eventsPath = path.join(__dirname, "./events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.commands = new Collection();
const commandsPath = path.join(__dirname, "./commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The Command At ${filePath} is Missing Required "Data" Or "Execute" Property`
    );
  }
}

client.on("messageCreate", async (message) => {
  try {
    if (
      message.channel.id === "1077933585908117536" &&
      message.content.startsWith(".cl donate")
    ) {
      const user = message.author.id;
      const filter = (m) => m.author.id === "571027211407196161";
      const botMessage = await message.channel.awaitMessages({
        filter,
        max: 1,
      });
      if (botMessage.first().embeds[0]) {
        if (botMessage.first().embeds[0].title.startsWith("Success")) {
          const amount = message.content.replace(/^\D+/g, "") * 1;
          const currentUser = await User.findOne({ name: user.toString() });
          if (!currentUser) {
            message.channel.send("User Not Found");
            return;
          }
          const previousDonation = currentUser.amount;
          await User.findOneAndUpdate(
            { name: user.toString() },
            { $set: { amount: previousDonation + amount } }
          );
          message.channel.send("Successfully Added");
        } else {
          message.channel.send("Failed To Log");
        }
      } else {
        message.channel.send("Slow Down Please");
      }
    }
  } catch (e) {
    console.error(e);
  }
});

mongoose.set("strictQuery", true);

mongoose.connect(process.env.MONGODB_URL, () => {
  console.log("Database Connected");
  client.login(token);
});
