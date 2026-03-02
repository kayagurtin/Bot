const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('editrole')
    .setDescription('Modify various properties of a role')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sc =>
      sc
        .setName('permission')
        .setDescription('Grant or revoke a permission on a role')
        .addRoleOption(o => o.setName('role').setDescription('Role to edit').setRequired(true))
        .addStringOption(o =>
          o
            .setName('permission')
            .setDescription('Permission to change')
            .setRequired(true)
            .addChoices(
              { name: 'CreateInstantInvite', value: 'CreateInstantInvite' },
              { name: 'KickMembers', value: 'KickMembers' },
              { name: 'BanMembers', value: 'BanMembers' },
              { name: 'Administrator', value: 'Administrator' },
              { name: 'ManageChannels', value: 'ManageChannels' },
              { name: 'ManageGuild', value: 'ManageGuild' },
              { name: 'AddReactions', value: 'AddReactions' },
              { name: 'ViewAuditLog', value: 'ViewAuditLog' },
              { name: 'PrioritySpeaker', value: 'PrioritySpeaker' },
              { name: 'Stream', value: 'Stream' },
              { name: 'ViewChannel', value: 'ViewChannel' },
              { name: 'SendMessages', value: 'SendMessages' },
              { name: 'SendTTSMessages', value: 'SendTTSMessages' },
              { name: 'ManageMessages', value: 'ManageMessages' },
              { name: 'EmbedLinks', value: 'EmbedLinks' },
              { name: 'AttachFiles', value: 'AttachFiles' },
              { name: 'ReadMessageHistory', value: 'ReadMessageHistory' },
              { name: 'MentionEveryone', value: 'MentionEveryone' },
              { name: 'UseExternalEmojis', value: 'UseExternalEmojis' },
              { name: 'ViewGuildInsights', value: 'ViewGuildInsights' },
              { name: 'Connect', value: 'Connect' },
              { name: 'Speak', value: 'Speak' },
              { name: 'MuteMembers', value: 'MuteMembers' },
              { name: 'DeafenMembers', value: 'DeafenMembers' }
            )
        )
        .addBooleanOption(o =>
          o
            .setName('enable')
            .setDescription('Enable (true) or disable (false) the permission')
            .setRequired(true)
        )
    )
    .addSubcommand(sc =>
      sc
        .setName('name')
        .setDescription('Change the name of a role')
        .addRoleOption(o => o.setName('role').setDescription('Role to rename').setRequired(true))
        .addStringOption(o => o.setName('newname').setDescription('New role name').setRequired(true))
    )
    .addSubcommand(sc =>
      sc
        .setName('hoist')
        .setDescription('Toggle whether the role is shown separately in the member list')
        .addRoleOption(o => o.setName('role').setDescription('Role to update').setRequired(true))
        .addBooleanOption(o =>
          o
            .setName('value')
            .setDescription('true = hoist/show, false = hide')
            .setRequired(true)
        )
    ),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;

    // helper to send reply or message based on context
    const send = msg =>
      interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);

    // determine subcommand and parameters
    let sub;
    let role;
    if (isInteraction) {
      sub = interactionOrMessage.options.getSubcommand();
      role = interactionOrMessage.options.getRole('role');
    } else {
      // prefix form: !editrole sub role [args...]
      sub = args.shift();
      if (!sub) return;
      const mention = interactionOrMessage.mentions.roles.first();
      if (mention) {
        role = mention;
      } else if (args.length) {
        const name = args.shift();
        role = guild.roles.cache.find(r => r.name === name);
      }
    }

    if (!role) return send('Please specify a role.');

    // bot hierarchy checks
    const botMember = guild.members.me || (await guild.members.fetchMe());
    if (role.position >= botMember.roles.highest.position) {
      return send('Cannot modify a role that is higher or equal to the bot\'s highest role.');
    }

    try {
      switch (sub) {
        case 'permission': {
          let perm;
          let enable;
          if (isInteraction) {
            perm = interactionOrMessage.options.getString('permission');
            enable = interactionOrMessage.options.getBoolean('enable');
          } else {
            perm = args.shift();
            enable = args.shift() === 'true';
          }
          if (!perm) return send('Please specify a permission.');
          const permsObj = role.permissions;
          if (enable) permsObj.add(perm);
          else permsObj.remove(perm);
          await role.setPermissions(permsObj);
          return send(`Updated permission ${perm} to ${enable} on role ${role.name}`);
        }
        case 'name': {
          let newName;
          if (isInteraction) {
            newName = interactionOrMessage.options.getString('newname');
          } else {
            // after role argument the rest is name
            args.shift(); // discard role name already extracted above
            newName = args.join(' ');
          }
          if (!newName) return send('Please specify a new name.');
          await role.setName(newName);
          return send(`Role renamed to ${newName}`);
        }
        case 'hoist': {
          let value;
          if (isInteraction) {
            value = interactionOrMessage.options.getBoolean('value');
          } else {
            args.shift();
            value = args.shift() === 'true';
          }
          await role.edit({ hoist: value });
          return send(`${role.name} will ${value ? '' : 'no longer '}be hoisted.`);
        }
        default:
          return send('Unknown subcommand.');
      }
    } catch (err) {
      console.error('editrole error:', err);
      return send(`Failed to edit role: ${err.message}`);
    }
  }
};
