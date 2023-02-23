const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks The Selected User")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The Member To Kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason For Kick")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),
  async execute(interaction) {
    const targetUserId = interaction.options.get("user").value;
    const reason =
      interaction.options.get("reason")?.value || "No Reason Provided";
    await interaction.deferReply();
    const targetUser = await interaction.guild.members.fetch(targetUserId);
    if (!targetUser) {
      await interaction.editReply("User Doesn't Exist In This Server");
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply("Imaging Kicking The Server Owner");
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; //User To Be Kicked Role
    const requestUserRolePosition = interaction.member.roles.highest.position; // User Who Is Kicking Role
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Bot Role

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "You Can't Kick That User As They Have Same Or Higher Role Than You"
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "I Can't Kick That User As They Have Same Or Higher Role Than Me"
      );
      return;
    }

    // await targetUser.kick({ reason });
    await interaction.editReply(
      `User ${targetUser} Was Kicked\nReason: ${reason}`
    );
  },
};
