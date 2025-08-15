import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import envConfig from "../configs/env.js";

class EmailService {
    constructor() {
        // Configure nodemailer transport
        this.transport = nodemailer.createTransport({
            host: envConfig.mailtrap.host,
            port: envConfig.mailtrap.port,
            auth: {
                user: envConfig.mailtrap.user,
                pass: envConfig.mailtrap.pass,
            },
        });

        // Configure Mailgen for email templates
        this.mailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "Task Management System",
                link: "https://taskmanagementsystem.com",
            },
        });
    }

    /**
     * Generate email HTML using Mailgen.
     * @param {Object} body - Mailgen body configuration
     * @returns {string} HTML email
     */
    generateEmail(body) {
        return this.mailGenerator.generate({ body });
    }

    /**
     * Send an email using nodemailer.
     * @param {Object} emailOptions - Nodemailer options
     */
    async sendEmail(emailOptions) {
        try {
            const info = await this.transport.sendMail(emailOptions);
            console.log(`Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error("Error sending email:", error);
            throw new Error("Failed to send email");
        }
    }

    /**
     * Generate a welcome email.
     * @param {string} userName 
     * @param {string} userEmail 
     * @param {string} verifyEmailLink 
     * @returns {Object} Email options
     */
    generateWelcomeEmail(userName, userEmail, verifyEmailLink) {
        const body = {
            name: userName,
            intro: "Welcome to our platform! We're glad to have you.",
            action: {
                instructions: "To get started with your account, please click the button below:",
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: verifyEmailLink,
                },
            },
            outro: "Need help? Contact our support team.",
        };

        return {
            to: userEmail,
            subject: "Welcome to Our Platform!",
            html: this.generateEmail(body),
        };
    }

    /**
     * Generate a password reset email.
     * @param {string} userName 
     * @param {string} userEmail 
     * @param {string} resetPasswordLink 
     * @returns {Object} Email options
     */
    generatePasswordResetEmail(userName, userEmail, resetPasswordLink) {
        const body = {
            name: userName,
            intro: "You requested a password reset.",
            action: {
                instructions: "To reset your password, please click the button below:",
                button: {
                    color: "#22BC66",
                    text: "Reset Password",
                    link: resetPasswordLink,
                },
            },
            outro: "If you didn't request a password reset, please ignore this email.",
        };

        return {
            to: userEmail,
            subject: "Password Reset Request",
            html: this.generateEmail(body),
        };
    }
}

// Export a singleton instance for easy reuse
export const emailService = new EmailService();