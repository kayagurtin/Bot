const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// command category mapping
const CATEGORIES = {
  money: {
    label: '💰 Money',
    commands: ['balance', 'deposit', 'withdraw', 'daily', 'pay', 'beg', 'rob', 'work', 'gamble', 'leaderboard', 'buy', 'shop', 'givecoins', 'takecoins', 'resetcoins', 'coinseveryone']
  },
  moderation: {
    label: '⚔️ Moderation & Utilities',
    commands: ['ban', 'unban', 'kick', 'mute', 'unmute', 'timeout', 'warn', 'softban', 'temprole', 'lock', 'unlock', 'slowmode', 'clear', 'nickname', 'role', 'editrole', 'rolegive', 'roletake']
  },
  info: {
    label: 'ℹ️ Info & Settings',
    commands: ['userinfo', 'serverinfo', 'help', 'ping', 'uptime', 'botstats', 'botstatus', 'setautorole', 'sticky', 'announce']
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List available commands or show details for one')
    .addStringOption(o => o.setName('command').setDescription('Command name to get details for')),

  async execute(interactionOrMessage, args) {
    try {
      const isInteraction = !!interactionOrMessage.isChatInputCommand;
      const client = interactionOrMessage.client;
      
      // Track the user who initiated the /help command
      const userId = isInteraction 
        ? interactionOrMessage.user.id 
        : interactionOrMessage.author.id;

      if (!client || !client.commands) {
        const msg = 'Unable to retrieve commands list.';
        return isInteraction
          ? interactionOrMessage.reply({ content: msg, ephemeral: true })
          : interactionOrMessage.channel.send(msg);
      }

      const requested = isInteraction ? interactionOrMessage.options.getString('command') : (args.shift() || null);

      const cmdsCollection = client.commands;
      const commands = Array.from(cmdsCollection.values());

      // Helper to create clickable slash links
      const slashMention = name => {
        const slash = client.application?.commands.cache.find(c => c.name === name);
        return slash ? `</${name}:${slash.id}>` : `/${name}`;
      };

      // If a specific command was requested, show details
      if (requested) {
        const cmd = commands.find(c => {
          const d = c.data?.toJSON?.() || {};
          return d.name === requested || c.name === requested;
        });

        if (!cmd) {
          const msg = `Command not found: \`${requested}\``;
          return isInteraction
            ? interactionOrMessage.reply({ content: msg, ephemeral: true })
            : interactionOrMessage.channel.send(msg);
        }

        const d = cmd.data?.toJSON?.() || {};
        const embed = new EmbedBuilder()
          .setTitle(`${slashMention(d.name)} — Details`)
          .setDescription(d.description || 'No description')
          .setColor('#00AAFF');

        if (d.options && d.options.length) {
          const optionsText = d.options.map(o => `• \`${o.name}\` — ${o.description || ''}${o.required ? ' **(required)**' : ''}`).join('\n');
          embed.addFields({ name: 'Options', value: optionsText });
        }

        const replyPayload = { embeds: [embed] };
        return isInteraction
          ? interactionOrMessage.reply(replyPayload)
          : interactionOrMessage.channel.send(replyPayload);
      }

      // Build overview embed with descriptions
      const overviewEmbed = new EmbedBuilder()
        .setTitle('📋 Commands')
        .setColor('#00AAFF')
        .setDescription(
          'Use `/help <command>` for details on a specific command.\n\n' +
          'Select a category below to view all commands in that section, or use the slash command directly!'
        );

      // Create category buttons
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_money')
          .setLabel('💰 Money')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('help_info')
          .setLabel('ℹ️ Info & Settings')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('help_moderation')
          .setLabel('⚔️ Moderation & Utilities')
          .setStyle(ButtonStyle.Primary)
      );

      // Create back button row
      const backButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_back')
          .setLabel('< Back')
          .setStyle(ButtonStyle.Secondary)
      );

      // Build category embed with back button
      const buildCategoryEmbed = (categoryKey) => {
        const category = CATEGORIES[categoryKey];
        if (!category) return null;

        const catCommands = commands.filter(c => {
          const d = c.data?.toJSON?.() || {};
          const cmdName = d.name || c.name;
          return category.commands.includes(cmdName);
        });

        const lines = catCommands
          .map(c => {
            const d = c.data?.toJSON?.() || {};
            const cmdName = d.name || c.name;
            const desc = d.description || '';
            return `${slashMention(cmdName)} — ${desc}`;
          })
          .sort();

        const embed = new EmbedBuilder()
          .setTitle(category.label)
          .setColor('#00AAFF')
          .setDescription(lines.join('\n') || 'No commands');

        return { embed, components: [backButton] };
      };

      // Send initial response
      const reply = await (isInteraction
        ? interactionOrMessage.reply({ embeds: [overviewEmbed], components: [buttons], fetchReply: true })
        : interactionOrMessage.reply({ embeds: [overviewEmbed], components: [buttons] }));

      // Create collector for button interactions
      const collector = reply.createMessageComponentCollector({
        filter: i => i.customId.startsWith('help_'),
        time: 5 * 60 * 1000 // 5 minutes
      });

      collector.on('collect', async interaction => {
        if (!interaction.isButton()) return;

        // Check if the user who clicked is the one who ran /help
        if (interaction.user.id !== userId) {
          return interaction.reply({
            content: "Hey! you can't press these buttons, if you want some help with commands type /help",
            ephemeral: true
          });
        }

        let categoryKey = null;
        if (interaction.customId === 'help_money') categoryKey = 'money';
        else if (interaction.customId === 'help_info') categoryKey = 'info';
        else if (interaction.customId === 'help_moderation') categoryKey = 'moderation';
        else if (interaction.customId === 'help_back') {
          // Go back to overview
          await interaction.update({
            embeds: [overviewEmbed],
            components: [buttons]
          });
          return;
        }

        if (categoryKey) {
          const categoryEmbed = buildCategoryEmbed(categoryKey);
          if (categoryEmbed) {
            await interaction.update({
              embeds: [categoryEmbed.embed],
              components: categoryEmbed.components
            });
          }
        }
      });

      collector.on('end', async () => {
        try {
          await reply.edit({ components: [] });
        } catch {}
      });

    } catch (err) {
      console.error('Help command error:', err);
      const msg = 'Error retrieving help information.';
      return interactionOrMessage.reply
        ? interactionOrMessage.reply({ content: msg, ephemeral: true })
        : interactionOrMessage.channel.send(msg);
    }
  }
};
