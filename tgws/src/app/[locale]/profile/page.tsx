'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { User, Lock, Mail, Loader2, CheckCircle } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function ProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push(`/${locale}/support/login`); return; }
      setEmail(data.user.email ?? '');
      setDisplayName((data.user.user_metadata?.display_name as string) || '');
      setLoading(false);
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const updates: Record<string, string> = {};
    if (displayName) updates.display_name = displayName;

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase.auth.updateUser({ data: updates });
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    }

    if (newPassword) {
      if (newPassword !== confirmPassword) { setError('Passwords do not match'); setSaving(false); return; }
      if (newPassword.length < 8) { setError('Password must be at least 8 characters'); setSaving(false); return; }
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) { setError(pwError.message); setSaving(false); return; }
    }

    setSuccess(locale === 'zh' ? '个人资料已更新' : 'Profile updated successfully');
    setNewPassword('');
    setConfirmPassword('');
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-[#00D4FF]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-zinc-900">
      <Breadcrumb items={[{ label: locale === 'zh' ? '个人资料' : 'Profile' }]} locale={locale} />
      <section className="py-16 px-5 sm:px-8 max-w-lg mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-[#00D4FF]/10 flex items-center justify-center">
              <User size={24} className="text-[#00D4FF]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {locale === 'zh' ? '个人资料' : 'Profile'}
              </h1>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <CheckCircle size={16} /> {success}
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <User size={16} className="text-[#00D4FF]" />
                {locale === 'zh' ? '显示名称' : 'Display Name'}
              </label>
              <input type="text" value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={locale === 'zh' ? '输入名称' : 'Enter your name'}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-600 rounded-lg bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none" />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <Mail size={16} className="text-[#7B61FF]" />
                {locale === 'zh' ? '电子邮箱' : 'Email'}
              </label>
              <input type="email" value={email} disabled
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-600 rounded-lg bg-gray-100 dark:bg-zinc-800/50 text-gray-500 cursor-not-allowed outline-none" />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-zinc-700 pt-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Lock size={16} className="text-[#22C55E]" />
                {locale === 'zh' ? '修改密码（可选）' : 'Change Password (optional)'}
              </p>
              <div className="space-y-4">
                <input type="password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={locale === 'zh' ? '新密码（至少 8 位）' : 'New password (min 8 chars)'}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-600 rounded-lg bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none" />
                <input type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={locale === 'zh' ? '确认新密码' : 'Confirm new password'}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-600 rounded-lg bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none" />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#00D4FF] text-white font-medium py-3 rounded-lg hover:bg-[#00B8E6] transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {saving
                ? (locale === 'zh' ? '保存中...' : 'Saving...')
                : (locale === 'zh' ? '保存' : 'Save')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
