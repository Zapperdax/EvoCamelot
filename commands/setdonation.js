const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setdonation")
    .setDescription("Sets Donation Of The User For The Current Week"),
  async execute(interaction) {
    await interaction.reply("I'm Under Construction");
  },
};
