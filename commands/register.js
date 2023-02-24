const { SlashCommandBuilder } = require("discord.js");
const User = require("../Model/userModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register To Clan"),
  async execute(interaction) {
    await interaction.deferReply();
    const roleName = "The Chosen";

    const role = interaction.member.roles.cache.find(
      (r) => r.name === roleName
    );
    if (!role || !interaction.member.roles.cache.has(role.id)) {
      await interaction.editReply({
        content: `You Don't Have Permission To Use This Command`,
        ephemeral: true,
      });
      return;
    }
    try {
      const user = new User({
        name: interaction.user.id,
      });
      await user.save();
      await interaction.editReply("Successfully Registered Into The Clan");
    } catch (e) {
      if (e.code === 11000) {
        await interaction.editReply("You're Already Registered To The Clan");
      }
    }
  },
};
