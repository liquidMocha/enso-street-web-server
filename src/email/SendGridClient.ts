import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export function sendWelcomeEmail(emailAddress: string) {
    const msg = {
        to: emailAddress,
        from: 'no-reply@ensost.com',
        subject: 'Welcome To Enso Street',
        text: 'Welcome to Enso Street',
        html: '<strong>Welcom to Enso Street</strong>',
    };
    sgMail.send(msg);
}
