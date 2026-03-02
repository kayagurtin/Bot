const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban and unban a user to clear their messages (soft ban)')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('user').setDescription('User to softban').setRequired(true))
    .addIntegerOption(o =>
      o
        .setName('days')
        .setDescription('Days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    )
    .addStringOption(o => o.setName('reason').setDescription('Reason for softban').setRequired(false)),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;

    let user;
    let days;
    let reason;

    if (isInteraction) {
      user = interactionOrMessage.options.getUser('user');
      days = interactionOrMessage.options.getInteger('days') ?? 0;
      reason = interactionOrMessage.options.getString('reason') || 'No reason provided';
    } else {
      user = interactionOrMessage.mentions.users.first();
      days = parseInt(args[0]) || 0;
      reason = args.slice(1).join(' ') || 'No reason provided';
    }

    if (!user) {
      return interactionOrMessage.reply ? interactionOrMessage.reply('Please specify a user') : interactionOrMessage.channel.send('Please specify a user');
    }

    try {
      await guild.bans.create(user.id, { deleteMessageSeconds: days * 86400, reason });
      await guild.bans.remove(user.id);
      const msg = `${user.username} has been soft-banned (messages cleared).\n**Reason:** ${reason}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('softban error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to softban user: ${err.message}`) : interactionOrMessage.channel.send(`Failed to softban user: ${err.message}`);
    }
  }
};
