import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    // 🔴 HARD VALIDATION
    if (!to) {
      throw new Error("Recipient email (to) is missing");
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS not set in .env");
    }

    // 📧 CREATE TRANSPORTER
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password only
      },
      tls: {
        rejectUnauthorized: false, // prevent cert issues (safe for Gmail)
      },
    });

    // 🔍 VERIFY SMTP CONNECTION (IMPORTANT)
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    // 📩 SEND EMAIL
    await transporter.sendMail({
      from: `"Dawa Dost" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email successfully sent to:", to);
  } catch (error) {
    console.error("❌ Email sending failed:");
    console.error(error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
