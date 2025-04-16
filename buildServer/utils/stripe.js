"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerByEmail = getCustomerByEmail;
exports.getIsSubscriberByEmail = getIsSubscriberByEmail;
exports.createSelfServicePortal = createSelfServicePortal;
exports.getAllCustomers = getAllCustomers;
exports.getAllActiveSubscriptions = getAllActiveSubscriptions;
const config_1 = __importDefault(require("../config"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(config_1.default.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
});
async function getCustomerByEmail(email) {
    if (!config_1.default.STRIPE_SECRET_KEY) {
        return undefined;
    }
    const customer = await stripe.customers.list({
        email,
        expand: ['data.subscriptions'],
    });
    return customer?.data[0];
}
async function getIsSubscriberByEmail(email) {
    if (!config_1.default.STRIPE_SECRET_KEY) {
        // If Stripe isn't set up assume everyone is a subscriber
        return true;
    }
    if (!email) {
        return false;
    }
    const customer = await getCustomerByEmail(email);
    const isSubscriber = Boolean(customer?.subscriptions?.data?.find((sub) => sub?.status === 'active'));
    return isSubscriber;
}
async function createSelfServicePortal(customerId, returnUrl) {
    return await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
}
async function getAllCustomers() {
    const result = [];
    for await (const customer of stripe.customers.list({ limit: 100 })) {
        result.push(customer);
    }
    return result;
}
async function getAllActiveSubscriptions() {
    const result = [];
    for await (const sub of stripe.subscriptions.list({
        limit: 100,
        status: 'active',
    })) {
        result.push(sub);
    }
    return result;
}
