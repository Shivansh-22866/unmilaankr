// lib/server/discord.ts
import { Client, GatewayIntentBits, TextChannel, Partials } from 'discord.js';

export class DiscordDataFetcher {
  private client: Client | null = null;
  private ready: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      console.warn('⚠️ DiscordDataFetcher is being initialized on the frontend. Returning fallback.');
      return;
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ],
      partials: [Partials.Channel]
    });

    this.client.once('ready', () => {
      console.log(`🤖 Discord bot logged in as ${this.client?.user?.tag}`);
      this.ready = true;
    });
  }

  async init(): Promise<void> {
    if (!this.client || this.ready) return;
    try {
      console.log("DISCORD: ", process.env.DISCORD_TOKEN)
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (e) {
      console.warn('Failed to login to Discord:', e);
    }
  }

  /**
   * Fetch messages from a specific Discord channel
   */
  async fetchMessages(
    serverId: string,
    channelId: string,
    limit: number = 100
  ): Promise<{
    messages: Array<{ author: string; content: string; timestamp: string }>;
    count: number;
  }> {
    if (typeof window !== 'undefined' || !this.client) {
      console.warn('DiscordDataFetcher used in frontend or uninitialized. Returning dummy data.');
      return {
        messages: [],
        count: 0
      };
    }

    await this.init();

    try {
      const guild = await this.client.guilds.fetch(serverId);
      const channel = await guild.channels.fetch(channelId);

      if (!channel || !channel.isTextBased()) {
        throw new Error('Invalid or non-text channel');
      }

      const messages = await (channel as TextChannel).messages.fetch({ limit });
      const result = messages.map(msg => ({
        author: msg.author.username,
        content: msg.content,
        timestamp: msg.createdAt.toISOString()
      }));

      return {
        messages: result,
        count: result.length
      };
    } catch (error) {
      console.warn('❌ Failed to fetch Discord messages:', error);
      return {
        messages: [],
        count: 0
      };
    }
  }
}
