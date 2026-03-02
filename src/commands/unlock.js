const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel (allow members to send messages)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o =>
      o
        .setName('channel')
        .setDescription('Channel to unlock')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;
    let channel = isInteraction ? interactionOrMessage.options.getChannel('channel') : interactionOrMessage.mentions.channels.first();
    channel = channel || interactionOrMessage.channel;

    try {
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null });
      const msg = `Channel ${channel.name} is now unlocked.`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('unlock error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to unlock channel: ${err.message}`) : interactionOrMessage.channel.send(`Failed to unlock channel: ${err.message}`);
    }
  }
};
