const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong'),
  async execute(interactionOrMessage, args) {
    if (interactionOrMessage.reply) {
      // message or interaction
      return interactionOrMessage.reply('pong');
    }
    // fallback
    return interactionOrMessage.channel.send('pong');
  }
};
