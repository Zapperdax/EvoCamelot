const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Yeets The Person")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The Member To Ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason For Ban")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
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
      await interaction.editReply("Imaging Banning The Server Owner");
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; //User To Be Banned Role
    const requestUserRolePosition = interaction.member.roles.highest.position; // User Who Is Banning Role
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Bot Role

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "You Can't Ban That User As They Have Same Or Higher Role Than You"
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "I Can't Ban That User As They Have Same Or Higher Role Than Me"
      );
      return;
    }

    // await targetUser.ban({ reason });
    await interaction.editReply(
      `User ${targetUser} Was Banned\nReason: ${reason}`
    );
  },
};
