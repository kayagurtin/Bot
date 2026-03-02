const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Pay another user some of your coins')
    .addUserOption(opt =>
      opt
        .setName('user')
        .setDescription('Recipient of the coins')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName('amount')
        .setDescription('How many coins to send')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interactionOrMessage, args) {
    let guildId, giverId, receiver, amount, reply;
    if (interactionOrMessage.isChatInputCommand) {
      guildId = interactionOrMessage.guild.id;
      giverId = interactionOrMessage.user.id;
      receiver = interactionOrMessage.options.getUser('user');
      amount = interactionOrMessage.options.getInteger('amount');
      reply = msg => interactionOrMessage.reply(msg);
    } else {
      const message = interactionOrMessage;
      guildId = message.guild.id;
      giverId = message.author.id;
      // args: [user, amount]
      receiver = message.mentions.users.first();
      amount = parseInt(args[1], 10);
      reply = msg => message.reply(msg);
    }

    if (!receiver) {
      return reply({ content: 'You must specify a user to pay.', ephemeral: true });
    }
    if (!amount || isNaN(amount) || amount < 1) {
      return reply({ content: 'You must specify a positive amount of coins.', ephemeral: true });
    }

    if (receiver.id === giverId) {
      return reply({ content: 'You can\'t pay yourself.', ephemeral: true });
    }

    const giverBal = getBalance(guildId, giverId);
    if (giverBal < amount) {
      const embed = new EmbedBuilder()
        .setTitle('Insufficient Funds')
        .setDescription(`You only have **${giverBal}** coins, which isn\'t enough to send **${amount}**.`)
        .setColor('DarkRed');
      if (interactionOrMessage.reply) return interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
      return reply({ embeds: [embed] });
    }

    addBalance(guildId, giverId, -amount);
    addBalance(guildId, receiver.id, amount);

    const newBal = getBalance(guildId, giverId);
    const giverMention = `<@${giverId}>`;
    const receiverMention = `<@${receiver.id}>`;
    const embed = new EmbedBuilder()
      .setTitle('Payment Complete')
      .setDescription(`${giverMention} sent **${amount}** coins to ${receiverMention}.
Your new wallet balance is **${newBal}** coins.`)
      .setColor('Green');
    return reply({ embeds: [embed] });
  }
};
