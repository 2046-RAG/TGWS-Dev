'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

type FormState = 'idle' | 'sending' | 'success' | 'error';

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}

const initialData: ContactFormData = {
  name: '',
  email: '',
  company: '',
  phone: '',
  message: '',
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactPage() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState<ContactFormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [formState, setFormState] = useState<FormState>('idle');

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('required');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('required');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('invalidEmail');
    }
    if (!formData.message.trim()) {
      newErrors.message = t('required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setFormState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed');
      setFormState('success');
      setFormData(initialData);
    } catch {
      setFormState('error');
    }
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <section aria-label={t('title')}>
      <h1>{t('title')}</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="contact-name">{t('name')}</label>
          <input
            id="contact-name"
            type="text"
            aria-required="true"
            aria-invalid={!!errors.name}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && <span role="alert">{errors.name}</span>}
        </div>

        <div>
          <label htmlFor="contact-email">{t('email')}</label>
          <input
            id="contact-email"
            type="email"
            aria-required="true"
            aria-invalid={!!errors.email}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && <span role="alert">{errors.email}</span>}
        </div>

        <div>
          <label htmlFor="contact-company">{t('company')}</label>
          <input
            id="contact-company"
            type="text"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="contact-phone">{t('phone')}</label>
          <input
            id="contact-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="contact-message">{t('message')}</label>
          <textarea
            id="contact-message"
            aria-required="true"
            aria-invalid={!!errors.message}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
          />
          {errors.message && <span role="alert">{errors.message}</span>}
        </div>

        <button type="submit" disabled={formState === 'sending'}>
          {formState === 'sending' ? (
            <>
              <Loader2 className="animate-spin" />
              {t('sending')}
            </>
          ) : formState === 'success' ? (
            t('success')
          ) : (
            t('submit')
          )}
        </button>

        {formState === 'error' && <span role="alert">{t('error')}</span>}
      </form>

      <aside aria-label="offices">
        <h2>{t('offices')}</h2>
      </aside>
    </section>
  );
}
