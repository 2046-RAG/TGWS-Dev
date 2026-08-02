'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { User, LogOut, Headphones, ChevronDown, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function UserMenu() {
  const router = useRouter();
  const locale = useLocale();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user ? (
          <div className="w-7 h-7 rounded-full bg-[#00D4FF] flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
        ) : (
          <Headphones size={16} className="text-gray-600 dark:text-gray-300" />
        )}
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg py-2 z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {user ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-700">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Signed in as</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 truncate font-medium">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  router.push(`/${locale}/profile`);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <User size={16} />
                My Profile
              </button>
              <button
                onClick={() => {
                  router.push(`/${locale}/support`);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <Settings size={16} />
                Support Center
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <div className="p-3 space-y-2">
              <button
                onClick={() => {
                  router.push(`/${locale}/support/login`);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00D4FF] text-white text-sm font-medium rounded-lg hover:bg-[#00B8E6] transition-colors"
              >
                <Headphones size={14} />
                Sign In
              </button>
              <button
                onClick={() => {
                  router.push(`/${locale}/support/register`);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}