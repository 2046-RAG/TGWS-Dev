'use client';

import { useState } from 'react';

interface LeadCaptureFormProps {
  onSubmit: (data: { name: string; email: string; phone?: string; company?: string }) => void;
  onCancel: () => void;
}

export default function LeadCaptureForm({ onSubmit, onCancel }: LeadCaptureFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onSubmit({ name, email, phone, company });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name *"
        required
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-600 rounded-lg focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address *"
        required
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-600 rounded-lg focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="px-3 py-2 text-sm border border-gray-200 dark:border-zinc-600 rounded-lg focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none"
        />
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company (optional)"
          className="px-3 py-2 text-sm border border-gray-200 dark:border-zinc-600 rounded-lg focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#00D4FF] text-white text-sm font-medium rounded-lg hover:bg-[#00B8E6] transition-colors"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
