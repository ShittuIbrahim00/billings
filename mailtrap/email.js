import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailTrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email verification"
        })
        console.log("Email Sent Successfully", response);
    } catch (error) {
        console.error("Error sending verification", error);  
        
        throw new Error(`Error sending verification`, error)
    }
}

export const sendWelcomeEmail = async (email) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to our website",
            html: WELCOME_EMAIL_TEMPLATE,
            category: "Welcome Email"
        })
        console.log("Email Sent Successfully", response);
    } catch (error) {
        console.error("Error sending verification", error);  
        
        throw new Error(`Error sending verification`, error)
    }
}

export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password reset request",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password reset"
        })
        console.log("Email Sent Successfully", response);
    } catch (error) {
        console.error("Error sending verification", error);  
        
        throw new Error(`Error sending verification`, error)
    }
}

export const sendPasswordSuccessEmail = async (email) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password reset request",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password reset"
        })
        console.log("Email Sent Successfully", response);
    } catch (error) {
        console.error("Error sending verification", error);  
        
        throw new Error(`Error sending verification`, error)
    }
}

// import { MailtrapClient } from "mailtrap";

// const TOKEN = "a0a1a2d175d835eccf1992c0ec12aebe";

// const client = new MailtrapClient({
//   token: TOKEN,
// });

// const sender = {
//   email: "hello@demomailtrap.co",
//   name: "Mailtrap Test",
// };
// const recipients = [
//   {
//     email: "shittuibrahim092k@gmail.com",
//   }
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);
