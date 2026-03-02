const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, removeBalance, getBankBalance, addBankBalance } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Withdraw coins from your bank into your wallet')
    .addIntegerOption(opt =>
      opt
        .setName('amount')
        .setDescription('Amount to withdraw')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.isChatInputCommand;
    const guildId = interactionOrMessage.guild.id;
    let userId, amount;
    if (isInteraction) {
      userId = interactionOrMessage.user.id;
      amount = interactionOrMessage.options.getInteger('amount');
    } else {
      const message = interactionOrMessage;
      userId = message.author.id;
      amount = parseInt(args[1], 10);
    }

    const bank = getBankBalance(guildId, userId);
    if (!amount || isNaN(amount) || amount < 1) {
      const msg = 'Please specify a valid amount to withdraw.';
      return isInteraction
        ? interactionOrMessage.reply({ content: msg, ephemeral: true })
        : interactionOrMessage.reply(msg);
    }
    if (bank < amount) {
      const msg = `You only have ${bank} coins in your bank.`;
      return isInteraction
        ? interactionOrMessage.reply({ content: msg, ephemeral: true })
        : interactionOrMessage.reply(msg);
    }

    addBalance(guildId, userId, amount);
    addBankBalance(guildId, userId, -amount);

    const walletAfter = getBalance(guildId, userId);
    const bankAfter = getBankBalance(guildId, userId);
    const embed = new EmbedBuilder()
      .setTitle('Withdrawal Successful')
      .setDescription(
        `<@${userId}> withdrew **${amount}** coins from their bank.` +
        `\nWallet: **${walletAfter}** coins` +
        `\nBank: **${bankAfter}** coins`
      )
      .setColor('Green');
    return isInteraction
      ? interactionOrMessage.reply({ embeds: [embed] })
      : interactionOrMessage.reply({ embeds: [embed] });
  }
};