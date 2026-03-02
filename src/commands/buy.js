const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, removeBalance } = require('../utils/economy');

// store definition is shared in utils/store.js
const STORE_ITEMS = require('../utils/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Purchase an item from the store')
    .addStringOption(opt =>
      opt
        .setName('item')
        .setDescription('Which item to buy')
        .setRequired(true)
        .addChoices(
          { name: 'rank', value: 'rank' }
        )
    ),

  async execute(interactionOrMessage, args) {
    let guildId, userId, itemKey, reply, member;
    if (interactionOrMessage.isChatInputCommand) {
      guildId = interactionOrMessage.guild.id;
      userId = interactionOrMessage.user.id;
      itemKey = interactionOrMessage.options.getString('item');
      reply = msg => interactionOrMessage.reply(msg);
      member = interactionOrMessage.member;
    } else {
      const message = interactionOrMessage;
      guildId = message.guild.id;
      userId = message.author.id;
      itemKey = args[1];
      reply = msg => message.reply(msg);
      member = message.member;
    }

    const item = STORE_ITEMS[itemKey];
    if (!item) {
      const msg = 'That item does not exist. Use `/shop` to view available purchases.';
      return reply({ content: msg, ephemeral: true });
    }

    const bal = getBalance(guildId, userId);
    if (bal < item.cost) {
      const embed = new EmbedBuilder()
        .setTitle('Insufficient funds')
        .setDescription(`You need **${item.cost}** coins to buy **${item.name}**, but you only have **${bal}**.`)
        .setColor('DarkRed');
      if (interactionOrMessage.reply) return interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
      return reply({ embeds: [embed] });
    }

    // check if user already has the role for "rank" item
    if (item.roleId && member.roles.cache.has(item.roleId)) {
      return reply({ content: 'You already have the Gold rank.', ephemeral: true });
    }

    // deduct balance
    removeBalance(guildId, userId, item.cost);

    // grant role if applicable
    if (item.roleId) {
      try {
        await member.roles.add(item.roleId);
      } catch (err) {
        console.error('Failed to add role during purchase:', err);
        return reply('Your purchase succeeded but I was unable to assign the role. Please contact an administrator.');
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('Purchase Complete')
      .setDescription(`Thank you for your purchase!\nYou bought **${item.name}** for **${item.cost}** coins.`)
      .setColor('Gold');
    if (interactionOrMessage.reply) return interactionOrMessage.reply({ embeds: [embed] });
    return reply({ embeds: [embed] });
  }
};