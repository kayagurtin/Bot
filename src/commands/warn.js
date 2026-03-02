const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for warning').setRequired(false)),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;

    let user;
    let reason;

    if (isInteraction) {
      user = interactionOrMessage.options.getUser('user');
      reason = interactionOrMessage.options.getString('reason') || 'No reason provided';
    } else {
      user = interactionOrMessage.mentions.users.first();
      reason = args.join(' ') || 'No reason provided';
    }

    if (!user) {
      return interactionOrMessage.reply ? interactionOrMessage.reply('Please specify a user') : interactionOrMessage.channel.send('Please specify a user');
    }

    try {
      const member = await guild.members.fetch(user.id);
      const dmMsg = `You have been warned in ${guild.name}.\n**Reason:** ${reason}`;
      await user.send(dmMsg).catch(() => null);
      
      const msg = `⚠️ ${user.username} has been warned.\n**Reason:** ${reason}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('warn error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to warn user: ${err.message}`) : interactionOrMessage.channel.send(`Failed to warn user: ${err.message}`);
    }
  }
};
