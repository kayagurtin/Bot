const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const STORE_ITEMS = require('../utils/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View items available in the economy store'),

  async execute(interactionOrMessage, args) {
    const embed = new EmbedBuilder()
      .setTitle('🛒 Store')
      .setColor('Blue')
      .setDescription('Items you can purchase with your coins:');

    for (const [key, item] of Object.entries(STORE_ITEMS)) {
      const desc = `Cost: **${item.cost}** coins`;
      embed.addFields({
        name: item.name,
        value: desc,
        inline: false
      });
    }

    embed.setFooter({ text: 'Use `/buy <item>` (or `!buy <item>`) to make a purchase.' });

    if (interactionOrMessage.reply) {
      return interactionOrMessage.reply({ embeds: [embed] });
    }
    return interactionOrMessage.channel.send({ embeds: [embed] });
  }
};