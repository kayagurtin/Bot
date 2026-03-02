const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, getLastDaily, setLastDaily } = require('../utils/economy');

// 24 hours in milliseconds
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const DAILY_AMOUNT = 100; // coins given every day

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily coins'),

  async execute(interactionOrMessage, args) {
    let guildId, userId, reply;
    if (interactionOrMessage.isChatInputCommand) {
      guildId = interactionOrMessage.guild.id;
      userId = interactionOrMessage.user.id;
      reply = msg => interactionOrMessage.reply(msg);
    } else {
      const message = interactionOrMessage;
      guildId = message.guild.id;
      userId = message.author.id;
      reply = msg => message.reply(msg);
    }

    const now = Date.now();
    const last = getLastDaily(guildId, userId);

    if (now - last < DAILY_COOLDOWN) {
      const remaining = DAILY_COOLDOWN - (now - last);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);
      const userMention = `<@${userId}>`;
      const embed = new EmbedBuilder()
        .setTitle('Daily Reward')
        .setDescription(`${userMention}, you've already claimed your daily coins. Come back in **${hours}h ${minutes}m**.`)
        .setColor('DarkRed');
      return reply({ embeds: [embed] });
    }

    addBalance(guildId, userId, DAILY_AMOUNT);
    setLastDaily(guildId, userId, now);
    const newBal = getBalance(guildId, userId);
    const userMention = `<@${userId}>`;
    const embed = new EmbedBuilder()
      .setTitle('Daily Claimed!')
      .setDescription(`${userMention}, you received **${DAILY_AMOUNT}** coins.
Your new balance is **${newBal}**.`)
      .setColor('Green');
    return reply({ embeds: [embed] });
  }
};
