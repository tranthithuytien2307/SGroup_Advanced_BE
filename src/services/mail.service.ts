import nodemailer from "nodemailer";

class MailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendVerificationEmail(email: string, code: string) {
    const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email?email=${email}&code=${code}`;

    const mailOptions = {
      from: ` <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Xác nhận đăng ký tài khoản",
      html: `
        <h3>Xin chào!</h3>
        <p>Vui lòng bấm vào liên kết dưới đây để xác nhận tài khoản của bạn:</p>
        <a href="${verifyLink}" target="_blank">${verifyLink}</a>
        <br><br>
        <p>Liên kết này chỉ có hiệu lực trong 24h.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async sendEmail(to: string, resetLink: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Password Reset Request",
      html: `
      <h2>Password Reset Request</h2>
      <p>Click the button below to reset your password. This link will expire in <b>15 minutes</b>.</p>
      <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
      `,
    });
  }
}

export default new MailService();
