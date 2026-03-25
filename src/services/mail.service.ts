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
  async sendEmail(to: string, resetToken: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Your Password Reset OTP Code",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        
        <p>You requested to reset your password.</p>
        <p>Please enter the OTP code below on the website to continue:</p>
        
        <div style="
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 4px;
          text-align: center;
          padding: 15px;
          margin: 20px 0;
          background: #f4f6f8;
          border-radius: 8px;
          color: #007bff;
        ">
          ${resetToken}
        </div>

        <p>This code will expire in <b>5 minutes</b>.</p>

        <p style="color: #888; font-size: 13px;">
          If you did not request a password reset, please ignore this email.
        </p>
      </div>
    `,
    });
  }

  async sendInvitationEmail(
    email: string,
    token: string,
    workspaceName: string,
  ) {
    const link = `${process.env.BASE_URL}/api/workspace-member/invite/accept?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invitation to join workspace ${workspaceName}`,
      html: `
      <h3>Bạn được mời tham gia workspace: <b>${workspaceName}</b></h3>
      <p>Click vào link bên dưới để chấp nhận:</p>
      <a href="${link}" target="_blank" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
        Join Workspace
      </a>
      <p>Nếu button không hoạt động, hãy copy link sau vào trình duyệt:</p>
      <p>${link}</p>
    `,
    });
  }

  async sendInvitationEmailForBoard(
    email: string,
    token: string,
    boardName: string,
  ) {
    const link = `${process.env.BASE_URL}/api/board/invite-email/accept?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invitation to join workspace ${boardName}`,
      html: `
      <h3>Bạn được mời tham gia workspace: <b>${boardName}</b></h3>
      <p>Click vào link bên dưới để chấp nhận:</p>
      <a href="${link}" target="_blank" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
        Join Workspace
      </a>
      <p>Nếu button không hoạt động, hãy copy link sau vào trình duyệt:</p>
      <p>${link}</p>
    `,
    });
  }
}

export default new MailService();
