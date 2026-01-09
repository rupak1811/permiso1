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
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px;">
          <h2 style="color: #0a2540; margin-top: 0;">New Contact Form Submission</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0a2540;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject || 'Contact Form Inquiry'}</p>
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 15px 0;">
            <p style="margin: 10px 0 5px 0;"><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6; margin: 0;">${message}</p>
          </div>
          <p style="color: #6c757d; font-size: 12px; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
            This email was sent from the Permiso Platform contact form.<br>
            Reply to this email to respond directly to ${fromName}.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
New Contact Form Submission

From: ${fromName} (${fromEmail})
Subject: ${subject || 'Contact Form Inquiry'}

Message:
${message}

---
This email was sent from the Permiso Platform contact form.
Reply to this email to respond directly to ${fromName}.
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

