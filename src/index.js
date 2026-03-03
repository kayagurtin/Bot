require('dotenv').config();
// start webserver for keep-alive pings
require('./webserver');

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
if (!token) {
  console.error('Missing DISCORD_TOKEN environment variable.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Collections for commands
client.commands = new Collection();
const commands = [];

// load command files
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // register slash commands (global or guild-specific)
  if (clientId) {
    const rest = new REST({ version: '9' }).setToken(token);
    try {
      console.log('Registering application commands...');
      if (process.env.GUILD_ID) {
        await rest.put(Routes.applicationGuildCommands(clientId, process.env.GUILD_ID), { body: commands });
        console.log('Commands registered to guild', process.env.GUILD_ID);
      } else {
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Commands registered globally (may take up to an hour to appear)');
      }
    } catch (err) {
      console.error('Failed to register commands:', err);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error executing ${interaction.commandName}:`, err);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// handle auto-role for new members
const { getGuildConfig, setGuildConfig } = require('./utils/config');

client.on('guildMemberAdd', async member => {
  const cfg = getGuildConfig(member.guild.id);
  if (cfg.autorole) {
    try { await member.roles.add(cfg.autorole); } catch {}
  }
});

// sticky message maintenance – repost only if the sticky itself is deleted
client.on('messageDelete', async message => {
  if (!message.guild) return;
  const guildId = message.guild.id;
  const channel = message.channel;
  const cfg = getGuildConfig(guildId);
  const idKey = `sticky_msgid_${guildId}_${channel.id}`;
  const key = `sticky_${guildId}_${channel.id}`;
  
  // only repost if the deleted message is the sticky message
  if (cfg[idKey] && message.id === cfg[idKey]) {
    const text = cfg[key];
    if (text) {
      try {
        const sent = await channel.send(text);
        // update the stored message ID to the new one
        setGuildConfig(guildId, { [idKey]: sent.id });
      } catch {}
    }
  }
});

// simple prefix command handler and sticky repositioning
const PREFIX = '!';
client.on('messageCreate', message => {
  if (message.author.bot) return;
  
  // handle prefix commands
  if (message.content.startsWith(PREFIX)) {
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = client.commands.get(cmdName);
    if (cmd && cmd.execute) {
      try {
        cmd.execute(message, args);
      } catch (err) {
        console.error(`Error executing ${cmdName}:`, err);
        message.reply('there was an error executing that command.');
      }
    }
  }
  
  // reposition sticky message after any user message
  if (message.guild) {
    const guildId = message.guild.id;
    const channel = message.channel;
    const cfg = getGuildConfig(guildId);
    const key = `sticky_${guildId}_${channel.id}`;
    const idKey = `sticky_msgid_${guildId}_${channel.id}`;
    const text = cfg[key];
    
    if (text) {
      (async () => {
        // delete old sticky if it exists
        if (cfg[idKey]) {
          try {
            const old = await channel.messages.fetch(cfg[idKey]);
            if (old) await old.delete().catch(() => {});
          } catch {}
        }
        // send new sticky at bottom
        try {
          const sent = await channel.send(text);
          setGuildConfig(guildId, { [idKey]: sent.id });
        } catch {}
      })();
    }
  }
});

client.login(token).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});
