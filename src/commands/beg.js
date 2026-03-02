const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addBalance, getUserProp, setUserProp } = require('../utils/economy');

const BEG_COOLDOWN = 60 * 60 * 1000; // 1 hour
const MIN_GAIN = 10;
const MAX_GAIN = 100;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beg')
    .setDescription('Beg for coins (hourly)'),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.isChatInputCommand;
    const guildId = interactionOrMessage.guild.id;
    const userId = isInteraction ? interactionOrMessage.user.id : interactionOrMessage.author.id;

    const now = Date.now();
    const last = getUserProp(guildId, userId, 'lastBeg') || 0;
    if (now - last < BEG_COOLDOWN) {
      const remaining = BEG_COOLDOWN - (now - last);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);
      const embed = new EmbedBuilder()
        .setTitle('Hold on')
        .setDescription(`You can beg again in **${hours}h ${minutes}m**.`)
        .setColor('DarkRed');
      if (isInteraction) return interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
      return interactionOrMessage.reply({ embeds: [embed] });
    }

    const amount = Math.floor(Math.random() * (MAX_GAIN - MIN_GAIN + 1)) + MIN_GAIN;
    addBalance(guildId, userId, amount);
    setUserProp(guildId, userId, 'lastBeg', now);

    const userMention = isInteraction
      ? `<@${interactionOrMessage.user.id}>`
      : `<@${interactionOrMessage.author.id}>`;
    const embed = new EmbedBuilder()
      .setTitle('You begged for coins')
      .setDescription(`${userMention}, someone took pity on you and gave you **${amount}** coins!`)
      .setColor('Green');

    if (isInteraction) return interactionOrMessage.reply({ embeds: [embed] });
    return interactionOrMessage.reply({ embeds: [embed] });
  }
};