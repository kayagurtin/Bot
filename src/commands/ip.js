const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ip')
    .setDescription('Display server IP addresses'),

  async execute(interactionOrMessage, args) {
    const message = `Server Ip
IP DrimePVP.minehut.gg
BEDROCK DrimePVP.bedrock.minehut.gg
IP DrimeSteal.minehut.gg
BEDROCK DrimeSteal.bedrock.minehut.gg`;
    if (interactionOrMessage.reply) {
      return interactionOrMessage.reply(message);
    }
    return interactionOrMessage.channel.send(message);
  }
};
