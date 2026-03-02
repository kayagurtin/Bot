const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { removeBalance, getBalance } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('takecoins')
    .setDescription('Take coins from a user (admin only)')
    .addUserOption(opt =>
      opt
        .setName('user')
        .setDescription('The user whose coins to take')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName('amount')
        .setDescription('Number of coins to remove')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.isChatInputCommand;
    let target, amount;
    if (isInteraction) {
      if (!interactionOrMessage.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interactionOrMessage.reply({ content: 'Administrator permission required.', ephemeral: true });
      }
      target = interactionOrMessage.options.getUser('user');
      amount = interactionOrMessage.options.getInteger('amount');
    } else {
      const message = interactionOrMessage;
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('Administrator permission required.');
      }
      target = message.mentions.users.first();
      amount = parseInt(args[1], 10);
    }

    if (!target) {
      return isInteraction
        ? interactionOrMessage.reply({ content: 'Please mention a user.', ephemeral: true })
        : interactionOrMessage.reply('Please mention a user.');
    }
    if (!amount || isNaN(amount) || amount < 1) {
      return isInteraction
        ? interactionOrMessage.reply({ content: 'Please provide a positive amount.', ephemeral: true })
        : interactionOrMessage.reply('Please provide a positive amount.');
    }

    const before = getBalance(interactionOrMessage.guild.id, target.id);
    removeBalance(interactionOrMessage.guild.id, target.id, amount);
    const after = getBalance(interactionOrMessage.guild.id, target.id);

    const embed = new EmbedBuilder()
      .setTitle('Coins Taken')
      .setDescription(`**${amount}** coins removed from <@${target.id}> (was **${before}**, now **${after}**).`)
      .setColor('Blue');
    return isInteraction
      ? interactionOrMessage.reply({ embeds: [embed] })
      : interactionOrMessage.reply({ embeds: [embed] });
  }
};