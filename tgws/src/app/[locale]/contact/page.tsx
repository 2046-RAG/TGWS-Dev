'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Loader2, MapPin, Mail, Phone } from 'lucide-react';

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
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <a
        href="#contact-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#00D4FF] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
      >
        {t('skipToForm')}
      </a>

      <div className="text-center mb-16">
        <h1 className="section-title text-gray-900">{t('title')}</h1>
        <p className="section-subtitle mx-auto">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div id="contact-form" className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-sm"
            aria-label={t('title')}
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm text-gray-700 mb-1.5">
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
                  className={`w-full bg-gray-50 border ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  } rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors`}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-sm text-red-500" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 mb-1.5">
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
                  className={`w-full bg-gray-50 border ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  } rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors`}
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
                <label htmlFor="company" className="block text-sm text-gray-700 mb-1.5">
                  {t('company')}
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t('companyPlaceholder')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors"
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors"
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
                className={`w-full bg-gray-50 border ${
                  errors.message ? 'border-red-500' : 'border-gray-200'
                } rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors resize-none`}
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
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] text-white font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('offices')}</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#00D4FF] mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-gray-900 font-medium">{t('taipei')}</h3>
                  <p className="text-sm text-gray-600">{t('taipeiAddr')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#7B61FF] mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-gray-900 font-medium">{t('hongKong')}</h3>
                  <p className="text-sm text-gray-600">{t('hongKongAddr')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('social')}</h2>
            <div className="space-y-3">
              <a href="mailto:info@techguru.com" className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors">
                <Mail size={18} className="text-[#00D4FF]" />
                <span className="text-sm">info@techguru.com</span>
              </a>
              <a href="tel:+886223456789" className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors">
                <Phone size={18} className="text-[#7B61FF]" />
                <span className="text-sm">+886 2-2345-6789</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
