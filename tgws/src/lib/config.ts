/**
 * Centralized site configuration.
 *
 * Reads contact / social link constants from environment variables so they
 * can be overridden per-deployment (e.g. staging vs. production), while
 * providing sensible fallbacks so local development works without any
 * `.env.local` setup.
 *
 * Add new shared brand constants here instead of hardcoding them inside
 * individual components — see PRD [S2.5] security/safety: keep PII-handling
 * URLs in one place so they can be audited and rotated easily.
 */

const FALLBACK_SUPPORT_EMAIL = 'Inquiries@techguru-it.asia';
const FALLBACK_CONTACT_PHONE = '+63 960 282 5051';
const FALLBACK_WHATSAPP_URL = 'https://wa.me/639602825051';
const FALLBACK_LINKEDIN_URL =
  'https://www.linkedin.com/company/techguru-network-data-solutions';

function readEnv(name: string): string | undefined {
  // Type-safe wrapper to read `process.env` without leaking `any`.
  // Returning `undefined` lets callers apply their own fallback.
  const value = process.env[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Support / inquiries email address used in legal pages, contact forms,
 * and structured data. Override with `SUPPORT_EMAIL` env var.
 */
export const SUPPORT_EMAIL: string =
  readEnv('SUPPORT_EMAIL') ?? FALLBACK_SUPPORT_EMAIL;

/**
 * Public contact phone number (E.164-style display format). Override with
 * `CONTACT_PHONE` env var.
 */
export const CONTACT_PHONE: string =
  readEnv('CONTACT_PHONE') ?? FALLBACK_CONTACT_PHONE;

/**
 * WhatsApp click-to-chat URL. Override with `WHATSAPP_URL` env var.
 */
export const WHATSAPP_URL: string =
  readEnv('WHATSAPP_URL') ?? FALLBACK_WHATSAPP_URL;

/**
 * LinkedIn company page URL. Override with `LINKEDIN_URL` env var.
 */
export const LINKEDIN_URL: string =
  readEnv('LINKEDIN_URL') ?? FALLBACK_LINKEDIN_URL;

/**
 * Readonly aggregate of all site-wide config constants — handy when a
 * caller needs to pass the full config bundle (e.g. JSON-LD builders).
 */
export interface SiteConfig {
  readonly supportEmail: string;
  readonly contactPhone: string;
  readonly whatsappUrl: string;
  readonly linkedinUrl: string;
}

export const siteConfig: Readonly<SiteConfig> = Object.freeze({
  supportEmail: SUPPORT_EMAIL,
  contactPhone: CONTACT_PHONE,
  whatsappUrl: WHATSAPP_URL,
  linkedinUrl: LINKEDIN_URL,
});
