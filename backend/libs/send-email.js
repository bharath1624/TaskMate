import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const fromEmail = process.env.EMAIL_USER;

export const sendEmail = async (to, subject, html) => {
    const msg = {
        from: `TaskMate <${fromEmail}>`,
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(msg);
        console.log("Email sent successfully");

        return true;
    } catch (error) {
        console.error("Error sending email:", error);

        return false;
    }
};
