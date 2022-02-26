import { Client, GuildMember, Role } from 'discord.js';
import config from '../config';

export class DiscordBot extends Client {
  async assignRole(
    username: string,
    discriminator: string,
    undo: boolean | undefined = false
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
