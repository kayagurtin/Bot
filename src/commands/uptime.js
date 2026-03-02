const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Shows how long the bot has been running'),
  async execute(interactionOrMessage, args) {
    const uptime = process.uptime().toFixed(0);
    const reply = `Uptime: ${uptime}s`;
    if (interactionOrMessage.reply) {
      return interactionOrMessage.reply(reply);
    }
    return interactionOrMessage.channel.send(reply);
  }
};
