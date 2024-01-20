const {
  SlashCommandBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const User = require("../Model/userModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unregister")
    .setDescription("Deletes User From The Database")
    .addStringOption((option) =>
      option.setName("userid").setDescription("Paste User ID").setRequired(true)
    ),
  async execute(interaction) {
    const roleName = "RK - VICE-GUILDMASTER";

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

    const targettedUser = interaction.options.getString("userid");

    const confirmButton = new ButtonBuilder()
      .setCustomId("confirm")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setEmoji("⚔️")
      .setStyle(ButtonStyle.Danger);

    const resetEmbed = new EmbedBuilder()
      .setColor("#bb8368")
      .setTitle("Confirmation")
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(
        `Are You Sure You Want To Delete ${"<@" + targettedUser + ">"}?`
      )
      .setFooter({ text: "[Warning] - This Action Cannot Be Undone" });

    console.log(targettedUser);

    const row = new ActionRowBuilder().addComponents(
      confirmButton,
      cancelButton
    );

    try {
      await interaction.reply({
        content: "Are You Sure?",
        embeds: [resetEmbed],
        components: [row],
      });

      const filter = (i) => i.customId === "confirm" || i.customId === "cancel";
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "confirm") {
          if (i.user.id === interaction.user.id) {
            const deletedUser = await User.findOneAndDelete({
              id: targettedUser,
            });
            if (!deletedUser) {
              await i.update({ content: "No User Found" });
              return;
            }
            await i.update({
              content: `Successfully Deleted ${deletedUser.name}`,
            });
          }
        } else if (i.customId === "cancel") {
          await i.update({ content: "Operation Cancelled" });
        }
        collector.stop();
      });

      collector.on("end", async () => {
        await interaction.editReply({ components: [], embeds: [] });
      });
    } catch (e) {
      await interaction.editReply("There Was An Error Executing This Command");
    }
  },
};
