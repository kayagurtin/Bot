const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Create or delete roles')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sc =>
      sc
        .setName('create')
        .setDescription('Create a new role with optional hoist')
        .addStringOption(o => o.setName('name').setDescription('Name for the new role').setRequired(true))
        .addBooleanOption(o =>
          o
            .setName('hoist')
            .setDescription('Show separately in member list')
        )
    )
    .addSubcommand(sc =>
      sc
        .setName('remove')
        .setDescription('Delete an existing role')
        .addRoleOption(o => o.setName('role').setDescription('Role to delete').setRequired(true))
    ),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;
    const send = msg =>
      interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);

    let sub;
    let role;
    let name;
    if (isInteraction) {
      sub = interactionOrMessage.options.getSubcommand();
      role = interactionOrMessage.options.getRole('role');
      name = interactionOrMessage.options.getString('name');
    } else {
      sub = args.shift();
      if (sub === 'create') {
        name = args.join(' ');
      } else if (sub === 'remove') {
        role = interactionOrMessage.mentions.roles.first();
        if (!role && args.length) {
          const rname = args.join(' ');
          role = guild.roles.cache.find(r => r.name === rname);
        }
      }
    }

    if (sub === 'create') {
      if (!name) return send('Please specify a name');
      try {
        const options = { name };
        const hoist = interactionOrMessage.options?.getBoolean('hoist');
        if (hoist !== undefined) options.hoist = hoist;
        const newRole = await guild.roles.create(options);
        return send(`Created role <@&${newRole.id}>`);
      } catch (err) {
        console.error('role create error', err);
        return send(`Failed to create role: ${err.message}`);
      }
    } else if (sub === 'remove') {
      if (!role) return send('Please specify a role to delete');
      // hierarchy check
      const botMember = guild.members.me || await guild.members.fetchMe();
      if (role.position >= botMember.roles.highest.position) {
        return send('Cannot delete a role that is higher or equal to the bot\'s highest role.');
      }
      try {
        await role.delete();
        return send(`Deleted role ${role.name}`);
      } catch (err) {
        console.error('role delete error', err);
        return send(`Failed to delete role: ${err.message}`);
      }
    } else {
      return send('Unknown subcommand');
    }
  }
};
