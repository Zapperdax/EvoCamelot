const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  PermissionsBitField,
} = require("discord.js");
const User = require("../Model/userModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lb")
    .setDescription("Shows Weekly Contribution Of Everyone In Clan"),
  async execute(interaction) {
    if (
      !interaction.channel
        .permissionsFor(interaction.client.user)
        .has(PermissionsBitField.Flags.ViewChannel)
    ) {
      await interaction.reply({
        content: "I do not have permission to view this channel.",
        ephemeral: true,
      });
      return;
    }
    const donators = await User.find({}).sort({ amount: -1 });

    const itemsPerPage = 10;
    let currentPage = 1;
    const totalPages = Math.ceil(donators.length / itemsPerPage);

    function generateEmbed(page) {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      const embed = new EmbedBuilder()
        .setColor("#bb8368")
        .setTitle("Top Donators")
        .setDescription(`Showing page ${page} of ${totalPages}`);

      for (let i = startIndex; i < endIndex && i < donators.length; i++) {
        embed.addFields({
          name: `#${i + 1}. ${donators[i].name}`,
          value: `Donated: ${donators[i].amount}`,
        });
      }

      return embed;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("⬅️")
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Success)
        .setEmoji("➡️")
        .setDisabled(totalPages === 1)
    );

    const message = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [row],
      fetchReply: true,
    });

    const filter = (interaction) =>
      interaction.user.id === interaction.user.id && interaction.isButton();
    const collector = message.createMessageComponentCollector({
      filter,
      time: 10000,
    });

    const previousButton = row.components[0];
    const nextButton = row.components[1];

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "previous") {
        currentPage--;
      } else if (interaction.customId === "next") {
        currentPage++;
      }

      if (currentPage === 1) {
        previousButton.setDisabled(true);
      } else {
        previousButton.setDisabled(false);
      }

      if (currentPage === totalPages) {
        nextButton.setDisabled(true);
      } else {
        nextButton.setDisabled(false);
      }

      const updatedEmbed = generateEmbed(currentPage);

      await interaction.update({
        embeds: [updatedEmbed],
        components: [row],
      });
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        await message.edit({
          components: [],
        });
      }
    });
  },
};
