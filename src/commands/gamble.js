const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Gamble an amount of your coins')
    .addIntegerOption(opt =>
      opt
        .setName('amount')
        .setDescription('How many coins to gamble')
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

    const bal = getBalance(guildId, userId);
    if (!amount || isNaN(amount) || amount < 1) {
      const msg = 'Please specify a valid amount to gamble.';
      return isInteraction
        ? interactionOrMessage.reply({ content: msg, ephemeral: true })
        : interactionOrMessage.reply(msg);
    }
    if (bal < amount) {
      const msg = `You only have ${bal} coins.`;
      return isInteraction
        ? interactionOrMessage.reply({ content: msg, ephemeral: true })
        : interactionOrMessage.reply(msg);
    }

    const win = Math.random() < 0.5;
    let embed;
    const userMention = isInteraction
      ? `<@${interactionOrMessage.user.id}>`
      : `<@${interactionOrMessage.author.id}>`;
    if (win) {
      addBalance(guildId, userId, amount);
      embed = new EmbedBuilder()
        .setTitle('Gamble Win')
        .setDescription(`${userMention} won **${amount}** coins!`)
        .setColor('Green');
    } else {
      addBalance(guildId, userId, -amount);
      embed = new EmbedBuilder()
        .setTitle('Gamble Loss')
        .setDescription(`${userMention} lost **${amount}** coins.`)
        .setColor('DarkRed');
    }

    return isInteraction
      ? interactionOrMessage.reply({ embeds: [embed] })
      : interactionOrMessage.reply({ embeds: [embed] });
  }
};