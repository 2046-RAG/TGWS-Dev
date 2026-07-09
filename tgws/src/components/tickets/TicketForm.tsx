'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface SanityProduct {
  _id: string;
  title: string;
  category: string;
}

interface PastedImage {
  file: File;
  preview: string;
}

const DESCRIPTION_MAX = 800;

export default function TicketForm() {
  const t = useTranslations('auth');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [pastedImages, setPastedImages] = useState<PastedImage[]>([]);

  const [formData, setFormData] = useState({
    category: '',
    product: '',
    productOther: '',
    occurredAt: new Date().toISOString().slice(0, 16),
    subject: '',
    description: '',
  });

  const { clear, lastSaved } = useAutoSave('ticket-form-draft', formData);

  // Fetch products from Sanity on mount
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => { if (d.success) setProducts(d.data); })
      .catch(() => {});
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith('image/'));
    if (imageItems.length === 0) return;

    e.preventDefault();
    const newImages: PastedImage[] = imageItems.map((item) => {
      const file = item.getAsFile()!;
      return { file, preview: URL.createObjectURL(file) };
    });
    setPastedImages((prev) => [...prev, ...newImages]);
  }, []);

  const removePastedImage = (index: number) => {
    setPastedImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePasteAreaClick = () => {
    // Create a hidden file input for images
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      const newImages: PastedImage[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPastedImages((prev) => [...prev, ...newImages]);
    };
    input.click();
  };

  const uploadFiles = async (ticketId: string, files: File[]) => {
    const results = await Promise.all(
      files.map(async (file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('ticketId', ticketId);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        if (res.ok) {
          const data = await res.json();
          return data.data as UploadedFile;
        }
        return null;
      })
    );
    return results.filter((r): r is UploadedFile => r !== null);
  };

  const getProductValue = () => {
    if (formData.product === '__other__') return formData.productOther;
    return formData.product;
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
        productService: getProductValue(),
        subject: formData.subject,
        description: formData.description,
        occurredAt: formData.occurredAt ? new Date(formData.occurredAt).toISOString() : null,
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

    // Collect all files: file input + pasted images
    const allFiles: File[] = [];
    const fileInputFiles = fileInputRef.current?.files;
    if (fileInputFiles) {
      allFiles.push(...Array.from(fileInputFiles));
    }
    pastedImages.forEach((img) => allFiles.push(img.file));

    if (allFiles.length > 0 && newTicketId) {
      setUploading(true);
      const uploaded = await uploadFiles(newTicketId, allFiles);
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

  // Group products by category for grouped select
  const groupedProducts = products.reduce((acc, p) => {
    const cat = p.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, SanityProduct[]>);

  const charCount = formData.description.length;
  const charColor = charCount >= DESCRIPTION_MAX ? 'text-red-500' : charCount >= 750 ? 'text-orange-500' : 'text-gray-400';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-sm">
      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="flex items-center gap-2 text-xs text-gray-400 -mt-2 mb-2">
          <CheckCircle size={12} className="text-green-400" />
          <span>Draft saved at {lastSaved.toLocaleTimeString()}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 1. Category */}
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
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
        >
          <option value="">{t('selectCategory')}</option>
          <option value="build">{t('build')}</option>
          <option value="run">{t('run')}</option>
          <option value="protect">{t('protect')}</option>
        </select>
      </div>

      {/* 2. Product/Service — dropdown from Sanity + "Other" */}
      <div>
        <label htmlFor="ticket-product" className="block text-sm text-gray-700 mb-2">
          {t('productService')} *
        </label>
        <select
          id="ticket-product"
          name="product"
          required
          value={formData.product}
          onChange={(e) => handleChange('product', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
        >
          <option value="">{t('selectCategory')}</option>
          {Object.entries(groupedProducts).map(([cat, items]) => (
            <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
              {items.map((p) => (
                <option key={p._id} value={p.title}>{p.title}</option>
              ))}
            </optgroup>
          ))}
          <option value="__other__">{t('otherSpecify')}</option>
        </select>
        {formData.product === '__other__' && (
          <input
            type="text"
            required
            value={formData.productOther}
            onChange={(e) => handleChange('productOther', e.target.value)}
            className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
            placeholder={t('productOtherPlaceholder')}
          />
        )}
      </div>

      {/* 3. Problem Occurrence Time */}
      <div>
        <label htmlFor="ticket-occurred-at" className="block text-sm text-gray-700 mb-2">
          {t('occurredAt')} *
        </label>
        <input
          id="ticket-occurred-at"
          type="datetime-local"
          name="occurredAt"
          required
          value={formData.occurredAt}
          max={new Date().toISOString().slice(0, 16)}
          onChange={(e) => handleChange('occurredAt', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
        />
      </div>

      {/* 4. Subject */}
      <div>
        <label htmlFor="ticket-subject" className="block text-sm text-gray-700 mb-2">
          {t('subject')} *
        </label>
        <input
          id="ticket-subject"
          type="text"
          name="subject"
          required
          maxLength={200}
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
          placeholder={t('subjectPlaceholder')}
        />
      </div>

      {/* 5. Description with 800 char limit + counter */}
      <div>
        <label htmlFor="ticket-description" className="block text-sm text-gray-700 mb-2">
          {t('description')} *
        </label>
        <textarea
          id="ticket-description"
          name="description"
          required
          rows={6}
          maxLength={DESCRIPTION_MAX}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200 resize-none"
          placeholder={t('descriptionPlaceholder')}
        />
        <p className={`text-xs mt-1 text-right ${charColor}`}>
          {charCount}/{DESCRIPTION_MAX}
        </p>
      </div>

      {/* 6. Paste Screenshot area */}
      <div>
        <label className="block text-sm text-gray-700 mb-2">
          {t('screenshots')}
        </label>
        <div
          ref={pasteAreaRef}
          onPaste={handlePaste}
          onClick={handlePasteAreaClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#00D4FF] hover:bg-gray-50 transition-colors"
        >
          <ImageIcon size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">{t('pasteScreenshot')}</p>
            <p className="text-xs text-gray-600 mt-1">{t('orClickToUpload')}</p>
        </div>
        {pastedImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {pastedImages.map((img, i) => (
              <div key={i} className="relative group">
                <Image src={img.preview} alt={`Screenshot ${i + 1}`} width={80} height={80} unoptimized className="object-cover rounded-lg border border-gray-200" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removePastedImage(i); }}
                  className="absolute -top-2 -right-2 w-11 h-11 bg-red-500 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. File Attachments — any format, max 50MB */}
      <div>
        <label htmlFor="ticket-attachments" className="block text-sm text-gray-700 mb-2">
          {t('attachments')}
        </label>
        <input
          ref={fileInputRef}
          id="ticket-attachments"
          type="file"
          multiple
          className="w-full text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:hover:bg-gray-200 file:cursor-pointer"
        />
          <p className="text-xs text-gray-600 mt-1">{t('maxFileSize')}</p>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-[#00D4FF] text-white font-medium py-3 rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
      >
        {loading || uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {uploading ? t('uploadingFiles') : t('submitting')}
          </>
        ) : (
          t('submitTicket')
        )}
      </button>
    </form>
  );
}
