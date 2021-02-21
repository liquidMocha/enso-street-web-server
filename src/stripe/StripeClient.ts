import Stripe from 'stripe';
import {Order} from "../order/Order";

const stripe = new Stripe(
    process.env.STRIPE_API_KEY!,
    {apiVersion: '2020-08-27'}
);

export async function createPaymentIntentOf(order: Order): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.create({
        amount: order.charge * 100,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
        capture_method: 'manual',
        transfer_group: order.id
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

export async function payout(order: Order) {
    if (!order.executor.stripeAccountId) {
        throw Error(`Failed to payout to order ${order.id} because owner has not connected with Stripe`)
    }
    return stripe.transfers.create({
        amount: (order.itemSubtotal + order.deliveryFee) * (1 - parseFloat(process.env.SERVICE_FEE_PERCENTAGE!)),
        currency: 'usd',
        destination: order.executor.stripeAccountId,
        transfer_group: order.id,
    });
}
