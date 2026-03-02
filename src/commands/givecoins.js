const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { addBalance, getBalance } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('givecoins')
    .setDescription('Grant or remove coins from a member (admin only)')
    .addUserOption(opt =>
      opt
        .setName('user')
        .setDescription('The user to modify')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName('amount')
        .setDescription('Positive to give, negative to take')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interactionOrMessage, args) {
    // permission check helper
    const hasAdmin = (member) => {
      return member.permissions && member.permissions.has(PermissionsBitField.Flags.Administrator);
    };

    let guildId, target, amount, reply, actor, member;
    if (interactionOrMessage.isChatInputCommand) {
      // slash
      if (!hasAdmin(interactionOrMessage.member)) {
        return interactionOrMessage.reply({ content: 'You need Administrator permission to use this command.', ephemeral: true });
      }
      guildId = interactionOrMessage.guild.id;
      target = interactionOrMessage.options.getUser('user');
      amount = interactionOrMessage.options.getInteger('amount');
      actor = interactionOrMessage.user;
      member = interactionOrMessage.guild.members.cache.get(target.id);
      reply = msg => interactionOrMessage.reply(msg);
    } else {
      const message = interactionOrMessage;
      if (!hasAdmin(message.member)) {
        return message.reply('You need Administrator permission to use this command.');
      }
      guildId = message.guild.id;
      target = message.mentions.users.first();
      amount = parseInt(args[1], 10);
      actor = message.author;
      member = message.guild.members.cache.get(target?.id);
      reply = msg => message.reply(msg);
    }

    if (!target) return reply('Please specify a user.');
    if (!amount || isNaN(amount)) return reply('Please provide a valid integer amount.');

    const newBal = addBalance(guildId, target.id, amount);

    const embed = new EmbedBuilder()
      .setTitle('Balance Updated')
      .setDescription(`<@${actor.id}> modified <@${target.id}>'s balance by **${amount}** coins.\nNew balance: **${newBal}**.`)
      .setColor('Blue');
    return reply({ embeds: [embed] });
  }
};