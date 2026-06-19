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
        }
      });
    }
    return null;
  }

  static async sendOtp(email: string, otp: string) {
    const transporter = this.getTransporter();
    const message = `Your Raino Cars verification code is: ${otp}. It will expire in 10 minutes.`;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Raino Cars" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Raino Cars - Email Verification OTP',
          text: message,
          html: `
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
          `
        });
        console.log(`✉️ OTP email successfully sent to ${email}`);
      } catch (err) {
        console.error(`❌ SMTP Failed to send mail:`, err);
        console.log(`\n---------------------------------------\n[MOCK FALLBACK] OTP for ${email}: ${otp}\n---------------------------------------\n`);
      }
    } else {
      console.log(`\n---------------------------------------\n[MOCK EMAIL SERVICE] OTP for ${email}: ${otp}\n---------------------------------------\n`);
    }
  }

  static async sendWelcomeEmail(email: string, name: string) {
    const transporter = this.getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"Raino Cars" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to Raino Cars! 🚗',
        text: `Welcome to Raino Cars, ${name}! We're thrilled to have you as part of our premium car rental community. Browse our fleet and hit the road today!`,
        html: `
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
        `
      });
      console.log(`✉️ Welcome email successfully sent to ${email}`);
    } else {
      console.log(`\n---------------------------------------\n[MOCK EMAIL SERVICE] Welcome Email for ${name} (${email})\n---------------------------------------\n`);
    }
  }

  static async sendBookingConfirmation(email: string, bookingDetails: {
    id: string;
    carName: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    pickupLocation: string;
  }) {
    const transporter = this.getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"Raino Cars" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Raino Cars - Booking Confirmed! [ID: ${bookingDetails.id}] 📅`,
        text: `Your booking for ${bookingDetails.carName} has been confirmed. Dates: ${bookingDetails.startDate} to ${bookingDetails.endDate}. Total: ₹${bookingDetails.totalAmount}.`,
        html: `
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
        `
      });
      console.log(`✉️ Booking confirmation email successfully sent to ${email}`);
    } else {
      console.log(`\n---------------------------------------\n[MOCK EMAIL SERVICE] Booking Confirmed Email for ${email}\nDetails: ${JSON.stringify(bookingDetails)}\n---------------------------------------\n`);
    }
  }

  static async sendPaymentSuccess(email: string, paymentDetails: {
    bookingId: string;
    paymentId: string;
    amount: number;
    method: string;
  }) {
    const transporter = this.getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"Raino Cars" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Raino Cars - Payment Successful! 💳',
        text: `Your payment of ₹${paymentDetails.amount} for Booking ID ${paymentDetails.bookingId} was successful. Transaction ID: ${paymentDetails.paymentId}.`,
        html: `
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
        `
      });
      console.log(`✉️ Payment success email successfully sent to ${email}`);
    } else {
      console.log(`\n---------------------------------------\n[MOCK EMAIL SERVICE] Payment Success Email for ${email}\nDetails: ${JSON.stringify(paymentDetails)}\n---------------------------------------\n`);
    }
  }
}
