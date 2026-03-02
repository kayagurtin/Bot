const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove timeout from a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User to unmute').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for unmuting').setRequired(false)),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;

    let user;
    let reason;

    if (isInteraction) {
      user = interactionOrMessage.options.getUser('user');
      reason = interactionOrMessage.options.getString('reason') || 'No reason provided';
    } else {
      user = interactionOrMessage.mentions.users.first();
      reason = args.join(' ') || 'No reason provided';
    }

    if (!user) {
      return interactionOrMessage.reply ? interactionOrMessage.reply('Please specify a user') : interactionOrMessage.channel.send('Please specify a user');
    }

    try {
      const member = await guild.members.fetch(user.id);
      await member.timeout(null);
      const msg = `${user.username} has been unmuted.\n**Reason:** ${reason}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('unmute error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to unmute user: ${err.message}`) : interactionOrMessage.channel.send(`Failed to unmute user: ${err.message}`);
    }
  }
};
