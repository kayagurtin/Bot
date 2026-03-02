const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botstats')
    .setDescription('Set the bot\'s custom status message')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName('text').setDescription('Custom status text (leave empty to clear)').setRequired(false)),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;

    // Only allow bot owner or admins for prefix commands
    if (!isInteraction && !interactionOrMessage.member.permissions.has('ADMINISTRATOR')) {
      return interactionOrMessage.channel.send('You need Administrator permission to use this command');
    }

    const client = interactionOrMessage.client;
    let text;

    if (isInteraction) {
      text = interactionOrMessage.options.getString('text') || null;
    } else {
      text = args.join(' ') || null;
    }

    try {
      if (text) {
        await client.user.setActivity(text, { type: 'CUSTOM_STATUS' });
        const msg = `Custom status set to: "${text}"`;
        return isInteraction ? interactionOrMessage.reply({ content: msg, ephemeral: true }) : interactionOrMessage.channel.send(msg);
      } else {
        await client.user.setActivity(null);
        const msg = 'Custom status cleared';
        return isInteraction ? interactionOrMessage.reply({ content: msg, ephemeral: true }) : interactionOrMessage.channel.send(msg);
      }
    } catch (err) {
      console.error('botstats error:', err);
      return isInteraction ? interactionOrMessage.reply({ content: `Failed to set status: ${err.message}`, ephemeral: true }) : interactionOrMessage.channel.send(`Failed to set status: ${err.message}`);
    }
  }
};
