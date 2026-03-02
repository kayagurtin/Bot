const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roletake')
    .setDescription('Remove a role from a member')
    .addUserOption(o => o.setName('target').setDescription('Member to modify').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;

    const target = isInteraction
      ? interactionOrMessage.options.getUser('target')
      : interactionOrMessage.mentions.users.first();

    let role;
    if (isInteraction) {
      role = interactionOrMessage.options.getRole('role');
    } else {
      role = interactionOrMessage.mentions.roles.first();
      if (!role && args.length > 1) {
        role = guild.roles.cache.find(r => r.name === args.slice(1).join(' '));
      }
    }

    if (!target || !role) {
      const msg = 'Please specify a user and role.';
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    }

    let member;
    try {
      member = await guild.members.fetch(target.id);
    } catch {
      member = guild.members.cache.get(target.id);
    }
    if (!member) {
      const msg = 'User not found.';
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    }

    // hierarchy check for removal as well
    const botMember = guild.members.me || await guild.members.fetchMe();
    if (role.position >= botMember.roles.highest.position) {
      const msg = 'Cannot remove a role that is higher or equal to the bot\'s highest role in the server hierarchy.';
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    }

    if (member.roles.highest.position >= botMember.roles.highest.position) {
      const msg = 'Cannot modify that user because their highest role is higher or equal to the bot\'s highest role.';
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    }

    try {
      await member.roles.remove(role);
      const msg = `Removed role ${role.name} from ${target.tag}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('roleremove error:', err);
      const msg = `Failed to remove role: ${err.message}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    }
  }
};