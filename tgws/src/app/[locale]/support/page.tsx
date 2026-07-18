'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import TicketForm from '@/components/tickets/TicketForm';
import TicketList from '@/components/tickets/TicketList';
import Link from 'next/link';
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  LogOut,
  ChevronRight,
  User,
  Headphones,
  WifiOff,
} from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  category: string;
  created_at: string;
}

type Tab = 'dashboard' | 'new-ticket' | 'my-tickets';

export default function SupportPage() {
  const s = useTranslations('support');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const supabase = createClient();

  // Middleware enforces authentication for /support/* routes, so we can assume
  // the user is logged in here. We only fetch the user to display their email
  // and to gate the tickets fetcher.
  useEffect(() => {
    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
    };

    load();
  }, [supabase]);

  // Tickets are loaded through useOfflineCache so the page degrades gracefully
  // when the network is unavailable: cached tickets stay visible with a
  // staleness indicator instead of the page blanking out.
  //
  // The fetcher throws while `user` is unresolved so the hook doesn't
  // overwrite the cache with an empty 401 response. Once `user` lands the
  // fetcher identity changes and the effect re-runs with the real fetch.
  const ticketsFetcher = useCallback(async (): Promise<Ticket[]> => {
    if (!user) {
      throw new Error('user-not-ready');
    }
    const response = await fetch('/api/tickets');
    if (!response.ok) {
      throw new Error(`tickets-fetch-${response.status}`);
    }
    const result = await response.json();
    return (result.data || []) as Ticket[];
  }, [user]);

  const { data: cachedTickets, isStale } = useOfflineCache<Ticket[]>(
    'tickets-cache',
    ticketsFetcher
  );

  // user being null only happens briefly while supabase.auth.getUser()
  // resolves; render nothing during that window rather than a flash of the
  // stale-cache banner (which would be misleading because we haven't even
  // attempted a fetch yet).
  const showOfflineBanner = user !== null && isStale && cachedTickets !== null;
  const tickets = cachedTickets || [];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/support/login`);
  };

  // Middleware guarantees authentication; user is only null briefly while
  // supabase.auth.getUser() resolves on the client. Render nothing during
  // that brief window instead of a full-screen loading spinner.
  if (!user) {
    return null;
  }

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  };

  const sidebarItems: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'dashboard', icon: <LayoutDashboard size={20} />, label: s('dashboard') },
    { key: 'new-ticket', icon: <PlusCircle size={20} />, label: s('submitNewTicket') },
    { key: 'my-tickets', icon: <Ticket size={20} />, label: s('viewMyTickets') },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00D4FF] to-[#7B61FF] rounded-xl flex items-center justify-center">
              <Headphones size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-semibold">TechGuru</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{s('supportCenter')}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${
                    activeTab === item.key
                      ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-zinc-700'
                  }`}
                >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center">
              <User size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white truncate">{user.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s('customer')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-red-700 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
          >
            <LogOut size={16} />
            {s('signOut')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <h1 className="sr-only">{s('supportCenter')}</h1>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00D4FF] to-[#7B61FF] rounded-lg flex items-center justify-center">
                <Headphones size={16} className="text-white" />
              </div>
              <span className="text-gray-900 dark:text-white font-semibold">{s('supportCenter')}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Nav */}
          <div className="relative mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${
                    activeTab === item.key
                      ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                      : 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-zinc-700'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white dark:from-zinc-800 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {showOfflineBanner && (
            <div
              role="status"
              aria-live="polite"
              className="mb-6 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200"
            >
              <WifiOff size={16} className="shrink-0" />
              <span>{s('offlineIndicator')}</span>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {s('welcomeBack')}, {user.email?.split('@')[0]}
                </h1>
                <p className="text-gray-500 dark:text-gray-300">{s('manageTicketsDesc')}</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">{s('totalTickets')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{ticketStats.total}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">{s('open')}</p>
                  <p className="text-3xl font-bold text-yellow-500">{ticketStats.open}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-700 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">{s('inProgress')}</p>
                  <p className="text-3xl font-bold text-blue-500">{ticketStats.inProgress}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 border border-green-200 dark:border-green-700 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">{s('resolved')}</p>
                  <p className="text-3xl font-bold text-green-500">{ticketStats.resolved}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid lg:grid-cols-2 gap-6">
                <button
                  onClick={() => setActiveTab('new-ticket')}
                  className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 rounded-2xl text-left hover:shadow-lg hover:border-gray-300 dark:hover:border-zinc-600 transition-all duration-200 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-[#00D4FF] transition-colors duration-200">{s('submitNewTicket')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-300">{s('getHelp')}</p>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-[#00D4FF] transition-colors duration-200" />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('my-tickets')}
                  className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 rounded-2xl text-left hover:shadow-lg hover:border-gray-300 dark:hover:border-zinc-600 transition-all duration-200 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-[#00D4FF] transition-colors duration-200">{s('viewMyTickets')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-300">{s('trackStatus')}</p>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-gray-900 dark:text-gray-500 dark:group-hover:text-white transition-colors duration-200" />
                  </div>
                </button>
              </div>

              {/* Recent Tickets */}
              {tickets.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{s('recentTickets')}</h2>
                  <TicketList tickets={tickets.slice(0, 3)} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'new-ticket' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{s('submitNewTicket')}</h1>
                <p className="text-gray-500 dark:text-gray-300">{s('newTicketDesc')}</p>
              </div>
              <div className="max-w-2xl">
                <TicketForm />
              </div>
            </div>
          )}

          {activeTab === 'my-tickets' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{s('viewMyTickets')}</h1>
                <p className="text-gray-500 dark:text-gray-300">{s('myTicketsDesc')}</p>
              </div>
              <TicketList tickets={tickets} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
