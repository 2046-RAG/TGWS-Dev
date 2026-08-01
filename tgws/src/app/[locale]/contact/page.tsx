'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Loader2, MapPin, Mail, Phone, MessageCircle, Briefcase, QrCode } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import QRCode from '@/components/ui/QRCode';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const t = useTranslations('contact');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = t('required');
    if (!email.trim()) {
      newErrors.email = t('required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('invalidEmail');
    }
    if (!message.trim()) newErrors.message = t('required');
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, phone, message }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setName('');
      setEmail('');
      setCompany('');
      setPhone('');
      setMessage('');
      setErrors({});
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Breadcrumb items={[{ label: t('title') }]} />
      <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
        <a
          href="#contact-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#00D4FF] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
      >
        {t('skipToForm')}
      </a>

      <div className="text-center mb-16">
        <h1 className="section-title text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="section-subtitle mx-auto">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div id="contact-form" className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-8 space-y-6 shadow-sm"
            aria-label={t('title')}
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('name')} *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`w-full bg-gray-50 dark:bg-zinc-800 border ${
                    errors.name ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'
                  } rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors`}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-sm text-red-500" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('email')} *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full bg-gray-50 dark:bg-zinc-800 border ${
                    errors.email ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'
                  } rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors`}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-red-500" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company" className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('company')}
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t('companyPlaceholder')}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm text-gray-700 mb-1.5">
                  {t('phone')}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm text-gray-700 mb-1.5">
                {t('message')} *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('messagePlaceholder')}
                rows={5}
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'message-error' : undefined}
                className={`w-full bg-gray-50 dark:bg-zinc-800 border ${
                  errors.message ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'
                } rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors resize-none`}
              />
              {errors.message && (
                <p id="message-error" className="mt-1.5 text-sm text-red-500" role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            <div aria-live="polite">
              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-600 text-sm mb-4">
                  {t('success')}
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm mb-4">
                  {t('error')}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('sending')}
                </>
              ) : (
                <>
                  <Send size={18} />
                  {t('submit')}
                </>
              )}
            </button>
          </form>
        </div>

        <aside className="space-y-8">
          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('offices')}</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#00D4FF] mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-gray-900 dark:text-white font-medium">{t('taipei')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('taipeiAddr')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#7B61FF] mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-gray-900 dark:text-white font-medium">{t('hongKong')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('hongKongAddr')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white p-8 pb-4">{t('mapTitle')}</h2>
            <div className="relative w-full h-64">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=121.045%2C14.645%2C121.055%2C14.655&layer=mapnik&marker=14.6497%2C121.0501"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('mapTitle')}
              />
            </div>
            <a
              href="https://www.openstreetmap.org/?mlat=14.6497&mlon=121.0501#map=16/14.6497/121.0501"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-[#00D4FF] hover:underline py-3 min-h-[44px] flex items-center justify-center"
            >
              {t('viewLargerMap')}
            </a>
          </div>

          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('social')}</h2>
            <div className="space-y-3">
              <a href={`mailto:${t('emailAddress')}`} className="flex items-center gap-3 py-2 px-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] transition-colors">
                <Mail size={18} className="text-[#00D4FF] shrink-0" />
                <span className="text-sm">{t('emailAddress')}</span>
              </a>
              <a href={`tel:${t('phoneNumber').replace(/\s/g, '')}`} className="flex items-center gap-3 py-2 px-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] transition-colors">
                <Phone size={18} className="text-[#7B61FF] shrink-0" />
                <span className="text-sm">{t('phoneNumber')}</span>
              </a>
              <a
                href="https://wa.me/639602825051"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2 px-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] transition-colors"
              >
                <MessageCircle size={18} className="text-[#22C55E] shrink-0" />
                <span className="text-sm">{t('whatsappCta')}</span>
              </a>
              <a
                href="https://www.linkedin.com/company/techguru-network-data-solutions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2 px-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] transition-colors"
              >
                <Briefcase size={18} className="text-[#0077B5] shrink-0" />
                <span className="text-sm">{t('linkedin')}</span>
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('scanToConnect')}</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <QRCode value="https://wa.me/639602825051" size={120} alt="WhatsApp QR Code" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">WhatsApp</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('scanQrHint')}</p>
            </div>
          </div>
        </aside>
      </div>
      </section>
    </>
  );
}
