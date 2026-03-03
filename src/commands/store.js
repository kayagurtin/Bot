const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('store')
    .setDescription('Show the server store link'),

  async execute(interactionOrMessage, args) {
    const message = 'Server Store\n💵https://drimeshop.tebex.io/';
    if (interactionOrMessage.reply) {
      return interactionOrMessage.reply(message);
    }
    return interactionOrMessage.channel.send(message);
  }
};
