'use client';

import { useState, useRef } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, Upload } from 'lucide-react';

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export default function TicketForm() {
  const t = useTranslations('auth');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    category: '',
    product: '',
    subject: '',
    description: '',
  });

  const { clear } = useAutoSave('ticket-form-draft', formData);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const uploadFiles = async (ticketId: string, files: FileList) => {
    const results: UploadedFile[] = [];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append('file', file);
      form.append('ticketId', ticketId);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const data = await res.json();
        results.push(data.data);
      }
    }
    return results;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: formData.category,
        productService: formData.product,
        subject: formData.subject,
        description: formData.description,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || 'Failed to create ticket');
      setLoading(false);
      return;
    }

    const data = await response.json();
    const newTicketId = data.data?.id;
    setTicketId(newTicketId);

    const files = fileInputRef.current?.files;
    if (files && files.length > 0 && newTicketId) {
      setUploading(true);
      const uploaded = await uploadFiles(newTicketId, files);
      setUploadedFiles(uploaded);
      setUploading(false);
    }

    setSuccess(true);
    clear();
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('ticketSubmitted')}</h3>
        <p className="text-gray-600">{t('ticketSubmittedDesc')}</p>
        {ticketId && (
          <p className="text-sm text-gray-500 mt-3">{t('ticketNumber')}: {ticketId.slice(0, 8)}</p>
        )}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
            <ul className="space-y-1">
              {uploadedFiles.map((f, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                  <Upload size={12} />
                  {f.name} ({(f.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-sm">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="ticket-category" className="block text-sm text-gray-700 mb-2">
          {t('category')} *
        </label>
        <select
          id="ticket-category"
          name="category"
          required
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-colors"
        >
          <option value="">{t('selectCategory')}</option>
          <option value="build">{t('build')}</option>
          <option value="run">{t('run')}</option>
          <option value="protect">{t('protect')}</option>
        </select>
      </div>

      <div>
        <label htmlFor="ticket-product" className="block text-sm text-gray-700 mb-2">
          {t('productService')} *
        </label>
        <input
          id="ticket-product"
          type="text"
          name="product"
          required
          value={formData.product}
          onChange={(e) => handleChange('product', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-colors"
          placeholder="e.g. Proxmox VE, NGFW, Cloud Platform"
        />
      </div>

      <div>
        <label htmlFor="ticket-subject" className="block text-sm text-gray-700 mb-2">
          {t('subject')} *
        </label>
        <input
          id="ticket-subject"
          type="text"
          name="subject"
          required
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-colors"
          placeholder="Brief description of your issue"
        />
      </div>

      <div>
        <label htmlFor="ticket-description" className="block text-sm text-gray-700 mb-2">
          {t('description')} *
        </label>
        <textarea
          id="ticket-description"
          name="description"
          required
          rows={6}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-colors resize-none"
          placeholder="Detailed description of your issue..."
        />
      </div>

      <div>
        <label htmlFor="ticket-attachments" className="block text-sm text-gray-700 mb-2">
          {t('attachments')}
        </label>
        <input
          ref={fileInputRef}
          id="ticket-attachments"
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:hover:bg-gray-200 file:cursor-pointer"
        />
        <p className="text-xs text-gray-400 mt-1">Max 10MB per file. Supported: images, PDF, Word</p>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] text-white font-medium py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading || uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {uploading ? 'Uploading files...' : t('submitting')}
          </>
        ) : (
          t('submitTicket')
        )}
      </button>
    </form>
  );
}
