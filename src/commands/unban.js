const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('user').setDescription('User to unban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for unbanning').setRequired(false)),
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
      if (!user && args.length) {
        try {
          user = await interactionOrMessage.client.users.fetch(args[0]);
        } catch {
          return interactionOrMessage.reply ? interactionOrMessage.reply('Could not find user') : interactionOrMessage.channel.send('Could not find user');
        }
      }
      reason = args.slice(1).join(' ') || 'No reason provided';
    }

    if (!user) {
      return interactionOrMessage.reply ? interactionOrMessage.reply('Please specify a user to unban') : interactionOrMessage.channel.send('Please specify a user to unban');
    }

    try {
      await guild.bans.remove(user.id);
      const msg = `${user.username} has been unbanned.\n**Reason:** ${reason}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('unban error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to unban user: ${err.message}`) : interactionOrMessage.channel.send(`Failed to unban user: ${err.message}`);
    }
  }
};
