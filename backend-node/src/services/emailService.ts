import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

/**
 * Email Service - NoopEmailSender (Placeholder)
 *
 * IMPORTANT: This is a placeholder implementation for development.
 * In production, replace this with a real email service provider like:
 * - SendGrid
 * - AWS SES
 * - Mailgun
 * - Postmark
 * - etc.
 *
 * For now, this service logs confirmation links to the console instead
 * of sending actual emails.
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Generate email confirmation token
 * Creates a JWT token that can be used to confirm a user's email address
 */
export function generateConfirmationToken(userId: string): string {
  // Token expires in 24 hours
  return jwt.sign(
    { userId, type: 'email-confirmation' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify email confirmation token
 * Validates the token and returns the user ID if valid
 */
export function verifyConfirmationToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };

    if (decoded.type !== 'email-confirmation') {
      throw new Error('Invalid token type');
    }

    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Confirmation token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid confirmation token');
    }
    throw error;
  }
}

/**
 * Send email confirmation email
 *
 * PLACEHOLDER: In production, this would send an actual email.
 * For now, it logs the confirmation link to the console.
 */
export async function sendConfirmationEmail(email: string, token: string): Promise<void> {
  const confirmationLink = `${FRONTEND_URL}/confirm-email?token=${token}`;

  console.log('\n========================================');
  console.log('EMAIL CONFIRMATION (Development Mode)');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`Subject: Confirm your email address`);
  console.log(`\nConfirmation Link: ${confirmationLink}`);
  console.log('========================================\n');

  // TODO: In production, replace with actual email sending logic:
  // await emailProvider.send({
  //   to: email,
  //   subject: 'Confirm your email address',
  //   html: `<p>Click this link to confirm your email: <a href="${confirmationLink}">${confirmationLink}</a></p>`,
  // });
}

/**
 * Send password reset email
 *
 * PLACEHOLDER: In production, this would send an actual email.
 * For now, it logs the reset link to the console.
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  console.log('\n========================================');
  console.log('PASSWORD RESET (Development Mode)');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`Subject: Reset your password`);
  console.log(`\nReset Link: ${resetLink}`);
  console.log('========================================\n');

  // TODO: In production, replace with actual email sending logic:
  // await emailProvider.send({
  //   to: email,
  //   subject: 'Reset your password',
  //   html: `<p>Click this link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
  // });
}

/**
 * Send welcome email
 *
 * PLACEHOLDER: In production, this would send an actual email.
 * For now, it logs the welcome message to the console.
 */
export async function sendWelcomeEmail(email: string, username: string): Promise<void> {
  console.log('\n========================================');
  console.log('WELCOME EMAIL (Development Mode)');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`Subject: Welcome to DuoStackDemo!`);
  console.log(`\nHello ${username},\nWelcome to DuoStackDemo! We're excited to have you on board.`);
  console.log('========================================\n');

  // TODO: In production, replace with actual email sending logic:
  // await emailProvider.send({
  //   to: email,
  //   subject: 'Welcome to DuoStackDemo!',
  //   html: `<p>Hello ${username},</p><p>Welcome to DuoStackDemo! We're excited to have you on board.</p>`,
  // });
}
