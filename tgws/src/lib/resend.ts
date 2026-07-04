import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_ADDRESS = 'TechGuru Support <support@techguru-it.asia>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.techguru-it.asia';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams) {
  const client = getResend();
  if (!client) {
    console.log('[Email] Resend not configured, skipping:', subject);
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const { data, error } = await client.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Email] Send failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Email] Send exception:', err);
    return { success: false, error: String(err) };
  }
}

// 1. Ticket created confirmation
export async function sendTicketCreatedEmail(
  to: string,
  ticketNumber: string,
  subject: string,
  category: string
) {
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  return sendEmail({
    to,
    subject: `Ticket ${ticketNumber} Created`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00D4FF;">Ticket Submitted Successfully</h2>
        <p>Your support ticket has been created and our team will review it shortly.</p>
        <div style="background: #FAFAFA; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
          <p><strong>Category:</strong> ${categoryLabel}</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        <p>You can track your ticket status at:</p>
        <a href="${SITE_URL}/en/support" style="color: #00D4FF;">View Ticket</a>
        <hr style="border: none; border-top: 1px solid #F4F4F5; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">TechGuru Network & Data Solutions</p>
      </div>
    `,
  });
}

// 2. Ticket status changed notification
export async function sendTicketStatusEmail(
  to: string,
  ticketNumber: string,
  oldStatus: string,
  newStatus: string
) {
  const statusLabels: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  return sendEmail({
    to,
    subject: `Ticket ${ticketNumber} Status Updated: ${statusLabels[newStatus] || newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00D4FF;">Ticket Status Updated</h2>
        <p>Your ticket status has been changed.</p>
        <div style="background: #FAFAFA; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
          <p><strong>Previous Status:</strong> ${statusLabels[oldStatus] || oldStatus}</p>
          <p><strong>New Status:</strong> ${statusLabels[newStatus] || newStatus}</p>
        </div>
        <a href="${SITE_URL}/en/support" style="color: #00D4FF;">View Ticket</a>
        <hr style="border: none; border-top: 1px solid #F4F4F5; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">TechGuru Network & Data Solutions</p>
      </div>
    `,
  });
}

// 3. Password reset email (custom template)
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00D4FF;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to set a new password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #00D4FF; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email. The link expires in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #F4F4F5; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">TechGuru Network & Data Solutions</p>
      </div>
    `,
  });
}
