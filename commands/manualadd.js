const { SlashCommandBuilder } = require("discord.js");
const User = require("../Model/userModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("manualadd")
    .setDescription("Add Donation Value To Selected User")
    .addUserOption((option) =>
      option.setName("user").setDescription("Select User").setRequired(true)
    )
    .addNumberOption((option) =>
      option.setName("amount").setDescription("Add Amount").setRequired(true)
    ),
  async execute(interaction) {
    const roleName = "Admin";

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

    const targettedUser = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");

    User.findOneAndUpdate(
      { id: targettedUser.id },
      { amount },
      { new: true },
      async (err, user) => {
        if (err) {
          interaction.reply("Failed To Update Amount");
          return;
        }
        if (!user) {
          await interaction.reply(`${targettedUser} Is Not Registered`);
          return;
        }
        await interaction.reply(
          `Successfully Placed ${amount.toString()} As ${targettedUser}'s Donation`
        );
      }
    );
  },
};
