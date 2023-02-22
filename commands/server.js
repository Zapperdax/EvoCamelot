const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides Information About The Server"),
  async execute(interaction) {
    await interaction.reply(
      `This Server Is ${interaction.guild.name} And Has ${interaction.guild.memberCount} Members.`
    );
  },
};
