const { SlashCommandBuilder } = require("discord.js");
const User = require("../Model/userModel");
const Donation = require("../Model/donationModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("manualextraweek")
    .setDescription("Add Paid Week(s) Value To Selected User")
    .addUserOption((option) =>
      option.setName("user").setDescription("Select User").setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("extraweek")
        .setDescription("Add Extra Week(s)")
        .setRequired(true)
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
    const extraweek = interaction.options.getNumber("extraweek");

    User.findOneAndUpdate(
      { id: targettedUser.id },
      { extraWeeks: extraweek },
      { new: true },
      async (err, user) => {
        if (err) {
          interaction.reply("Failed To Update Extra Weeks");
          return;
        }
        if (!user) {
          await interaction.reply(`${targettedUser} Is Not Registered`);
          return;
        }
        await interaction.reply(
          `Successfully Set ${new Intl.NumberFormat()
            .format(extraweek)
            .toString()} As ${targettedUser}'s Extra Weeks`
        );
      }
    );
  },
};
