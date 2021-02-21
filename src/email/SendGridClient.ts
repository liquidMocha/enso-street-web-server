import sgMail from "@sendgrid/mail";
import {Order} from "../order/Order";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export function sendWelcomeEmail(emailAddress: string) {
    const message = {
        to: emailAddress,
        from: 'no-reply@ensost.com',
        subject: 'Welcome To Enso Street',
        text: 'Welcome to Enso Street',
        html: '<strong>Welcome to Enso Street</strong>',
    };
    sgMail.send(message);
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
    const message = {
        to: email,
        from: 'no-reply@ensost.com',
        subject: 'Enso Street: Reset Your Password',
        text: `Please click the following link to reset password: ${resetLink}`,
        html: `<strong>Please click the following link to reset password: ${resetLink}</strong>`,
    };
    return sgMail.send(message);
}

export function notifyOwnerAboutOrder(order: Order) {
    const message = {
        to: order.executor.email,
        from: 'no-reply@ensost.com',
        subject: 'Enso Street: You Have Got An Order',
        text: `You've got an order. Please go to ensost.com to see detail.`,
        html: `<p>You've got an order. Please go to ensost.com to see detail.<p/>`
    };

    sgMail.send(message);
}
