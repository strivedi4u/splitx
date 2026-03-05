import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, ArrowDownLeft, ChevronRight, Eye, EyeOff, Bell, BellRing, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import AnimatedNumber from './AnimatedNumber';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from 'react';
import NotificationBell from './NotificationBell';
import { useNotifications } from '@/context/NotificationContext';


const CATEGORY_COLORS: Record<string, string> = {
  food:          '#D4A843',
  stay:          '#B8860B',
  transport:     '#C9A84C',
  bills:         '#8B7332',
  entertainment: '#A67C37',
  shopping:      '#BFA050',
  health:        '#D4B483',
  general:       '#9A8060',
};
const FALLBACK_COLORS = ['#D4A843','#B8860B','#C9A84C','#8B7332','#A67C37','#BFA050'];
function catColor(key: string, idx: number) {
  return CATEGORY_COLORS[key?.toLowerCase()] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

interface DashboardProps {
  onAddExpense: () => void;
  onGoToGroups: (groupId?: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function Dashboard({ onAddExpense, onGoToGroups }: DashboardProps) {
  const { getTotalOwed, getTotalOwe, getNetBalance, groups, getUserById, getGroupBalances, expenses, currentUser } = useApp();
  const { notifications, unreadCount, markRead, clearAll } = useNotifications();
  const [balanceVisible, setBalanceVisible] = useState(true);


  const owed = getTotalOwed();
  const owe  = getTotalOwe();
  const net  = getNetBalance();

  // Live spending split — current month, my share per category
  const spendingCats = useMemo(() => {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const uid   = currentUser.id;
    const map: Record<string, number> = {};

    expenses.forEach(exp => {
      const d = (exp.date ?? '').split('T')[0];
      if (d < start || d > end) return;
      if (!exp.splitBetween?.includes(uid)) return;
      const share = exp.amount / (exp.splitBetween.length || 1);
      const cat   = (exp.category || 'general').toLowerCase();
      map[cat]    = (map[cat] ?? 0) + share;
    });

    const total  = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([key, amount]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        amount: Math.round(amount),
        pct:   total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses, currentUser.id]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="px-5 pt-5 pb-28 overflow-y-auto h-full space-y-5"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center text-xl shadow-gold"
            whileTap={{ scale: 0.92 }}
          >
            😎
          </motion.div>
          <div>
            <p className="text-muted-foreground text-[11px] font-medium">Welcome back</p>
            <h1 className="text-lg font-bold text-foreground font-display">SplitX</h1>
          </div>
        </div>
        <NotificationBell />
      </motion.div>

      {/* Balance Card */}
      <motion.div
        variants={item}
        className="glass-gold rounded-3xl p-5 relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, hsl(42 100% 50%), transparent 70%)' }} />
        <div className="absolute -bottom-14 -left-14 w-32 h-32 rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, hsl(45 100% 65%), transparent 70%)' }} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] text-primary/60 font-semibold uppercase tracking-widest">Net Balance</p>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? <Eye size={16} className="text-primary/40" /> : <EyeOff size={16} className="text-primary/40" />}
            </motion.button>
          </div>
          
          {balanceVisible ? (
            <AnimatedNumber
              value={net}
              className={`text-[36px] font-extrabold font-display leading-tight ${net >= 0 ? 'text-gradient-gold' : 'text-destructive'}`}
            />
          ) : (
            <div className="text-[36px] font-extrabold font-display leading-tight text-foreground/30">₹ • • • •</div>
          )}
          
          <div className="divider-gold my-4" />
          
          <div className="flex gap-3">
            <div className="flex-1 rounded-2xl p-3 bg-neon-green/[0.05] border border-neon-green/[0.08]">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowDownLeft size={12} className="text-neon-green" />
                <span className="text-[9px] text-neon-green font-bold uppercase tracking-wider">Owed to you</span>
              </div>
              <AnimatedNumber value={owed} className="text-lg font-extrabold text-neon-green font-display" />
            </div>
            <div className="flex-1 rounded-2xl p-3 bg-destructive/[0.05] border border-destructive/[0.08]">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowUpRight size={12} className="text-destructive" />
                <span className="text-[9px] text-destructive font-bold uppercase tracking-wider">You owe</span>
              </div>
              <AnimatedNumber value={owe} className="text-lg font-extrabold text-destructive font-display" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications Panel */}
      <motion.div variants={item} className="glass-premium rounded-2xl overflow-hidden">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            {unreadCount > 0
              ? <BellRing size={15} className="text-primary" />
              : <Bell size={15} className="text-muted-foreground" />}
            <span className="text-sm font-bold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full gradient-gold text-primary-foreground leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-destructive transition-colors"
              >
                <Trash2 size={11} />
                Clear
              </button>
            )}

          </div>
        </div>

        {/* Notification Items */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-7 gap-2">
            <Bell size={28} strokeWidth={1.2} className="text-muted-foreground/30" />
            <p className="text-[12px] text-muted-foreground/50">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {notifications.slice(0, 4).map((n) => {
              const typeEmoji: Record<string, string> = {
                expense_added: '💸',
                settlement_made: '🤝',
                settlement_received: '💰',
                member_joined: '👋',
                broadcast: '📢',
              };
              const emoji = typeEmoji[n.type] ?? '🔔';
              const timeAgo = (() => {
                const diff = Math.floor((Date.now() - new Date(n.timestamp).getTime()) / 1000);
                if (diff < 60) return `${diff}s ago`;
                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                return `${Math.floor(diff / 86400)}d ago`;
              })();

              return (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${
                    n.read ? 'opacity-60' : 'bg-primary/[0.03]'
                  }`}
                >
                  {/* Icon / Image */}
                  {n.imageUrl ? (
                    <img
                      src={(() => {
                        const url = n.imageUrl || '';
                        if (url.startsWith('http')) return url;
                        const base = (import.meta.env.VITE_API_URL || 'https://splitx.azurewebsites.net/api').replace('/api', '');
                        return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
                      })()}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl shrink-0">
                      {emoji}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[12px] font-bold text-foreground leading-tight">{n.title}</span>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-muted-foreground/50">{timeAgo}</span>
                      {n.actorName && n.actorName !== 'SplitX' && (
                        <span className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">
                          {n.actorName}
                        </span>
                      )}
                      {n.fromName && (
                        <span className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">
                          {n.fromName}
                        </span>
                      )}
                      {n.groupName && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          {n.groupName}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}

            {notifications.length > 4 && (
              <div className="px-4 py-2.5 text-center">
                <span className="text-[11px] text-muted-foreground/60">
                  +{notifications.length - 4} more · tap bell icon to view all
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Groups */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-foreground">Your Groups</p>
          <button onClick={() => onGoToGroups()} className="text-[11px] font-semibold text-primary">See all</button>
        </div>
        <div className="space-y-2.5">
          {groups.map((group, i) => {
            const balances = getGroupBalances(group.id);
            const net = balances.reduce((sum, b) => sum + b.amount, 0);
            const members = group.members.map(id => getUserById(id)).filter(Boolean);

            return (
              <motion.button
                key={group.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onGoToGroups(group.id)}
                className="w-full text-left glass-premium rounded-2xl p-3.5 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-2xl bg-primary/[0.08] border border-primary/[0.08] flex items-center justify-center text-lg shrink-0">
                  {group.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground truncate">{group.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {members.slice(0, 3).map((m, mi) => (
                      <div
                        key={m!.id}
                        className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[8px]"
                        style={{ marginLeft: mi > 0 ? '-4px' : 0, zIndex: 3 - mi, border: '1.5px solid hsl(var(--background))' }}
                      >
                        {m!.avatar}
                      </div>
                    ))}
                    <span className="text-[9px] text-muted-foreground ml-1">{members.length} members</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-sm font-extrabold font-display ${net >= 0 ? 'text-neon-green' : 'text-destructive'}`}>
                    {net >= 0 ? '+' : ''}₹{Math.abs(Math.round(net)).toLocaleString('en-IN')}
                  </span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Category Split — live data */}
      <motion.div variants={item} className="glass-premium rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-foreground">Spending Split</p>
          <span className="text-[10px] font-semibold text-primary">This month</span>
        </div>

        {spendingCats.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No spending data this month
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <div className="w-[100px] h-[100px] relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingCats.map(c => ({ name: c.label, value: c.pct }))}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={46}
                    strokeWidth={0}
                    paddingAngle={3}
                  >
                    {spendingCats.map((c, i) => (
                      <Cell key={i} fill={catColor(c.key, i)} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary/60">
                  ₹{spendingCats.reduce((s, c) => s + c.amount, 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {spendingCats.map((cat, i) => (
                <div key={cat.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: catColor(cat.key, i) }} />
                    <span className="text-[11px] text-muted-foreground font-medium capitalize">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground/60">₹{cat.amount.toLocaleString('en-IN')}</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ backgroundColor: `${catColor(cat.key, i)}20`, color: catColor(cat.key, i) }}
                    >
                      {cat.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* FAB */}
      <motion.button
        onClick={onAddExpense}
        className="fixed bottom-24 right-5 w-[58px] h-[58px] rounded-[18px] gradient-gold flex items-center justify-center z-40"
        style={{ boxShadow: '0 8px 30px hsl(42 100% 50% / 0.3)' }}
        whileTap={{ scale: 0.88, rotate: -5 }}
      >
        <Plus size={26} strokeWidth={2.5} className="text-primary-foreground" />
      </motion.button>


    </motion.div>
  );
}
