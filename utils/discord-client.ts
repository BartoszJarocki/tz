import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;

let discordClient: Client | null = null;
let restClient: REST | null = null;

export function getDiscordClient(): Client {
  if (!DISCORD_BOT_TOKEN) {
    throw new Error('DISCORD_BOT_TOKEN environment variable is required');
  }

  if (!discordClient) {
    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    discordClient.login(DISCORD_BOT_TOKEN);
  }

  return discordClient;
}

export function getDiscordREST(): REST {
  if (!DISCORD_BOT_TOKEN) {
    throw new Error('DISCORD_BOT_TOKEN environment variable is required');
  }

  if (!restClient) {
    restClient = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
  }

  return restClient;
}

export async function sendDiscordReply(channelId: string, message: string, messageId?: string) {
  try {
    const client = getDiscordClient();
    const channel = await client.channels.fetch(channelId);

    if (!channel?.isTextBased()) {
      throw new Error('Channel is not text-based');
    }

    if (messageId) {
      const originalMessage = await channel.messages.fetch(messageId);
      await originalMessage.reply(message);
    } else {
      await channel.send(message);
    }
  } catch (error) {
    console.error('Error sending Discord reply:', error);
    throw error;
  }
}

export async function registerSlashCommand() {
  if (!DISCORD_APPLICATION_ID) {
    throw new Error('DISCORD_APPLICATION_ID environment variable is required');
  }

  const commands = [
    new SlashCommandBuilder()
      .setName('tz')
      .setDescription('Convert time between timezones')
      .addStringOption(option =>
        option
          .setName('time')
          .setDescription('Time and timezone conversion (e.g., "3pm EST to PST, CET")')
          .setRequired(true)
      ),
  ];

  try {
    const rest = getDiscordREST();

    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(DISCORD_APPLICATION_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering slash command:', error);
    throw error;
  }
}

export async function getBotInfo() {
  try {
    const client = getDiscordClient();
    await client.user?.fetch();

    return {
      userId: client.user?.id,
      username: client.user?.username,
    };
  } catch (error) {
    console.error('Error getting Discord bot info:', error);
    return null;
  }
}
