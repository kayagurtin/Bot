const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuildBalances } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top balances in this server'),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.isChatInputCommand;
    const guildId = interactionOrMessage.guild.id;
    const balances = getGuildBalances(guildId);

    if (!balances.length) {
      const msg = 'No economy data found yet.';
      return isInteraction
        ? interactionOrMessage.reply({ content: msg, ephemeral: true })
        : interactionOrMessage.reply(msg);
    }

    const top = balances.slice(0, 10);
    const lines = await Promise.all(top.map(async (entry, idx) => {
      try {
        const user = await interactionOrMessage.client.users.fetch(entry.userId);
        return `**${idx+1}.** <@${user.id}> – **${entry.balance}** coins`;
      } catch {
        return `**${idx+1}.** <@${entry.userId}> – **${entry.balance}** coins`;
      }
    }));

    const embed = new EmbedBuilder()
      .setTitle('💰 Leaderboard')
      .setColor('Gold')
      .setDescription(lines.join('\n'));

    return isInteraction
      ? interactionOrMessage.reply({ embeds: [embed] })
      : interactionOrMessage.channel.send({ embeds: [embed] });
  }
};