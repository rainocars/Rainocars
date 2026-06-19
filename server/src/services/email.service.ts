import nodemailer from 'nodemailer';

export class EmailService {
  private static getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
      });
    }
    return null;
  }

  private static async sendMailHelper(to: string, subject: string, text: string, html: string) {
    // 1. Try Resend if API key is provided
    if (process.env.RESEND_API_KEY) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: `Raino Cars <${fromEmail}>`,
            to: [to],
            subject,
            text,
            html
          })
        });

        if (response.ok) {
          console.log(`✉️ Email successfully sent via Resend API to ${to}`);
          return;
        } else {
          const errData = await response.json().catch(() => ({}));
          console.error(`❌ Resend API failed: ${response.status}`, errData);
        }
      } catch (resendErr) {
        console.error('❌ Resend API exception:', resendErr);
      }
    }

    // 2. Fallback to Nodemailer SMTP
    const transporter = this.getTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Raino Cars" <${process.env.SMTP_USER}>`,
          to,
          subject,
          text,
          html
        });
        console.log(`✉️ Email successfully sent via SMTP to ${to}`);
      } catch (smtpErr) {
        console.error(`❌ SMTP Failed to send mail to ${to}:`, smtpErr);
        console.log(`\n---------------------------------------\n[MOCK FALLBACK] To: ${to}\nSubject: ${subject}\n---------------------------------------\n`);
      }
    } else {
      console.log(`\n---------------------------------------\n[MOCK EMAIL SERVICE] To: ${to}\nSubject: ${subject}\n---------------------------------------\n`);
    }
  }

  static async sendOtp(email: string, otp: string) {
    const message = `Your Raino Cars verification code is: ${otp}. It will expire in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #E50914; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 1px;">RAINO<span style="color: #ffffff; background-color: #E50914; padding: 2px 6px; border-radius: 4px; margin-left: 2px;">CARS</span></h2>
        </div>
        <p>Hello,</p>
        <p>To complete your security verification, please use the following One-Time Password (OTP):</p>
        <div style="font-size: 28px; font-weight: 800; text-align: center; letter-spacing: 6px; padding: 15px; background-color: #f7f7f7; border: 1px dashed #E50914; border-radius: 8px; margin: 20px 0; color: #111; font-family: monospace;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes. If you did not request this verification, you can safely ignore this email.</p>
        <p style="margin-top: 30px;">Drive the moment,<br/><strong>The Raino Cars Team</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">This is an automated security email. Please do not reply directly.</p>
      </div>
    `;
    await this.sendMailHelper(email, 'Raino Cars - Email Verification OTP', message, html);
  }

  static async sendWelcomeEmail(email: string, name: string) {
    const text = `Welcome to Raino Cars, ${name}! We're thrilled to have you as part of our premium car rental community. Browse our fleet and hit the road today!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #E50914; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 1px;">RAINO<span style="color: #ffffff; background-color: #E50914; padding: 2px 6px; border-radius: 4px; margin-left: 2px;">CARS</span></h2>
        </div>
        <h1 style="color: #333; font-size: 24px;">Welcome to the Driver's Seat, ${name}! 🎉</h1>
        <p>Thank you for registering with Raino Cars. We are dedicated to providing you with the ultimate premium car rental experience, combining a modern luxury fleet with seamless checkout and booking control.</p>
        <p>Here's how to get started:</p>
        <ul style="color: #555; line-height: 1.6;">
          <li><strong>Verify Your Documents:</strong> Upload your driver's license in your settings to speed up reservation approvals.</li>
          <li><strong>Browse Our Fleet:</strong> Explore modern hatchbacks, luxury sedans, and robust SUVs.</li>
          <li><strong>Flexible Booking:</strong> Choose home delivery or pickup options.</li>
        </ul>
        <p style="margin-top: 30px;">Drive the moment,<br/><strong>The Raino Cars Team</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">This is an automated welcome email from Raino Cars.</p>
      </div>
    `;
    await this.sendMailHelper(email, 'Welcome to Raino Cars! 🚗', text, html);
  }

  static async sendBookingConfirmation(email: string, bookingDetails: {
    id: string;
    carName: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    pickupLocation: string;
  }) {
    const text = `Your booking for ${bookingDetails.carName} has been confirmed. Dates: ${bookingDetails.startDate} to ${bookingDetails.endDate}. Total: ₹${bookingDetails.totalAmount}.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #E50914; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 1px;">RAINO<span style="color: #ffffff; background-color: #E50914; padding: 2px 6px; border-radius: 4px; margin-left: 2px;">CARS</span></h2>
        </div>
        <h1 style="color: #2e7d32; font-size: 22px;">Booking Confirmed! 🚗💨</h1>
        <p>Your booking is locked in. Here are the reservation details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Booking ID:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace;">${bookingDetails.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Car Model:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDetails.carName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Start Date:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDetails.startDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">End Date:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDetails.endDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Pickup Location:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDetails.pickupLocation}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #E50914;">Total Amount:</td>
            <td style="padding: 8px; font-weight: bold; color: #E50914;">₹${bookingDetails.totalAmount.toLocaleString()}</td>
          </tr>
        </table>
        <p>Our agent will get in touch with you shortly to coordinate handover details.</p>
        <p style="margin-top: 30px;">Safe travels,<br/><strong>The Raino Cars Team</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">Need to modify your booking? Visit your User Dashboard.</p>
      </div>
    `;
    await this.sendMailHelper(email, `Raino Cars - Booking Confirmed! [ID: ${bookingDetails.id}] 📅`, text, html);
  }

  static async sendPaymentSuccess(email: string, paymentDetails: {
    bookingId: string;
    paymentId: string;
    amount: number;
    method: string;
  }) {
    const text = `Your payment of ₹${paymentDetails.amount} for Booking ID ${paymentDetails.bookingId} was successful. Transaction ID: ${paymentDetails.paymentId}.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #E50914; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 1px;">RAINO<span style="color: #ffffff; background-color: #E50914; padding: 2px 6px; border-radius: 4px; margin-left: 2px;">CARS</span></h2>
        </div>
        <h1 style="color: #2e7d32; font-size: 22px;">Payment Successful! 🎉</h1>
        <p>We've received your payment. Here is your transaction receipt:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Booking ID:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace;">${paymentDetails.bookingId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Transaction ID:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace;">${paymentDetails.paymentId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Payment Method:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${paymentDetails.method}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #2e7d32;">Amount Paid:</td>
            <td style="padding: 8px; font-weight: bold; color: #2e7d32;">₹${paymentDetails.amount.toLocaleString()}</td>
          </tr>
        </table>
        <p style="margin-top: 30px;">Thank you for your business,<br/><strong>The Raino Cars Team</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">This is an automated system generated billing receipt.</p>
      </div>
    `;
    await this.sendMailHelper(email, 'Raino Cars - Payment Successful! 💳', text, html);
  }
}
