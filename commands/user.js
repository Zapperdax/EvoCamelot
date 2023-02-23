const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Provides Information About The User"),
  async execute(interaction) {
    const user = interaction.user;
    await interaction.reply(`This Command Was Run By ${user}`);
  },
};
