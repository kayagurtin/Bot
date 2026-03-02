const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member for a duration')
    .addUserOption(o => o.setName('target').setDescription('Member to timeout').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 10m, 1h)').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interactionOrMessage, args) {
    // same as mute, since discord timeout is mute
    const isInteraction = !!interactionOrMessage.reply;
    const target = isInteraction
      ? interactionOrMessage.options.getUser('target')
      : interactionOrMessage.mentions.users.first();
    const strDur = isInteraction
      ? interactionOrMessage.options.getString('duration')
      : args[0];
    const reason = isInteraction
      ? interactionOrMessage.options.getString('reason') || 'No reason provided'
      : args.slice(1).join(' ') || 'No reason provided';
    if (!target || !strDur) return interactionOrMessage.reply ? interactionOrMessage.reply('Please specify a user and duration.') : interactionOrMessage.channel.send('Please specify a user and duration.');
    const durMs = ms(strDur);
    if (!durMs) return interactionOrMessage.reply ? interactionOrMessage.reply('Invalid duration.') : interactionOrMessage.channel.send('Invalid duration.');

    const member = interactionOrMessage.guild.members.cache.get(target.id);
    if (!member) return interactionOrMessage.reply ? interactionOrMessage.reply('User not found.') : interactionOrMessage.channel.send('User not found.');

    try {
      await member.timeout(durMs, reason);
      const msg = `Timed out ${target.tag} for ${strDur} (${reason})`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error(err);
      return interactionOrMessage.reply ? interactionOrMessage.reply('Failed to timeout.') : interactionOrMessage.channel.send('Failed to timeout.');
    }
  }
};