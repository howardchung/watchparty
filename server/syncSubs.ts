import { Client } from 'pg';
import config from './config';
import { getUserByEmail } from './utils/firebase';
import { getAllActiveSubscriptions, getAllCustomers } from './utils/stripe';

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
  const result = subs.map((sub) => ({
    customerId: sub.customer,
    email: emailMap.get(sub.customer),
    status: sub.status,
    uid: uidMap.get(emailMap.get(sub.customer)),
  }));

  // Upsert to DB
  console.log(result);
  const postgres2 = new Client({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  postgres2.connect();
  await postgres2?.query('BEGIN TRANSACTION');
  await postgres2?.query('DELETE FROM subscriber');
  for (let i = 0; i < result.length; i++) {
    const row = result[i];
    const columns = Object.keys(row);
    const values = Object.values(row);
    const query = `INSERT INTO subscriber(${columns
      .map((c) => `"${c}"`)
      .join(',')})
    VALUES (${values.map((_, i) => '$' + (i + 1)).join(',')})
    RETURNING *`;
    await postgres2?.query(query, values);
  }
  await postgres2?.query('COMMIT');
  console.timeEnd('syncSubscribers');
}
