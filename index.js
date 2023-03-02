const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const User = require("./Model/userModel");
const Donation = require("./Model/donationModel");

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
      message.channel.id === "813262057331884032" &&
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
          const { weeklyDonation } = await Donation.findOne({
            _id: "63fb483ba6fd21c8d67e04c3",
          });
          const amount = message.content.replace(/^\D+/g, "") * 1;
          const currentUser = await User.findOne({ id: user.toString() });
          let donated = false;
          if (!currentUser) {
            message.channel.send(
              "You Donated Into The Clan, Without Registration, Please Use /register, And Ask An Admin To Log Your Donation."
            );
            return;
          }
          const previousDonation = currentUser.amount;
          if (previousDonation + amount >= weeklyDonation) {
            donated = true;
          }
          console.log(weeklyDonation);
          await User.findOneAndUpdate(
            { id: user.toString() },
            {
              $set: {
                amount: previousDonation + amount,
                donated: donated ? true : false,
              },
            }
          );
          message.channel.send("Successful Addition Of Donation");
        } else {
          message.channel.send(
            "Failed To Log Donation, Please Ask An Admin To Log Your Donation."
          );
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
