import { Client as DiscordClient, GuildMember, Role } from 'discord.js';
import { Client as PostgresClient } from 'pg';
import config from '../config';

let postgres: PostgresClient | undefined = undefined;
if (config.DATABASE_URL) {
  postgres = new PostgresClient({
    connectionString: config.DATABASE_URL,
  });
  postgres.connect();
}

export class DiscordBot extends DiscordClient {
  async assignRole(
    username: string,
    discriminator: string,
    undo: boolean | undefined
  ): Promise<GuildMember | undefined> {
    const guild = this.guilds.cache.get(config.DISCORD_SERVER_ID);
    const role = guild?.roles.cache.get(config.DISCORD_SUB_ROLE_ID);
    const members = await guild?.members.fetch();
    const user = members?.find(
      (member) =>
        member.user.username === username &&
        member.user.discriminator === discriminator
    );
    if (undo) {
      return await user?.roles.remove(role as Role);
    } else {
      return await user?.roles.add(role as Role);
    }
  }
}
