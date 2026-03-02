const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Display information about a user')
    .addUserOption(o => o.setName('user').setDescription('User to get info for')),
  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.reply;
    const guild = interactionOrMessage.guild;

    let user = isInteraction
      ? interactionOrMessage.options.getUser('user') || interactionOrMessage.user
      : interactionOrMessage.mentions.users.first() || interactionOrMessage.author;

    try {
      const member = await guild.members.fetch(user.id);
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${user.username}`)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: 'User ID', value: user.id, inline: true },
          { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`, inline: true },
          { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`, inline: true },
          { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') || 'No roles', inline: false },
          { name: 'Display Name', value: member.displayName, inline: true },
          { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true }
        );

      return interactionOrMessage.reply ? interactionOrMessage.reply({ embeds: [embed] }) : interactionOrMessage.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('userinfo error:', err);
      return interactionOrMessage.reply ? interactionOrMessage.reply(`Failed to get user info: ${err.message}`) : interactionOrMessage.channel.send(`Failed to get user info: ${err.message}`);
    }
  }
};
