const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot')
    .setDescription('Set bot presence (online/idle/dnd/invisible)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o
        .setName('status')
        .setDescription('Set bot status')
        .setRequired(true)
        .addChoices(
          { name: 'Online', value: 'online' },
          { name: 'Idle', value: 'idle' },
          { name: 'Do Not Disturb', value: 'dnd' },
          { name: 'Invisible', value: 'invisible' }
        )
    ),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;

    // Only allow bot owner or admins for prefix commands
    if (!isInteraction && !interactionOrMessage.member.permissions.has('ADMINISTRATOR')) {
      return interactionOrMessage.channel.send('You need Administrator permission to use this command');
    }

    const client = interactionOrMessage.client;
    let status;

    if (isInteraction) {
      status = interactionOrMessage.options.getString('status');
    } else {
      status = (args.shift() || 'online').toLowerCase();
    }

    const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
    if (!validStatuses.includes(status)) {
      return isInteraction ? interactionOrMessage.reply({ content: `Invalid status. Choose from: ${validStatuses.join(', ')}`, ephemeral: true }) : interactionOrMessage.channel.send(`Invalid status. Choose from: ${validStatuses.join(', ')}`);
    }

    try {
      await client.user.setPresence({ status });
      const statusEmoji = { online: '🟢', idle: '🟡', dnd: '🔴', invisible: '⚪' }[status];
      const msg = `Bot status set to ${statusEmoji} ${status}`;
      return isInteraction ? interactionOrMessage.reply({ content: msg, ephemeral: true }) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('bot status error:', err);
      return isInteraction ? interactionOrMessage.reply({ content: `Failed to set status: ${err.message}`, ephemeral: true }) : interactionOrMessage.channel.send(`Failed to set status: ${err.message}`);
    }
  }
};
