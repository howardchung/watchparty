import config from '../config';
import Stripe from 'stripe';

const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {
  apiVersion: '2020-08-27',
});

export async function getCustomerByEmail(email: string) {
  if (!config.STRIPE_SECRET_KEY) {
    return undefined;
  }
  const customer = await stripe.customers.list({
    email,
    expand: ['data.subscriptions'],
  });
  return customer?.data[0];
}

export async function getIsSubscriberByEmail(email: string | undefined) {
  if (!config.STRIPE_SECRET_KEY) {
    // If Stripe isn't set up assume everyone is a subscriber
    return true;
  }
  if (!email) {
    return false;
  }
  const customer = await getCustomerByEmail(email);
  const isSubscriber = Boolean(
    customer?.subscriptions?.data?.find((sub) => sub?.status === 'active'),
  );
  return isSubscriber;
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
    status: 'active',
  })) {
    result.push(sub);
  }
  return result;
}
