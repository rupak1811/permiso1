const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this._initializeTransporter();
  }

  _initializeTransporter() {
    try {
      // Get SMTP configuration from environment variables
      const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };

      // Only create transporter if credentials are available
      if (smtpConfig.auth.user && smtpConfig.auth.pass) {
        this.transporter = nodemailer.createTransport(smtpConfig);
        console.log('Email service initialized successfully');
      } else {
        console.warn('Email service not configured: SMTP credentials missing');
      }
    } catch (error) {
      console.error('Error initializing email service:', error);
      this.transporter = null;
    }
  }

  async sendEmail({ from, to, subject, text, html, replyTo, headers }) {
    if (!this.transporter) {
      throw new Error('Email service is not configured. Please set SMTP environment variables.');
    }

    try {
      const mailOptions = {
        from: from || process.env.SMTP_USER,
        to: to,
        subject: subject,
        text: text,
        html: html,
        replyTo: replyTo || from,
        headers: headers || {}
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendContactEmail({ fromEmail, fromName, message, subject }) {
    // Get contact email from environment variable or use default
    const contactEmail = process.env.CONTACT_EMAIL || 'rupakchimakurthi1811@gmail.com';
    const smtpUser = process.env.SMTP_USER;
    
    // Use SMTP user as the sender to ensure proper authentication
    // This helps emails land in primary inbox instead of spam
    const senderEmail = smtpUser || fromEmail;
    const senderName = 'Permiso Platform';
    
    // Permiso logo SVG (base64 encoded for email compatibility)
    const permisoLogo = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #0a2540 0%, #2563eb 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 0.15em; font-family: 'Arial', sans-serif;">PERMISO</h1>
        </div>
      </div>
    `;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; }
            .content-box { padding: 20px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; line-height: 1.6; color: #333333;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa; padding: 20px 0;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table role="presentation" class="container" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0a2540 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 0.15em; font-family: 'Arial', sans-serif;">PERMISO</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; font-weight: 400;">Permit Management Platform</p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td class="content-box" style="padding: 40px 30px;">
                    <h2 style="color: #0a2540; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">You have received a new inquiry</h2>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 25px; border-radius: 8px; margin: 25px 0;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600; width: 100px;">From:</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${fromName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Email:</td>
                          <td style="padding: 8px 0; color: #2563eb; font-size: 14px; text-decoration: none;">${fromEmail}</td>
                        </tr>
                        ${subject ? `
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Subject:</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${subject}</td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>
                    
                    <div style="margin: 30px 0;">
                      <h3 style="color: #0a2540; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Message:</h3>
                      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                        This message was sent through the Permiso Platform contact form.<br>
                        <strong>Reply directly to this email</strong> to respond to ${fromName}.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      © ${new Date().getFullYear()} Permiso Platform. All rights reserved.<br>
                      <span style="color: #6b7280;">AI-powered permit management and automation system</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
PERMISO PLATFORM
Permit Management Platform

You have received a new inquiry

From: ${fromName}
Email: ${fromEmail}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}

---
This message was sent through the Permiso Platform contact form.
Reply directly to this email to respond to ${fromName}.

© ${new Date().getFullYear()} Permiso Platform. All rights reserved.
AI-powered permit management and automation system
    `;

    return await this.sendEmail({
      from: `"${senderName}" <${senderEmail}>`, // Use authenticated SMTP email as sender
      to: contactEmail,
      subject: subject || `Contact Form: ${fromName}`,
      text: text,
      html: html,
      replyTo: `"${fromName}" <${fromEmail}>`, // Reply-To set to user's email
      headers: {
        'X-Mailer': 'Permiso Platform',
        'X-Priority': '1',
        'Importance': 'normal',
        'Message-ID': `<${Date.now()}-${Math.random().toString(36).substring(7)}@permiso-platform>`
      }
    });
  }
}

module.exports = new EmailService();

