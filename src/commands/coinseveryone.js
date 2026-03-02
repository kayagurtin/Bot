const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { addBalance } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinseveryone')
    .setDescription('(Admin only) Add coins to every member in the server')
    .addIntegerOption(opt =>
      opt
        .setName('amount')
        .setDescription('Amount of coins to give each member')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.isChatInputCommand;
    const guildId = interactionOrMessage.guild.id;

    // Check for admin permission
    const hasAdmin = isInteraction
      ? interactionOrMessage.member.permissions.has(PermissionsBitField.Flags.Administrator)
      : interactionOrMessage.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!hasAdmin) {
      const msg = 'You need Administrator permission to use this command.';
      return isInteraction
        ? interactionOrMessage.reply({ content: msg, ephemeral: true })
        : interactionOrMessage.reply(msg);
    }

    let amount;
    if (isInteraction) {
      amount = interactionOrMessage.options.getInteger('amount');
    } else {
      amount = parseInt(args[0], 10);
    }

    if (!amount || isNaN(amount) || amount < 1) {
      const msg = 'Please provide a valid positive amount.';
      return isInteraction
        ? interactionOrMessage.reply({ content: msg, ephemeral: true })
        : interactionOrMessage.reply(msg);
    }

    // Defer the reply to avoid timeout
    if (isInteraction) {
      await interactionOrMessage.deferReply();
    }

    try {
      // Fetch all members
      const members = await interactionOrMessage.guild.members.fetch();
      const botMembers = members.filter(m => !m.user.bot);

      // Give coins to each member
      let count = 0;
      for (const member of botMembers.values()) {
        try {
          addBalance(guildId, member.id, amount);
          count++;
        } catch (err) {
          console.error(`Failed to add coins to ${member.id}:`, err);
        }
      }

      const embed = new EmbedBuilder()
        .setTitle('Coins Distributed')
        .setDescription(`Added **${amount}** coins to **${count}** members.`)
        .setColor('Green');

      return isInteraction
        ? interactionOrMessage.editReply({ embeds: [embed] })
        : interactionOrMessage.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Error distributing coins:', err);
      const msg = 'There was an error distributing coins to members.';
      return isInteraction
        ? interactionOrMessage.editReply({ content: msg })
        : interactionOrMessage.reply(msg);
    }
  }
};
