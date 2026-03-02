const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addBalance, getUserProp, setUserProp } = require('../utils/economy');

const WORK_COOLDOWN = 6 * 60 * 60 * 1000; // 6 hours
const MIN_PAY = 50;
const MAX_PAY = 200;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work to earn coins (6h cooldown)'),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.isChatInputCommand;
    const guildId = interactionOrMessage.guild.id;
    const userId = isInteraction ? interactionOrMessage.user.id : interactionOrMessage.author.id;

    const now = Date.now();
    const last = getUserProp(guildId, userId, 'lastWork') || 0;
    if (now - last < WORK_COOLDOWN) {
      const remaining = WORK_COOLDOWN - (now - last);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);
      const embed = new EmbedBuilder()
        .setTitle('Already worked recently')
        .setDescription(`You can work again in **${hours}h ${minutes}m**.`)
        .setColor('DarkRed');
      return isInteraction
        ? interactionOrMessage.reply({ embeds: [embed], ephemeral: true })
        : interactionOrMessage.reply({ embeds: [embed] });
    }

    const pay = Math.floor(Math.random() * (MAX_PAY - MIN_PAY + 1)) + MIN_PAY;
    addBalance(guildId, userId, pay);
    setUserProp(guildId, userId, 'lastWork', now);

    const userMention = isInteraction
      ? `<@${interactionOrMessage.user.id}>`
      : `<@${interactionOrMessage.author.id}>`;
    const embed = new EmbedBuilder()
      .setTitle('Payday!')
      .setDescription(`${userMention} worked and earned **${pay}** coins.`)
      .setColor('Green');
    return isInteraction
      ? interactionOrMessage.reply({ embeds: [embed] })
      : interactionOrMessage.reply({ embeds: [embed] });
  }
};