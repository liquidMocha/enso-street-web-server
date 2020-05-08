import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY!,
    {apiVersion: '2020-03-02'});

export async function paymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
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
