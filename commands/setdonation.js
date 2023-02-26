const { SlashCommandBuilder } = require("discord.js");
const Donation = require("../Model/donationModel");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("setdonation")
    .setDescription("Sets Donation Of The User For The Current Week")
    .addStringOption((option) =>
      option
        .setName("value")
        .setDescription("Set Weekly Donation")
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

    const weeklyDonation = interaction.options.getString("value");
    Donation.findOneAndUpdate(
      { _id: "63fb483ba6fd21c8d67e04c3" },
      { weeklyDonation },
      { upsert: true, new: true },
      async (err) => {
        if (err) {
          await interaction.reply("Failed To Set Weekly Donation");
          return;
        }
        await interaction.reply(
          `Amount Set Successfully To ${weeklyDonation.toString()}`
        );
      }
    );
  },
};
