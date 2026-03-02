const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, getUserProp, setUserProp } = require('../utils/economy');

const ROB_COOLDOWN = 4 * 60 * 60 * 1000; // 4 hours
const SUCCESS_CHANCE = 0.5;
const MIN_STEAL_PERCENT = 0.1; // steal 10-50% of target balance
const MAX_STEAL_PERCENT = 0.5;
const PENALTY_PERCENT = 0.2; // lose 20% of own balance on failure

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Attempt to rob another user')
    .addUserOption(opt =>
      opt
        .setName('user')
        .setDescription('Who to rob')
        .setRequired(true)
    ),

  async execute(interactionOrMessage, args) {
    const isInteraction = !!interactionOrMessage.isChatInputCommand;
    const guildId = interactionOrMessage.guild.id;
    let robberId, robberName, target;
    if (isInteraction) {
      robberId = interactionOrMessage.user.id;
      robberName = interactionOrMessage.user.username;
      target = interactionOrMessage.options.getUser('user');
    } else {
      const message = interactionOrMessage;
      robberId = message.author.id;
      robberName = message.author.username;
      target = message.mentions.users.first();
    }

    if (!target) {
      const msg = 'You need to mention someone to rob.';
      return isInteraction ? interactionOrMessage.reply({ content: msg, ephemeral: true }) : interactionOrMessage.reply(msg);
    }
    if (target.id === robberId) {
      const msg = 'You cannot rob yourself.';
      return isInteraction ? interactionOrMessage.reply({ content: msg, ephemeral: true }) : interactionOrMessage.reply(msg);
    }

    const now = Date.now();
    const last = getUserProp(guildId, robberId, 'lastRob') || 0;
    if (now - last < ROB_COOLDOWN) {
      const remaining = ROB_COOLDOWN - (now - last);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);
      const embed = new EmbedBuilder()
        .setTitle('Too soon')
        .setDescription(`You can try to rob someone again in **${hours}h ${minutes}m**.`)
        .setColor('DarkRed');
      return isInteraction ? interactionOrMessage.reply({ embeds: [embed], ephemeral: true }) : interactionOrMessage.reply({ embeds: [embed] });
    }

    const targetBal = getBalance(guildId, target.id);
    if (targetBal < 50) {
      const msg = 'That user doesn\'t have enough coins to rob (need at least 50).';
      return isInteraction ? interactionOrMessage.reply({ content: msg, ephemeral: true }) : interactionOrMessage.reply(msg);
    }

    let embed;
    if (Math.random() < SUCCESS_CHANCE) {
      // success
      const stealPct = Math.random() * (MAX_STEAL_PERCENT - MIN_STEAL_PERCENT) + MIN_STEAL_PERCENT;
      const amount = Math.max(1, Math.floor(targetBal * stealPct));
      addBalance(guildId, robberId, amount);
      addBalance(guildId, target.id, -amount);
      embed = new EmbedBuilder()
        .setTitle('Robbery successful')
        .setDescription(`You snuck away with **${amount}** coins from <@${target.id}>!`)
        .setColor('Green');

      // notify victim
      try {
        const dm = new EmbedBuilder()
          .setTitle('You were robbed')
          .setDescription(`<@${robberId}> stole **${amount}** coins from you.`)
          .setColor('Red');
        await target.send({ embeds: [dm] });
      } catch {}
    } else {
      // failure penalty
      const ownBal = getBalance(guildId, robberId);
      const loss = Math.max(1, Math.floor(ownBal * PENALTY_PERCENT));
      addBalance(guildId, robberId, -loss);
      embed = new EmbedBuilder()
        .setTitle('Robbery failed')
        .setDescription(`You got caught and lost **${loss}** coins as a penalty.`)
        .setColor('DarkRed');

      // notify victim of attempted robbery
      try {
        const dm = new EmbedBuilder()
          .setTitle('Robbery attempt')
          .setDescription(`<@${robberId}> tried to rob you but failed.`)
          .setColor('Yellow');
        await target.send({ embeds: [dm] });
      } catch {}
    }

    setUserProp(guildId, robberId, 'lastRob', now);
    return isInteraction ? interactionOrMessage.reply({ embeds: [embed] }) : interactionOrMessage.reply({ embeds: [embed] });
  }
};