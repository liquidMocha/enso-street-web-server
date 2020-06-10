import Stripe from 'stripe';
import {Order} from "../order/Order";

const stripe = new Stripe(process.env.STRIPE_API_KEY!,
    {apiVersion: '2020-03-02'});

export async function createPaymentIntentOf(amount: number): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
        capture_method: 'manual',
    })
}

export async function cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    try {
        await stripe.paymentIntents.cancel(paymentIntentId);
    } catch (e) {
        console.error(`Cancel payment intent failed for ${paymentIntentId}`)
        return Promise.resolve();
    }
}

export async function capturePaymentIntent(paymentIntentId: string): Promise<void> {
    try {
        await stripe.paymentIntents.capture(paymentIntentId);
    } catch (e) {
        console.error(`Cannot capture payment intent ${paymentIntentId}.`);
        return Promise.reject();
    }
}

export async function refundDeposit(order: Order): Promise<void> {
    try {
        await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
            amount: order.totalDeposits()
        });
    } catch (e) {
        console.error(`Failed to refund order: ${order.id}`);
    }
}

export async function getStripeConnectAccount(authorizationCode: string): Promise<string> {
    const response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code: authorizationCode,
    });

    const stripeUserId = response.stripe_user_id;
    if (stripeUserId) {
        return stripeUserId;
    } else {
        return Promise.reject("Error when getting Stripe user ID.");
    }
}
