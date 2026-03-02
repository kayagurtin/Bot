const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the guild')
    .addUserOption(o => o.setName('target').setDescription('Member to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for kick'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const target = isInteraction
      ? interactionOrMessage.options.getUser('target')
      : interactionOrMessage.mentions.users.first();
    const reason = isInteraction
      ? interactionOrMessage.options.getString('reason') || 'No reason provided'
      : args.join(' ') || 'No reason provided';
    if (!target) return interactionOrMessage.reply ? interactionOrMessage.reply('Please specify a user.') : interactionOrMessage.channel.send('Please specify a user.');

    const member = interactionOrMessage.guild.members.cache.get(target.id);
    if (!member) return interactionOrMessage.reply ? interactionOrMessage.reply('User not found.') : interactionOrMessage.channel.send('User not found.');

    try {
      await member.kick(reason);
      const msg = `Kicked ${target.tag} (${reason})`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error(err);
      return interactionOrMessage.reply ? interactionOrMessage.reply('Failed to kick.') : interactionOrMessage.channel.send('Failed to kick.');
    }
  }
};