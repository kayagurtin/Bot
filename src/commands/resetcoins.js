const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { setBalance } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetcoins')
    .setDescription('Reset a user\'s balance to zero (admin only)')
    .addUserOption(opt =>
      opt
        .setName('user')
        .setDescription('The user whose balance to reset')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.isChatInputCommand;
    let target;
    if (isInteraction) {
      if (!interactionOrMessage.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interactionOrMessage.reply({ content: 'Administrator permission required.', ephemeral: true });
      }
      target = interactionOrMessage.options.getUser('user');
    } else {
      const message = interactionOrMessage;
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('Administrator permission required.');
      }
      target = message.mentions.users.first();
    }

    if (!target) {
      return isInteraction
        ? interactionOrMessage.reply({ content: 'Please mention a user.', ephemeral: true })
        : interactionOrMessage.reply('Please mention a user.');
    }

    setBalance(interactionOrMessage.guild.id, target.id, 0);
    const embed = new EmbedBuilder()
      .setTitle('Balance Reset')
      .setDescription(`<@${target.id}>'s balance has been reset to **0** coins.`)
      .setColor('Blue');

    return isInteraction
      ? interactionOrMessage.reply({ embeds: [embed] })
      : interactionOrMessage.reply({ embeds: [embed] });
  }
};