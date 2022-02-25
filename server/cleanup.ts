import { Client } from 'pg';
import config from './config';
import { Intents } from 'discord.js';
import { DiscordBot } from './utils/discord';
import { getAllActiveSubscriptions } from './utils/stripe';
import { insertObject } from './utils/postgres';

const postgres = new Client({
  connectionString: config.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
postgres.connect();

setInterval(cleanupPostgres, 5 * 60 * 1000);
setInterval(cleanupRoles, 24 * 60 * 60 * 1000);

async function cleanupPostgres() {
  if (!postgres) {
    return;
  }
  console.time('[CLEANUP]');
  await postgres?.query(
    `DELETE FROM room WHERE owner IS NULL AND "lastUpdateTime" < NOW() - INTERVAL '1 day'`
  );
  console.timeEnd('[CLEANUP]');
}

function cleanupRoles() {
  console.time('[DISCORD CLEANUP]');
  const client = new DiscordBot({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
  });
  client.once('ready', async () => {
    if (!postgres) {
      return;
    }
    const guild = client.guilds.cache.get(config.DISCORD_SERVER_ID);
    const members = await guild?.members.fetch();
    // get username and discriminator of all users who
    // currently have a sub role assigned on discord
    const membersWithRole = members
      ?.filter((member) =>
        member.roles.cache.some(
          (role) => role.id === config.DISCORD_SUB_ROLE_ID
        )
      )
      .map((member) => ({
        username: member.user.username,
        discriminator: member.user.discriminator,
      }));
    const subs = await getAllActiveSubscriptions();

    try {
      // get all known users who have been assigned a sub role
      const result = await postgres?.query('SELECT * FROM discord');
      // filter out all users without an active sub
      const filteredRows = result.rows.filter((row) =>
        subs.some((sub) => sub.customer === row.customerId)
      );
      // keep track of all users whose sub role will be removed:
      // filter out all users who are not in filteredRows array;
      const droppedUsers = membersWithRole?.filter(
        (member) =>
          !filteredRows.some(
            (row) =>
              row.username === member.username &&
              row.discriminator === member.discriminator
          )
      );

      await postgres?.query('BEGIN TRANSACTION');
      await postgres?.query('DELETE FROM discord');
      for (let i = 0; i < filteredRows.length; i++) {
        await insertObject(postgres, 'discord', filteredRows[i]);
      }
      await postgres?.query('COMMIT');

      // remove roles on discord
      for (const user of droppedUsers || []) {
        await client.assignRole(user.username, user.discriminator, true);
      }
    } catch (e) {
      console.error(e);
    }
  });

  if (!client.isReady()) {
    client.login(config.DISCORD_BOT_TOKEN);
  }
  console.timeEnd('[DISCORD CLEANUP]');
}
