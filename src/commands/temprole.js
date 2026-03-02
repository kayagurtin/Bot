const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('temprole')
    .setDescription('Give a role temporarily')
    .addUserOption(o => o.setName('target').setDescription('Member to modify').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to give').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('How long to keep the role (e.g. 1h)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const target = isInteraction
      ? interactionOrMessage.options.getUser('target')
      : interactionOrMessage.mentions.users.first();
    const role = isInteraction
      ? interactionOrMessage.options.getRole('role')
      : null;
    const strDur = isInteraction
      ? interactionOrMessage.options.getString('duration')
      : args[0];
    if (!target || !role || !strDur) return interactionOrMessage.reply ? interactionOrMessage.reply('Please specify user, role, and duration.') : interactionOrMessage.channel.send('Please specify user, role, and duration.');
    const durMs = ms(strDur);
    if (!durMs) return interactionOrMessage.reply ? interactionOrMessage.reply('Invalid duration.') : interactionOrMessage.channel.send('Invalid duration.');

    const member = interactionOrMessage.guild.members.cache.get(target.id);
    if (!member) return interactionOrMessage.reply ? interactionOrMessage.reply('User not found.') : interactionOrMessage.channel.send('User not found.');

    try {
      await member.roles.add(role);
      const msg = `Gave role ${role.name} to ${target.tag} for ${strDur}`;
      if (isInteraction) await interactionOrMessage.reply(msg);
      else interactionOrMessage.channel.send(msg);
      setTimeout(async () => {
        try {
          await member.roles.remove(role);
        } catch (e) {
          console.error('Failed to remove temp role:', e);
        }
      }, durMs);
    } catch (err) {
      console.error(err);
      return interactionOrMessage.reply ? interactionOrMessage.reply('Failed to give temp role.') : interactionOrMessage.channel.send('Failed to give temp role.');
    }
  }
};