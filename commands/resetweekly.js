const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const User = require("../Model/userModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetweekly")
    .setDescription("Resets Everyone's Weekly Donation"),
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
      .setDescription("Are You Sure You Want To Reset Weekly Donation?")
      .setFooter({ text: "[Warning] - This Action Cannot Be Undone" });

    const row = new ActionRowBuilder().addComponents(
      confirmButton,
      cancelButton
    );

    try {
      await interaction.reply({
        content: "Are You Sure You Want To Reset?",
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
            User.updateMany({}, { donated: true }, (err) => {
              if (err) {
                console.error(err);
                return;
              }
            });
            await i.update({
              content: "Successfully Resetted Weekly Donations",
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
      console.error(e);
      await interaction.reply("There Was An Error Executing The Command");
    }
  },
};
