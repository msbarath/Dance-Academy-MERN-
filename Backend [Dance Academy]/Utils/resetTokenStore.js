const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendPasswordResetEmail(to, token) {
    // CLIENT_URL may be a comma-separated list of allowed origins; always use the first one.
    const clientOrigin = (process.env.CLIENT_URL || "http://localhost:3000").split(",")[0].trim();
    const resetUrl = `${clientOrigin}/reset-password?token=${token}`;
    await transporter.sendMail({
        from:    process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: "Password Reset Request",
        text:    `Use this link to reset your password (expires in 15 minutes):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
        html:    `<p>Use this link to reset your password (expires in 15 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, ignore this email.</p>`,
    });
}

module.exports = { sendPasswordResetEmail };
