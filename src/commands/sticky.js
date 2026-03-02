const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setGuildConfig, getGuildConfig } = require('../utils/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Manage sticky messages that stay at the bottom of a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Create or update a sticky message')
        .addChannelOption(o =>
          o
            .setName('channel')
            .setDescription('Channel for the sticky message')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName('message').setDescription('Text to keep at bottom').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('clear')
        .setDescription('Remove a sticky message from a channel')
        .addChannelOption(o =>
          o
            .setName('channel')
            .setDescription('Channel to clear')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    ),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guildId = interactionOrMessage.guild.id;
    let channel, msg, sub;

    if (isInteraction) {
      sub = interactionOrMessage.options.getSubcommand();
      channel = interactionOrMessage.options.getChannel('channel');
      if (sub === 'add') msg = interactionOrMessage.options.getString('message');
    } else {
      if (args.length === 0) return interactionOrMessage.channel.send('Usage: !sticky add|clear <#channel> [message]');
      sub = args.shift().toLowerCase();
      channel = interactionOrMessage.mentions.channels.first();
      if (sub === 'add') {
        msg = args.slice(1).join(' ');
      }
    }

    if (!channel) {
      const resp = 'Please mention a channel.';
      return isInteraction
        ? interactionOrMessage.reply({ content: resp, ephemeral: true })
        : interactionOrMessage.channel.send(resp);
    }

    const key = `sticky_${guildId}_${channel.id}`;
    const idKey = `sticky_msgid_${guildId}_${channel.id}`;
    const cfg = getGuildConfig(guildId);

    if (sub === 'clear') {
      // attempt to delete any existing sticky message
      const prevId = cfg[idKey];
      if (prevId) {
        try {
          const prev = await channel.messages.fetch(prevId);
          if (prev) await prev.delete().catch(() => {});
        } catch {}
      }
      setGuildConfig(guildId, { [key]: null, [idKey]: null });
      const resp = `Sticky message cleared for ${channel}`;
      return isInteraction
        ? interactionOrMessage.reply({ content: resp, ephemeral: true })
        : interactionOrMessage.channel.send(resp);
    }

    // add/update
    // delete previous sticky if it exists
    if (cfg[idKey]) {
      try {
        const prev = await channel.messages.fetch(cfg[idKey]);
        if (prev) await prev.delete().catch(() => {});
      } catch {}
    }
    // send new sticky
    try {
      const sent = await channel.send(msg);
      setGuildConfig(guildId, { [key]: msg, [idKey]: sent.id });
    } catch {}
    const resp = `Sticky message set for ${channel}`;
    return isInteraction
      ? interactionOrMessage.reply({ content: resp, ephemeral: true })
      : interactionOrMessage.channel.send(resp);
  }
};