const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel (prevent members from sending messages)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o =>
      o
        .setName('channel')
        .setDescription('Channel to lock')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;
    let channel = isInteraction ? interactionOrMessage.options.getChannel('channel') : interactionOrMessage.mentions.channels.first();
    channel = channel || interactionOrMessage.channel;

    try {
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
      const msg = `Channel ${channel.name} is now locked.`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('lock error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to lock channel: ${err.message}`) : interactionOrMessage.channel.send(`Failed to lock channel: ${err.message}`);
    }
  }
};
