const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages from a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(sc =>
      sc
        .setName('messages')
        .setDescription('Remove a specific number of messages')
        .addChannelOption(o => o.setName('channel').setDescription('Channel to clear').setRequired(true))
        .addIntegerOption(o =>
          o
            .setName('amount')
            .setDescription('Number of messages to delete (1-100)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
    ),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    let channel;
    let amount;

    if (isInteraction) {
      channel = interactionOrMessage.options.getChannel('channel');
      amount = interactionOrMessage.options.getInteger('amount');
    } else {
      const sub = args.shift();
      if (sub !== 'messages') {
        return interactionOrMessage.reply ? interactionOrMessage.reply('Unknown subcommand') : interactionOrMessage.channel.send('Unknown subcommand');
      }
      const mention = interactionOrMessage.mentions.channels.first();
      channel = mention || interactionOrMessage.channel;
      amount = parseInt(args.shift()) || 10;
    }

    if (!channel) {
      return interactionOrMessage.reply ? interactionOrMessage.reply('Please specify a channel') : interactionOrMessage.channel.send('Please specify a channel');
    }

    if (amount < 1 || amount > 100) {
      return interactionOrMessage.reply ? interactionOrMessage.reply('Amount must be between 1 and 100') : interactionOrMessage.channel.send('Amount must be between 1 and 100');
    }

    try {
      const deleted = await channel.bulkDelete(amount, true);
      const msg = `Deleted ${deleted.size} messages from ${channel.name}`;
      return interactionOrMessage.reply ? interactionOrMessage.reply(msg) : interactionOrMessage.channel.send(msg);
    } catch (err) {
      console.error('clear error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to clear messages: ${err.message}`) : interactionOrMessage.channel.send(`Failed to clear messages: ${err.message}`);
    }
  }
};
