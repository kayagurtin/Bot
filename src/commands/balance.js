const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, getBankBalance } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your wallet and bank balances (yours or another user)')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to check')
    ),

  async execute(interactionOrMessage, args) {
    let guildId, target;
    const giveReply = (content) => {
      if (interactionOrMessage.reply) return interactionOrMessage.reply(content);
      return interactionOrMessage.channel.send(content);
    };

    if (interactionOrMessage.isChatInputCommand) {
      guildId = interactionOrMessage.guild.id;
      target = interactionOrMessage.options.getUser('user') || interactionOrMessage.user;
    } else {
      const message = interactionOrMessage;
      guildId = message.guild.id;
      if (message.mentions.users.size) {
        target = message.mentions.users.first();
      } else {
        target = message.author;
      }
    }
    const bal = getBalance(guildId, target.id);
    const bank = getBankBalance(guildId, target.id);

    const embed = new EmbedBuilder()
      .setTitle('Balance')
      .setDescription(`${target} currently has:`)
      .addFields(
        { name: 'Wallet', value: `**${bal}** coins`, inline: true },
        { name: 'Bank', value: `**${bank}** coins`, inline: true }
      )
      .setColor('Gold');

    return giveReply({ embeds: [embed] });
  }
};
