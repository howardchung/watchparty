import { Intents } from 'discord.js';
import { Client } from 'pg';
import config from './config';
import { DiscordBot } from './utils/discord';
import { getUserByEmail } from './utils/firebase';
import { insertObject, updateObject } from './utils/postgres';
import { getAllActiveSubscriptions, getAllCustomers } from './utils/stripe';

let lastSubs: String;
let currentSubs: String;

const postgres2 = new Client({
  connectionString: config.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
postgres2.connect();

setInterval(syncSubscribers, 60 * 1000);

async function syncSubscribers() {
  if (!config.STRIPE_SECRET_KEY || !config.FIREBASE_ADMIN_SDK_CONFIG) {
    return;
  }
  console.time('syncSubscribers');
  // Fetch subs, customers from stripe
  const [subs, customers] = await Promise.all([
    getAllActiveSubscriptions(),
    getAllCustomers(),
  ]);

  const emailMap = new Map();
  customers.forEach((cust) => {
    emailMap.set(cust.id, cust.email);
  });

  const uidMap = new Map();
  for (let i = 0; i < subs.length; i += 50) {
    // Batch customers and fetch firebase data
    const batch = subs.slice(i, i + 50);
    const fbUsers = await Promise.all(
      batch
        .map((sub) =>
          emailMap.get(sub.customer)
            ? getUserByEmail(emailMap.get(sub.customer))
            : null
        )
        .filter(Boolean)
    );
    fbUsers.forEach((user) => {
      uidMap.set(user?.email, user?.uid);
    });
  }

  // Create sub objects
  const result = subs
    .map((sub) => ({
      customerId: sub.customer,
      email: emailMap.get(sub.customer),
      status: sub.status,
      uid: uidMap.get(emailMap.get(sub.customer)),
    }))
    .filter((sub) => sub.uid);
  currentSubs = result
    .map((sub) => sub.uid)
    .sort()
    .join();

  // Upsert to DB
  // console.log(result);
  if (currentSubs !== lastSubs) {
    try {
      await postgres2?.query('BEGIN TRANSACTION');
      await postgres2?.query('DELETE FROM subscriber');
      await postgres2?.query('UPDATE room SET "isSubRoom" = false');
      for (let i = 0; i < result.length; i++) {
        const row = result[i];
        await insertObject(postgres2, 'subscriber', row);
        await updateObject(
          postgres2,
          'room',
          { isSubRoom: true },
          { owner: row.uid }
        );
      }
      await postgres2?.query('COMMIT');
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  const client = new DiscordBot({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
  });
  try {
    await client.login(config.DISCORD_BOT_TOKEN);
    const guild = client.guilds.cache.get(config.DISCORD_SERVER_ID);
    const members = await guild?.members.fetch();

    // from discord API get username and discriminator of all users on discord server without a sub role
    const membersWithoutRole = members
      ?.filter((member) =>
        member.roles.cache.some(
          (role) => role.id !== config.DISCORD_SUB_ROLE_ID
        )
      )
      .map((member) => ({
        username: member.user.username,
        discriminator: member.user.discriminator,
      }));
    // from DB get username, discriminator and email of everyone who linked their discord
    const discordResult = await postgres2?.query('SELECT * FROM discord');

    // go through all users on server without a sub role,
    // if they are a sub, assign them sub role
    for (const member of membersWithoutRole ?? []) {
      // check if they linked their discord
      // (they might have linked their discord account with multiple emails)
      const rows = discordResult.rows.filter(
        (row) =>
          row.username === member.username &&
          row.discriminator === member.discriminator
      );
      // if sub exists for email assign role
      for (const row of rows) {
        if (result.some((sub) => sub.email === row.email)) {
          await client.assignRole(row.username, row.discriminator);
        }
      }
    }
    // get all rows with null email that are supposed to be cleaned up
    const nullResult = await postgres2?.query(
      'SELECT * FROM discord WHERE email IS NULL'
    );
    for (const row of nullResult.rows) {
      await client.assignRole(row.username, row.discriminator, true);
    }
    await postgres2?.query('DELETE FROM discord WHERE email IS NULL');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  lastSubs = currentSubs;
  console.log('%s subscribers', result.length);
  console.timeEnd('syncSubscribers');
}
