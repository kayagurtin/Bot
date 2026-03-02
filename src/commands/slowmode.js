const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(o =>
      o
        .setName('seconds')
        .setDescription('Slowmode duration in seconds (0 to disable)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .addChannelOption(o =>
      o
        .setName('channel')
        .setDescription('Channel to set slowmode for')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    let channel = isInteraction ? interactionOrMessage.options.getChannel('channel') : interactionOrMessage.mentions.channels.first();
    channel = channel || interactionOrMessage.channel;
    
    let seconds;
    if (isInteraction) {
      seconds = interactionOrMessage.options.getInteger('seconds');
    } else {
      seconds = parseInt(args[0]) || 0;
    }

    if (seconds < 0 || seconds > 21600) {
      return interactionOrMessage.reply ? interactionOrMessage.reply('Slowmode must be between 0 and 21600 seconds') : interactionOrMessage.channel.send('Slowmode must be between 0 and 21600 seconds');
    }

    try {
      await channel.setRateLimitPerUser(seconds);
      const msg = seconds === 0 ? `Slowmode disabled in ${channel.name}` : `Slowmode set to ${seconds} seconds in ${channel.name}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('slowmode error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to set slowmode: ${err.message}`) : interactionOrMessage.channel.send(`Failed to set slowmode: ${err.message}`);
    }
  }
};
