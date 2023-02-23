const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies To Ping"),
  async execute(interaction) {
    await interaction.reply("Pong");
  },
};
