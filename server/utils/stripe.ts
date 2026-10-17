import config from "../config.ts";
import Stripe from "stripe";
import { postgres } from "./postgres.ts";

export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export async function getCustomerByUid(uid: string) {
  if (!config.STRIPE_SECRET_KEY) {
    return undefined;
  }
  // The Firebase UID is stored in customer metadata (set at checkout or backfilled by syncSubs)
  // Note: search results can lag behind writes by up to a minute
  const customer = await stripe.customers.search({
    query: `metadata['firebaseUid']:'${uid.replace(/'/g, "\\'")}'`,
    expand: ["data.subscriptions"],
  });
  return customer?.data[0];
}

export async function getIsSubscriberByUid(uid: string | undefined) {
  if (!config.STRIPE_SECRET_KEY || !postgres) {
    // If Stripe isn't set up assume everyone is a subscriber
    return true;
  }
  // This runs on every metadata request and socket login, so it only reads the local
  // subscriber table (never Stripe). The table is written by /subSuccess right after
  // checkout and refreshed from Stripe every minute by the syncSubs job.
  if (!uid) {
    return false;
  }
  const { rows } = await postgres.query(
    "SELECT 1 FROM subscriber WHERE uid = $1 AND status = 'active'",
    [uid],
  );
  return rows.length > 0;
}

/**
 * Called when Stripe sends the user back after checkout.
 * Looks the session up in Stripe (the session id is the only thing we trust from the
 * request) and, if it resulted in an active subscription, records the subscriber
 * immediately instead of waiting for the next syncSubs run.
 * Always returns the return URL we stored when creating the session, if any.
 */
export async function recordCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });
  const returnUrl = session.metadata?.return_url;
  const uid = session.client_reference_id;
  const subscription = session.subscription;
  const customer = session.customer;
  let recorded = false;
  if (
    postgres &&
    uid &&
    session.mode === "subscription" &&
    session.status === "complete" &&
    subscription &&
    typeof subscription === "object" &&
    subscription.status === "active" &&
    customer &&
    typeof customer === "object" &&
    !customer.deleted
  ) {
    try {
      await postgres.query(
        `INSERT INTO subscriber ("customerId", email, status, uid)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (uid) DO UPDATE
        SET "customerId" = EXCLUDED."customerId", email = EXCLUDED.email, status = EXCLUDED.status`,
        [customer.id, customer.email, subscription.status, uid],
      );
      // Same as syncSubs: the subscriber's existing rooms become sub rooms
      await postgres.query(
        `UPDATE room SET "isSubRoom" = true WHERE owner = $1`,
        [uid],
      );
      recorded = true;
    } catch (e) {
      // Not fatal, syncSubs will pick the subscription up on its next run
      console.warn("failed to record subscriber %s:", uid, e);
    }
  }
  return { returnUrl, recorded };
}

export async function createSelfServicePortal(
  customerId: string,
  returnUrl: string,
) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getAllCustomers() {
  const result = [];
  for await (const customer of stripe.customers.list({ limit: 100 })) {
    result.push(customer);
  }
  return result;
}

export async function getAllActiveSubscriptions() {
  const result = [];
  for await (const sub of stripe.subscriptions.list({
    limit: 100,
    status: "active",
  })) {
    result.push(sub);
  }
  return result;
}
