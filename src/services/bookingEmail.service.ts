import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { config } from '../config/env.config';
import { IBooking } from '../models/booking.model';
import { ICounselor } from '../models/counselor.model';

class BookingEmailService {
  private sesClient: SESClient | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeSES();
  }

  private initializeSES() {
    try {
      if (!config.AWS_SES_FROM_EMAIL) {
        console.warn('⚠️  AWS SES not configured. Booking emails will not be sent.');
        return;
      }

      this.sesClient = new SESClient({
        region: process.env.AWS_SES_REGION || 'us-east-1',
      });

      this.isConfigured = true;
      console.log('✅ AWS SES initialized for booking emails');
    } catch (error) {
      console.error('❌ Failed to initialize AWS SES:', error);
    }
  }

  async sendBookingConfirmation(
    booking: IBooking,
    counselor: ICounselor
  ): Promise<boolean> {
    if (!this.isConfigured || !this.sesClient) {
      console.log('⏭️  Skipping booking confirmation email (SES not configured)');
      return false;
    }

    try {
      const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const subject = `Booking Confirmation - ${counselor.fullName}`;
      const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmed!</h1>
    </div>
    <div class="content">
      <p>Dear ${booking.guestName},</p>
      <p>Your counseling session has been successfully booked. Here are your booking details:</p>

      <div class="details">
        <h3>Booking Details</h3>
        <p><strong>Counselor:</strong> ${counselor.fullName}</p>
        <p><strong>Title:</strong> ${counselor.title}</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${booking.bookingTime}</p>
        <p><strong>Duration:</strong> ${booking.duration} minutes</p>
        <p><strong>Session Type:</strong> ${booking.sessionType === 'online' ? 'Online' : 'In-Person'}</p>
        ${booking.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${booking.meetingLink}">${booking.meetingLink}</a></p>` : ''}
        ${booking.reasonForBooking ? `<p><strong>Reason:</strong> ${booking.reasonForBooking}</p>` : ''}
      </div>

      <p>Please arrive/join 5-10 minutes before your scheduled time.</p>

      ${booking.sessionType === 'online' && booking.meetingLink ? `
      <p style="text-align: center; margin: 20px 0;">
        <a href="${booking.meetingLink}" class="button">Join Meeting</a>
      </p>
      ` : ''}

      <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>

      <p>We look forward to seeing you!</p>

      <p>Best regards,<br>${config.AWS_SES_FROM_NAME || 'Why Designers'}</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>For support, contact us at ${config.AWS_SES_FROM_EMAIL}</p>
    </div>
  </div>
</body>
</html>
      `;

      const textBody = `
Booking Confirmed!

Dear ${booking.guestName},

Your counseling session has been successfully booked.

Booking Details:
- Counselor: ${counselor.fullName}
- Title: ${counselor.title}
- Date: ${bookingDate}
- Time: ${booking.bookingTime}
- Duration: ${booking.duration} minutes
- Session Type: ${booking.sessionType === 'online' ? 'Online' : 'In-Person'}
${booking.meetingLink ? `- Meeting Link: ${booking.meetingLink}` : ''}
${booking.reasonForBooking ? `- Reason: ${booking.reasonForBooking}` : ''}

Please arrive/join 5-10 minutes before your scheduled time.

If you need to cancel or reschedule, please contact us as soon as possible.

We look forward to seeing you!

Best regards,
${config.AWS_SES_FROM_NAME || 'Why Designers'}
      `;

      const command = new SendEmailCommand({
        Source: `${config.AWS_SES_FROM_NAME} <${config.AWS_SES_FROM_EMAIL}>`,
        Destination: {
          ToAddresses: [booking.guestEmail],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.sesClient.send(command);
      console.log(`✅ Booking confirmation email sent to: ${booking.guestEmail}`);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send booking confirmation email:', error.message);
      return false;
    }
  }

  async sendBookingReminder(
    booking: IBooking,
    counselor: ICounselor
  ): Promise<boolean> {
    if (!this.isConfigured || !this.sesClient) {
      console.log('⏭️  Skipping booking reminder email (SES not configured)');
      return false;
    }

    try {
      const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const subject = `Reminder: Upcoming Session with ${counselor.fullName}`;
      const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
    .button { display: inline-block; padding: 10px 20px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Session Reminder</h1>
    </div>
    <div class="content">
      <p>Dear ${booking.guestName},</p>
      <p>This is a friendly reminder about your upcoming counseling session:</p>

      <div class="details">
        <h3>Session Details</h3>
        <p><strong>Counselor:</strong> ${counselor.fullName}</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${booking.bookingTime}</p>
        <p><strong>Duration:</strong> ${booking.duration} minutes</p>
        <p><strong>Session Type:</strong> ${booking.sessionType === 'online' ? 'Online' : 'In-Person'}</p>
        ${booking.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${booking.meetingLink}">${booking.meetingLink}</a></p>` : ''}
      </div>

      <p>Please join/arrive 5-10 minutes before your scheduled time.</p>

      ${booking.sessionType === 'online' && booking.meetingLink ? `
      <p style="text-align: center; margin: 20px 0;">
        <a href="${booking.meetingLink}" class="button">Join Meeting</a>
      </p>
      ` : ''}

      <p>We look forward to seeing you!</p>

      <p>Best regards,<br>${config.AWS_SES_FROM_NAME || 'Why Designers'}</p>
    </div>
    <div class="footer">
      <p>This is an automated reminder. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
      `;

      const command = new SendEmailCommand({
        Source: `${config.AWS_SES_FROM_NAME} <${config.AWS_SES_FROM_EMAIL}>`,
        Destination: {
          ToAddresses: [booking.guestEmail],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.sesClient.send(command);
      console.log(`✅ Booking reminder email sent to: ${booking.guestEmail}`);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send booking reminder email:', error.message);
      return false;
    }
  }

  async sendBookingCancellation(
    booking: IBooking,
    counselor: ICounselor
  ): Promise<boolean> {
    if (!this.isConfigured || !this.sesClient) {
      console.log('⏭️  Skipping booking cancellation email (SES not configured)');
      return false;
    }

    try {
      const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const subject = `Booking Cancelled - ${counselor.fullName}`;
      const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Cancelled</h1>
    </div>
    <div class="content">
      <p>Dear ${booking.guestName},</p>
      <p>Your counseling session has been cancelled.</p>

      <div class="details">
        <h3>Cancelled Booking</h3>
        <p><strong>Counselor:</strong> ${counselor.fullName}</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${booking.bookingTime}</p>
        ${booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : ''}
      </div>

      <p>If you would like to reschedule, please visit our website to book a new appointment.</p>

      <p>We apologize for any inconvenience.</p>

      <p>Best regards,<br>${config.AWS_SES_FROM_NAME || 'Why Designers'}</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
      `;

      const command = new SendEmailCommand({
        Source: `${config.AWS_SES_FROM_NAME} <${config.AWS_SES_FROM_EMAIL}>`,
        Destination: {
          ToAddresses: [booking.guestEmail],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.sesClient.send(command);
      console.log(`✅ Booking cancellation email sent to: ${booking.guestEmail}`);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send booking cancellation email:', error.message);
      return false;
    }
  }
}

export default new BookingEmailService();
