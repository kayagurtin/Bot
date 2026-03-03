Minimal Discord bot starter (Node.js, discord.js)

### PowerShell helper functions

```powershell
function Bot-Start { $env:DISCORD_TOKEN=$args[0]; node src/index.js }
function Bot-Stop { Get-Process node | Where-Object { $_.Path -match 'src\\index.js' } | Stop-Process -Force }
function Bot-Restart { param($token) Bot-Stop; Start-Sleep -Seconds 1; Bot-Start $token }
```

Setup

- create a secret env var named `DISCORD_TOKEN` with your bot token.
- (Optional) copy `.env.example` to `.env` for local testing.

Local run

```bash
npm install
DISCORD_TOKEN=your_token_here npm start
```

Docker (build + run locally)

```bash
docker build -t discord-bot-starter .
docker run -e DISCORD_TOKEN=$DISCORD_TOKEN discord-bot-starter
```

Deploying to Render / Railway / similar

- Use the included `Dockerfile` or deploy as a Node service.
- Set the `DISCORD_TOKEN` environment variable in the platform's dashboard.
- Ensure the bot has the Message Content Intent enabled in the Discord Developer Portal if you use `messageCreate` handling.
- (Optional) set `DISCORD_CLIENT_ID` to your application ID so the bot automatically registers slash commands on startup. For rapid testing you can also set `GUILD_ID` to a guild where you have admin rights; commands will then install instantly to that server rather than globally (global commands take up to an hour to propagate).

Commands

The bot supports both slash commands and prefix (`!`) commands. Two examples are included:

```text
/ping         – replies with "pong"
!ping          – same as slash
/uptime       – shows bot uptime
!uptime       – same as slash
```

Start Bot (Terminal)
cd 'C:\Users\Owner\nutsandbolts bot'
$env:DISCORD_TOKEN='YOUR_BOT_TOKEN_HERE'
$env:DISCORD_CLIENT_ID='YOUR_CLIENT_ID_HERE'
$env:GUILD_ID='YOUR_GUILD_ID_HERE'
node src/index.js 



You can add more commands by creating files under `src/commands`.

### 🛠️ Removed economy system
The previous coin-based economy commands have been removed from this bot.  If you want to add a custom currency later, you can reintroduce your own persistence layer and commands.

The following informational commands have been added in their place:

```text
/ip    – show several server IP addresses
/store – display the server store link
```

(See `/announce` below for broadcast messages.)


Additional moderation commands have been added, including:

```text
/temprole <user> <role> <duration>  – give a role for a limited time
/ban <user> [reason]
/kick <user> [reason]
/mute <user> <duration> [reason]      – applies timeout with no send/read
/timeout <user> <duration> [reason]   – discord timeout (mute + no actions)
/warn <user> [reason]                 – warn a user (DM sent)
/unmute <user> [reason]               – remove timeout from a user
/unban <user> [reason]                – unban a user
/softban <user> [days] [reason]       – ban and unban to clear messages
/rolegive <user> <role>               – add role
/roletake <user> <role>               – remove role
/editrole permission <role> <permission>* <true|false>  – toggle a permission on a role (*dropdown list)
/editrole name <role> <newname>                     – rename a role
/editrole hoist <role> <true|false>                  – toggle hoist

/role create <name> [hoist:true/false]             – create a new role with optional hoist
/role remove <role>                                – delete an existing role

/clear messages <channel> <amount>    – delete x messages in a channel (1-100)
/lock [channel]                       – lock a channel (prevent messages)
/unlock [channel]                     – unlock a channel
/slowmode <channel> <seconds>         – set slowmode (0 to disable)
/nickname <user> [name]               – set or reset a member's nickname

/userinfo [user]                      – show user info
/serverinfo                           – show server info

/help [command]                       – list all commands or get details for one (interactive button menu)
/botstats [text]                      – set or clear bot's custom status message
/botstatus <status>                   – set bot presence (online/idle/dnd/invisible)
/announce <channel> <message>         – send an announcement message through the bot

/setautorole <role> or clear           – configure role given to newcomers
/sticky add <channel> <message>        – create/update a sticky message; automatically repositioned to bottom on every new message
/sticky clear <channel>                – remove the sticky message from a channel
```

> **Help System:**
The `/help` command provides an interactive menu:
- Use `/help` to see an overview with category buttons (Money, Info & Settings, Moderation & Utilities)
- Click a button to view all commands in that category
- Use `/help <command>` for detailed information about a specific command (options, usage, etc.)
- Buttons are interactive for 5 minutes and then automatically removed
> * `rolegive` and `roleremove` require the bot to have the `MANAGE_ROLES` permission.
> * The bot's highest role must be higher than the role it's trying to add/remove; otherwise Discord will block the action (even if the bot has Administrator).
> * The error message now surfaces Discord’s response and the command also does a hierarchy check before attempting the change, so you’ll see a clearer warning if the bot isn’t high enough.
> * If you encounter a "Failed to give role" or similar message, check the console output for Discord's error text (e.g. `Missing Permissions`).


Notes

- The bot reads the token only from `process.env.DISCORD_TOKEN` — do not commit tokens to source control.
