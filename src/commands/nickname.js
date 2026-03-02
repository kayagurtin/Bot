const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Set or reset a member\'s nickname')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .addUserOption(o => o.setName('user').setDescription('User to rename').setRequired(true))
    .addStringOption(o => o.setName('name').setDescription('New nickname (or blank to reset)').setRequired(false)),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;

    let user;
    let newName;

    if (isInteraction) {
      user = interactionOrMessage.options.getUser('user');
      newName = interactionOrMessage.options.getString('name') || null;
    } else {
      user = interactionOrMessage.mentions.users.first();
      newName = args.join(' ') || null;
    }

    if (!user) {
      return interactionOrMessage.reply ? interactionOrMessage.reply('Please specify a user') : interactionOrMessage.channel.send('Please specify a user');
    }

    try {
      const member = await guild.members.fetch(user.id);
      await member.setNickname(newName);
      const msg = newName ? `${user.username}'s nickname set to ${newName}` : `${user.username}'s nickname reset`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('nickname error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to set nickname: ${err.message}`) : interactionOrMessage.channel.send(`Failed to set nickname: ${err.message}`);
    }
  }
};
