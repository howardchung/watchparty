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
  if (!config.STRIPE_SECRET_KEY) {
    // If Stripe isn't set up assume everyone is a subscriber
    return true;
  }
  if (!uid) {
    return false;
  }
  if (postgres) {
    // This runs on every metadata request and socket login so use the local table
    // The syncSubs job refreshes it from Stripe every minute
    const { rows } = await postgres.query(
      "SELECT 1 FROM subscriber WHERE uid = $1 AND status = 'active'",
      [uid],
    );
    if (rows.length > 0) {
      return true;
    }
  }
  const customer = await getCustomerByUid(uid);
  return Boolean(
    customer?.subscriptions?.data?.find((sub) => sub?.status === "active"),
  );
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
