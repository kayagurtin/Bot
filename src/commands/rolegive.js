const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolegive')
    .setDescription('Assign a role to a member')
    .addUserOption(o => o.setName('target').setDescription('Member to modify').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to give').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;

    const target = isInteraction
      ? interactionOrMessage.options.getUser('target')
      : interactionOrMessage.mentions.users.first();

    // determine role for prefix or slash
    let role;
    if (isInteraction) {
      role = interactionOrMessage.options.getRole('role');
    } else {
      // try mention first, then name by args
      role = interactionOrMessage.mentions.roles.first();
      if (!role && args.length > 1) {
        role = guild.roles.cache.find(r => r.name === args.slice(1).join(' '));
      }
    }

    if (!target || !role) {
      const msg = 'Please specify a user and role.';
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    }

    // fetch member to ensure up-to-date
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

    // hierarchy check: bot's highest role must be above the target role
    const botMember = guild.members.me || await guild.members.fetchMe();
    if (role.position >= botMember.roles.highest.position) {
      const msg = 'Cannot give a role that is higher or equal to the bot\'s highest role in the server hierarchy.';
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    }

    // check that the bot can modify the member (member top role lower than bot's)
    if (member.roles.highest.position >= botMember.roles.highest.position) {
      const msg = 'Cannot modify that user because their highest role is higher or equal to the bot\'s highest role.';
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    }

    try {
      await member.roles.add(role);
      const msg = `Gave role ${role.name} to ${target.tag}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('rolegive error:', err);
      const msg = `Failed to give role: ${err.message}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    }
  }
};