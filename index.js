const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const User = require("./Model/userModel");
const Donation = require("./Model/donationModel");
const config = require("./config.js");

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
    const messageRegex = /^\.cl donate [1-9]\d*(?:\s+.*)?$/;
    if (
      message.channel.id === config.donationChannelId &&
      message.content.match(messageRegex)
    ) {
      const user = message.author.id;
      const filter = (m) => m.author.id === config.anigameBotId; //bot id
      const botMessage = await message.channel.awaitMessages({
        filter,
        max: 1,
      });
      if (botMessage.first().embeds[0]) {
        if (botMessage.first().embeds[0].title.startsWith("Success")) {
          const {weeklyDonation} = Donation.findOne({_id: '63fb483ba6fd21c8d67e04c3'});
          const text = botMessage.first().embeds[0].description;
          const regex = /you have donated \*\*([\d,]+)\*\* Gold/;
          const match = await text.match(regex);
          let amount = Number(match[1].replace(/,/g, ""));
          const currentUser = await User.findOne({ id: user.toString() });
          if (!currentUser) {
            message.channel.send(
              "You Donated Into The Clan, Without Registration, Please Use /register, And Ask An Admin To Log Your Donation."
            );
            return;
          }
          let donated = false;
          const previousDonation = currentUser.amount;
          amount += previousDonation;

          if (currentUser.extraWeeks === 0) {
            const extra = Math.floor(
              (amount - weeklyDonation) / weeklyDonation
            );
            if (extra >= 1) {
              await User.findOneAndUpdate(
                { id: user.toString() },
                { $set: { extraWeeks: extra + currentUser.extraWeeks } }
              );
            }
          } else if (currentUser.extraWeeks > 0) {
            const extra = Math.floor(
              amount / (weeklyDonation * (currentUser.extraWeeks + 2))
            );
            if (extra >= 1) {
              await User.findOneAndUpdate(
                { id: user.toString() },
                { $set: { extraWeeks: extra + currentUser.extraWeeks } }
              );
            }
          } else {
            const extra = Math.floor(
              (amount - weeklyDonation) / weeklyDonation
            );
            if (extra >= 1) {
              await User.findOneAndUpdate(
                { id: user.toString() },
                { $set: { extraWeeks: extra } }
              );
            }
          }

          if (amount >= weeklyDonation && currentUser.extraWeeks >= 0) {
            donated = true;
          }

          await User.findOneAndUpdate(
            { id: user.toString() },
            {
              $set: {
                amount,
                donated: donated ? true : false,
              },
            }
          );
          message.channel.send(
            `Successfully Added ${new Intl.NumberFormat().format(
              amount
            )} Gold In Your Donation, Use /info To See`
          );
        } else {
          message.channel.send(
            "Failed To Log Donation, Please Ask An Admin To Log Your Donation."
          );
        }
      } else {
        message.channel.send("Bot Is On Cool Down ...");
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
