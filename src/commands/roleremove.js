const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleremove')
    .setDescription('Remove a role from a member')
    .addUserOption(o => o.setName('target').setDescription('Member to modify').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const target = isInteraction
      ? interactionOrMessage.options.getUser('target')
      : interactionOrMessage.mentions.users.first();
    const role = isInteraction
      ? interactionOrMessage.options.getRole('role')
      : null;
    if (!target || !role) return interactionOrMessage.reply ? interactionOrMessage.reply('Please specify a user and role.') : interactionOrMessage.channel.send('Please specify a user and role.');

    const member = interactionOrMessage.guild.members.cache.get(target.id);
    if (!member) return interactionOrMessage.reply ? interactionOrMessage.reply('User not found.') : interactionOrMessage.channel.send('User not found.');

    try {
      await member.roles.remove(role);
      const msg = `Removed role ${role.name} from ${target.tag}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error(err);
      return interactionOrMessage.reply ? interactionOrMessage.reply('Failed to remove role.') : interactionOrMessage.channel.send('Failed to remove role.');
    }
  }
};