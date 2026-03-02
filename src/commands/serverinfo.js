const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Display information about the server'),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;

    try {
      const owner = await guild.fetchOwner();
      const channels = guild.channels.cache.size;
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL())
        .addFields(
          { name: 'Server ID', value: guild.id, inline: true },
          { name: 'Owner', value: owner.user.username, inline: true },
          { name: 'Members', value: guild.memberCount.toString(), inline: true },
          { name: 'Channels', value: channels.toString(), inline: true },
          { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`, inline: true }
        );

      return interactionOrMessage.reply ? interactionOrMessage.reply({ embeds: [embed] }) : interactionOrMessage.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('serverinfo error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to get server info: ${err.message}`) : interactionOrMessage.channel.send(`Failed to get server info: ${err.message}`);
    }
  }
};
