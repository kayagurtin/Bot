const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send a message to a channel through the bot')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to send the announcement in').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Message content').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const member = isInteraction ? interactionOrMessage.member : interactionOrMessage.member;
    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      const denial = 'You do not have permission to use this command.';
      if (isInteraction) return interactionOrMessage.reply({ content: denial, ephemeral: true });
      return interactionOrMessage.channel.send(denial);
    }

    let targetChannel, msg;
    if (isInteraction) {
      targetChannel = interactionOrMessage.options.getChannel('channel');
      msg = interactionOrMessage.options.getString('message');
    } else {
      targetChannel = interactionOrMessage.mentions.channels.first();
      msg = args.join(' ');
    }

    if (!targetChannel) {
      const t = 'Please specify a valid channel.';
      if (isInteraction) return interactionOrMessage.reply({ content: t, ephemeral: true });
      return interactionOrMessage.channel.send(t);
    }
    if (!msg) {
      const t = 'Please provide a message to send.';
      if (isInteraction) return interactionOrMessage.reply({ content: t, ephemeral: true });
      return interactionOrMessage.channel.send(t);
    }

    try {
      await targetChannel.send(msg);
      const done = `Announcement sent to ${targetChannel}.`;
      if (isInteraction) return interactionOrMessage.reply(done);
      return interactionOrMessage.channel.send(done);
    } catch (err) {
      console.error('announce error:', err);
      const fail = 'Failed to send announcement.';
      if (isInteraction) return interactionOrMessage.reply({ content: fail, ephemeral: true });
      return interactionOrMessage.channel.send(fail);
    }
  }
};
