const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, addBankBalance } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposit coins from wallet into your bank')
    .addIntegerOption(opt =>
      opt
        .setName('amount')
        .setDescription('Amount to deposit')
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

    const wallet = getBalance(guildId, userId);
    if (!amount || isNaN(amount) || amount < 1) {
      const msg = 'Please specify a valid amount to deposit.';
      return isInteraction
        ? interactionOrMessage.reply({ content: msg, ephemeral: true })
        : interactionOrMessage.reply(msg);
    }
    if (wallet < amount) {
      const msg = `You only have ${wallet} coins in your wallet.`;
      return isInteraction
        ? interactionOrMessage.reply({ content: msg, ephemeral: true })
        : interactionOrMessage.reply(msg);
    }

    addBalance(guildId, userId, -amount);
    addBankBalance(guildId, userId, amount);

    const walletAfter = getBalance(guildId, userId);
    const bankAfter = getBankBalance(guildId, userId);
    const embed = new EmbedBuilder()
      .setTitle('Deposit Successful')
      .setDescription(
        `<@${userId}> deposited **${amount}** coins into their bank.` +
        `\nWallet: **${walletAfter}** coins` +
        `\nBank: **${bankAfter}** coins`
      )
      .setColor('Green');
    return isInteraction
      ? interactionOrMessage.reply({ embeds: [embed] })
      : interactionOrMessage.reply({ embeds: [embed] });
  }
};