import config from '../config';
import Stripe from 'stripe';

const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {
  apiVersion: '2020-03-02',
});

export async function getCustomerByEmail(email: string) {
  if (!config.STRIPE_SECRET_KEY) {
    return undefined;
  }
  const customer = await stripe.customers.list({
    email,
  });
  return customer?.data[0];
}

export async function createSelfServicePortal(
  customerId: string,
  returnUrl: string
) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
