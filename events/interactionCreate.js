const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No Command Matching ${interaction.commandName} Was Found`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (e) {
      console.error(`Error Executing ${interaction.commandName}`);
      console.error(e);
    }
  },
};
