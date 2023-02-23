const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register To Clan"),
  async execute(interaction) {
    await interaction.reply("I'm Registered Into The Clan");
  },
};
