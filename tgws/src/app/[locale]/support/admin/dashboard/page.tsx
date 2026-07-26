'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Calendar,
} from 'lucide-react';

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  assigned_to: string | null;
}

interface CategoryStats {
  build: number;
  run: number;
  protect: number;
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const s = useTranslations('support');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string; role?: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (!authUser) {
        router.push(`/${locale}/support/login`);
        return;
      }

      // Fetch all tickets for admin
      const response = await fetch('/api/tickets/stats');
      if (response.ok) {
        const result = await response.json();
        setTickets(result.data || []);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [supabase, router, locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center">
        <div className="inline-block w-10 h-10 border-3 border-gray-300 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate statistics
  const stats: TicketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    critical: tickets.filter(t => t.priority === 'critical').length,
    high: tickets.filter(t => t.priority === 'high').length,
    medium: tickets.filter(t => t.priority === 'medium').length,
    low: tickets.filter(t => t.priority === 'low').length,
  };

  const categoryStats: CategoryStats = {
    build: tickets.filter(t => t.category === 'build').length,
    run: tickets.filter(t => t.category === 'run').length,
    protect: tickets.filter(t => t.category === 'protect').length,
  };

  // Recent tickets (last 5)
  const recentTickets = tickets
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Calculate response time (simplified - days since creation)
  const avgResponseTime = tickets.length > 0
    ? Math.round(tickets.reduce((acc, t) => {
        const created = new Date(t.created_at);
        const now = new Date();
        return acc + (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / tickets.length)
    : 0;

  const statCards = [
    { label: t('totalTickets'), value: stats.total, icon: Ticket, color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/10' },
    { label: t('openTickets'), value: stats.open, icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: t('inProgress'), value: stats.inProgress, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: t('resolved'), value: stats.resolved, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Support', href: `/${locale}/support` }, { label: 'Admin Dashboard' }]} locale={locale} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('adminDashboard')}
          </h1>
          <p className="text-gray-500 dark:text-gray-300">{t('dashboardDesc')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <card.icon size={20} className={card.color} />
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Priority Distribution */}
          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('priorityDistribution')}</h2>
              <PieChart size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {[
                { label: t('critical'), value: stats.critical, color: 'bg-red-500', percent: stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0 },
                { label: t('high'), value: stats.high, color: 'bg-orange-500', percent: stats.total > 0 ? Math.round((stats.high / stats.total) * 100) : 0 },
                { label: t('medium'), value: stats.medium, color: 'bg-yellow-500', percent: stats.total > 0 ? Math.round((stats.medium / stats.total) * 100) : 0 },
                { label: t('low'), value: stats.low, color: 'bg-green-500', percent: stats.total > 0 ? Math.round((stats.low / stats.total) * 100) : 0 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value} ({item.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('categoryDistribution')}</h2>
              <BarChart3 size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {[
                { label: 'Build', value: categoryStats.build, color: 'bg-[#00D4FF]' },
                { label: 'Run', value: categoryStats.run, color: 'bg-[#7B61FF]' },
                { label: 'Protect', value: categoryStats.protect, color: 'bg-[#22C55E]' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('avgResponseTime')}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgResponseTime} {t('days')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('avgResponseDesc')}</p>
          </div>

          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('resolutionRate')}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total > 0 ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('resolutionDesc')}</p>
          </div>

          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} className="text-yellow-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('criticalTickets')}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.critical}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('criticalDesc')}</p>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentTickets')}</h2>
              <Link
                href={`/${locale}/support`}
                className="text-sm text-[#00D4FF] hover:text-[#00B8E6] flex items-center gap-1"
              >
                {t('viewAll')} <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('ticketNumber')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('subject')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('priority')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('created')}</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 dark:border-zinc-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                    <td className="px-6 py-4 text-sm font-medium text-[#00D4FF]">{ticket.ticket_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">{ticket.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-gray-300'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('noTickets')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}