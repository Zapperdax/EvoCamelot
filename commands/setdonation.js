const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setdonation")
    .setDescription("Sets Donation Of The User For The Current Week"),
  async execute(interaction) {
    const roleName = "donation-tracker";

    const role = interaction.member.roles.cache.find(
      (r) => r.name === roleName
    );
    if (!role || !interaction.member.roles.cache.has(role.id)) {
      await interaction.reply({
        content: `You Don't Have Permission To Use This Command`,
        ephemeral: true,
      });
      return;
    }

    await interaction.reply("Command Executed");
  },
};
