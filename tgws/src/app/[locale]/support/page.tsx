'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
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
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const response = await fetch('/api/tickets');
        if (response.ok) {
          const result = await response.json();
          setTickets(result.data || []);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/support/login`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center">
        <div className="inline-block w-10 h-10 border-3 border-gray-300 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="py-20 px-5 sm:px-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('signIn')}</h1>
          <p className="text-gray-500">{t('signInSubtitle')}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col gap-4">
            <Link
              href={`/${locale}/support/login`}
              className="btn-primary text-center"
            >
              {t('signIn')}
            </Link>
            <Link
              href={`/${locale}/support/register`}
              className="btn-secondary text-center"
            >
              {t('createAccount')}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  };

  const sidebarItems: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { key: 'new-ticket', icon: <PlusCircle size={20} />, label: t('newTicket') },
    { key: 'my-tickets', icon: <Ticket size={20} />, label: t('myTickets') },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00D4FF] to-[#7B61FF] rounded-xl flex items-center justify-center">
              <Headphones size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">TechGuru</p>
              <p className="text-xs text-gray-500">Support Center</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.key
                  ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={18} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{user.email}</p>
              <p className="text-xs text-gray-500">Customer</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <h1 className="sr-only">Support Center</h1>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00D4FF] to-[#7B61FF] rounded-lg flex items-center justify-center">
                <Headphones size={16} className="text-white" />
              </div>
              <span className="text-gray-900 font-semibold">Support Center</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Nav */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === item.key
                    ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                    : 'text-gray-600 bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user.email?.split('@')[0]}
                </h1>
                <p className="text-gray-500">Manage your support tickets and get help.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-500 text-sm mb-1">Total Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">{ticketStats.total}</p>
                </div>
                <div className="bg-white border border-yellow-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-500 text-sm mb-1">Open</p>
                  <p className="text-3xl font-bold text-yellow-500">{ticketStats.open}</p>
                </div>
                <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-500 text-sm mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-blue-500">{ticketStats.inProgress}</p>
                </div>
                <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-500 text-sm mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-green-500">{ticketStats.resolved}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid lg:grid-cols-2 gap-6">
                <button
                  onClick={() => setActiveTab('new-ticket')}
                  className="bg-white border border-gray-200 p-6 rounded-2xl text-left hover:shadow-lg transition-all duration-300 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#00D4FF] transition-colors">Submit New Ticket</h3>
                      <p className="text-sm text-gray-500">Get help from our support team</p>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-[#00D4FF] transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('my-tickets')}
                  className="bg-white border border-gray-200 p-6 rounded-2xl text-left hover:shadow-lg transition-all duration-300 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#00D4FF] transition-colors">View My Tickets</h3>
                      <p className="text-sm text-gray-500">Track existing ticket status</p>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </div>
                </button>
              </div>

              {/* Recent Tickets */}
              {tickets.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tickets</h2>
                  <TicketList tickets={tickets.slice(0, 3)} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'new-ticket' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('newTicket')}</h1>
                <p className="text-gray-500">Submit a new support request and our team will assist you.</p>
              </div>
              <div className="max-w-2xl">
                <TicketForm />
              </div>
            </div>
          )}

          {activeTab === 'my-tickets' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('myTickets')}</h1>
                <p className="text-gray-500">View and track all your support requests.</p>
              </div>
              <TicketList tickets={tickets} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
