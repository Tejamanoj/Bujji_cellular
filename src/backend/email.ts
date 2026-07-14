import nodemailer from 'nodemailer';

export async function sendOtpEmail(to: string, otp: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass || user.includes('your-') || pass.includes('your-')) {
    console.warn('⚠️ SMTP credentials not fully configured or contain placeholders. Using fallback console logging for OTP.');
    console.log(`\n==================================================`);
    console.log(`[EMAIL SIMULATOR]`);
    console.log(`To: ${to}`);
    console.log(`Subject: Bujji Cellulars Admin Login OTP`);
    console.log(`Message: Your OTP for admin login is: ${otp}`);
    console.log(`==================================================\n`);
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"Bujji Cellulars" <${user}>`,
    to,
    subject: 'Bujji Cellulars Admin Login OTP',
    text: `Your OTP for admin login is: ${otp}\n\nThis OTP expires in 5 minutes.\nDo not share this code with anyone.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #111; background-color: #000; color: #fff; border-radius: 12px; text-align: center;">
        <h2 style="color: #f59e0b; margin-bottom: 5px;">BUJJI CELLULARS</h2>
        <p style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 0;">Control Center Security</p>
        <div style="height: 1px; background-color: #27272a; margin: 20px 0;"></div>
        <p style="color: #d4d4d8; font-size: 14px;">Use the verification code below to authorize your admin login session:</p>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 6px; margin: 25px 0; color: #fbbf24; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #71717a; font-size: 11px; margin-top: 25px;">
          This OTP will expire in 5 minutes.<br>
          If you did not attempt this login, please contact security staff immediately.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err: any) {
    console.error('❌ Failed to send email via SMTP:', err);
    return { success: false, error: err.message };
  }
}
