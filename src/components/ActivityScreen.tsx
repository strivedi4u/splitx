import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { ChevronDown, Calendar, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

// ── Animation variants ──────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } } as const,
};

// ── Category config ─────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  food:          { label: 'Food',          icon: '🍔', color: '#D4A843' },
  stay:          { label: 'Stay',          icon: '🏠', color: '#B8860B' },
  transport:     { label: 'Transport',     icon: '🚗', color: '#C9A84C' },
  bills:         { label: 'Bills',         icon: '🧾', color: '#8B7332' },
  entertainment: { label: 'Entertainment', icon: '🎬', color: '#A67C37' },
  shopping:      { label: 'Shopping',      icon: '🛍️',  color: '#BFA050' },
  health:        { label: 'Health',        icon: '💊', color: '#D4B483' },
  general:       { label: 'General',       icon: '📦', color: '#9A8060' },
};

function getCategoryMeta(key: string) {
  return CATEGORY_CONFIG[key?.toLowerCase()] ?? { label: key || 'Other', icon: '📌', color: '#888' };
}

// ── Date helpers ────────────────────────────────────────────────────────────
type DateFilter = 'this_month' | 'prev_month' | 'last_3' | 'custom';

function getRange(filter: DateFilter, customStart: string, customEnd: string) {
  const now = new Date();
  if (filter === 'this_month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0], label: s.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) };
  }
  if (filter === 'prev_month') {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0], label: s.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) };
  }
  if (filter === 'last_3') {
    const s = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0], label: 'Last 3 Months' };
  }
  return { start: customStart, end: customEnd, label: 'Custom Range' };
}

function buildMonthlyLabels(): { key: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
    };
  });
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ActivityScreen() {
  const { expenses, currentUser } = useApp();

  const [activeTab, setActiveTab]           = useState<'outcome' | 'income'>('outcome');
  const [dateFilter, setDateFilter]         = useState<DateFilter>('this_month');
  const [customStart, setCustomStart]       = useState('');
  const [customEnd, setCustomEnd]           = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const range = useMemo(
    () => getRange(dateFilter, customStart, customEnd),
    [dateFilter, customStart, customEnd],
  );

  // ── Filter expenses to date range ───────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    if (!range.start || !range.end) return expenses;
    return expenses.filter(e => {
      const d = (e.date ?? '').split('T')[0];
      return d >= range.start && d <= range.end;
    });
  }, [expenses, range]);

  // ── Per-category computation ─────────────────────────────────────────────
  // outcome = my personal share of each expense I'm split in
  // income  = what others owe me for expenses I paid
  const { outcomeCats, incomeCats, totalOutcome, totalIncome } = useMemo(() => {
    const uid       = currentUser.id;
    const outcomeMap: Record<string, number> = {};
    const incomeMap:  Record<string, number> = {};

    filteredExpenses.forEach(exp => {
      const split = exp.splitBetween?.length || 1;
      const share = exp.amount / split;
      const cat   = (exp.category || 'general').toLowerCase();

      if (exp.splitBetween?.includes(uid)) {
        outcomeMap[cat] = (outcomeMap[cat] ?? 0) + share;
      }
      if (exp.paidBy === uid && split > 1) {
        incomeMap[cat] = (incomeMap[cat] ?? 0) + (exp.amount - share);
      }
    });

    const toArr = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([key, amount]) => ({ key, amount: Math.round(amount * 100) / 100 }))
        .sort((a, b) => b.amount - a.amount);

    const outcomeCats = toArr(outcomeMap);
    const incomeCats  = toArr(incomeMap);
    return {
      outcomeCats,
      incomeCats,
      totalOutcome: outcomeCats.reduce((s, c) => s + c.amount, 0),
      totalIncome:  incomeCats.reduce((s, c) => s + c.amount, 0),
    };
  }, [filteredExpenses, currentUser.id]);

  const activeCats  = activeTab === 'outcome' ? outcomeCats : incomeCats;
  const activeTotal = activeTab === 'outcome' ? totalOutcome : totalIncome;

  const catsWithPct = useMemo(() =>
    activeCats.map(c => ({
      ...c,
      pct:  activeTotal > 0 ? Math.round((c.amount / activeTotal) * 100) : 0,
      meta: getCategoryMeta(c.key),
    })),
    [activeCats, activeTotal],
  );

  // ── Donut chart data ─────────────────────────────────────────────────────
  const pieData  = catsWithPct.map(c => ({ name: c.meta.label, value: c.pct || 0 }));
  const pieEmpty = pieData.length === 0 || pieData.every(d => d.value === 0);

  // ── Monthly trend (last 6 months) ────────────────────────────────────────
  const monthlyLabels = useMemo(buildMonthlyLabels, []);
  const monthlyData   = useMemo(() => {
    const uid = currentUser.id;
    return monthlyLabels.map(({ key, label }) => {
      let outcome = 0, income = 0;
      expenses.forEach(exp => {
        const d     = (exp.date ?? '').slice(0, 7);
        if (d !== key) return;
        const split = exp.splitBetween?.length || 1;
        const share = exp.amount / split;
        if (exp.splitBetween?.includes(uid)) outcome += share;
        if (exp.paidBy === uid && split > 1)  income  += exp.amount - share;
      });
      return { label, outcome: Math.round(outcome), income: Math.round(income) };
    });
  }, [expenses, currentUser.id, monthlyLabels]);

  const net = totalIncome - totalOutcome;

  const filterLabels: Record<DateFilter, string> = {
    this_month: 'This Month',
    prev_month: 'Previous Month',
    last_3:     'Last 3 Months',
    custom:     'Custom Range',
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="px-5 pt-5 pb-28 overflow-y-auto h-full space-y-5"
    >
      {/* ── Header ── */}
      <motion.div variants={item} className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground font-display">Statistics</h1>

        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilterMenu(v => !v)}
            className="flex items-center gap-1.5 bg-secondary/60 rounded-xl px-3 py-1.5 border border-border/30"
          >
            <Filter size={12} className="text-primary" />
            <span className="text-[11px] font-semibold text-foreground">{filterLabels[dateFilter]}</span>
            <ChevronDown size={13} className="text-muted-foreground" />
          </motion.button>

          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 top-10 z-30 w-56 rounded-2xl border border-primary/10 p-2 space-y-1"
                style={{ background: 'hsl(0 0% 8%)' }}
              >
                {(['this_month', 'prev_month', 'last_3', 'custom'] as DateFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => { setDateFilter(f); if (f !== 'custom') setShowFilterMenu(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      dateFilter === f ? 'gradient-gold text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/60'
                    }`}
                  >
                    {filterLabels[f]}
                  </button>
                ))}
                {dateFilter === 'custom' && (
                  <div className="space-y-2 pt-2 border-t border-border/20">
                    {(['Start', 'End'] as const).map(lbl => (
                      <div key={lbl}>
                        <label className="text-[9px] text-primary/50 font-bold uppercase tracking-widest">{lbl}</label>
                        <input
                          type="date"
                          value={lbl === 'Start' ? customStart : customEnd}
                          onChange={e => lbl === 'Start' ? setCustomStart(e.target.value) : setCustomEnd(e.target.value)}
                          className="w-full bg-secondary/60 rounded-xl px-3 py-2 text-xs text-foreground border border-border/30 outline-none"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="w-full gradient-gold rounded-xl py-2 text-xs font-bold text-primary-foreground"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Period summary ── */}
      <motion.div variants={item} className="glass-gold rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-primary" />
          <span className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">{range.label}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown size={11} className="text-red-400" />
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Spent</span>
            </div>
            <p className="text-base font-extrabold text-foreground font-display">
              ₹{totalOutcome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={11} className="text-emerald-400" />
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Owed</span>
            </div>
            <p className="text-base font-extrabold text-foreground font-display">
              ₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Minus size={11} className={net >= 0 ? 'text-emerald-400' : 'text-red-400'} />
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Net</span>
            </div>
            <p className={`text-base font-extrabold font-display ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {net >= 0 ? '+' : ''}₹{Math.abs(net).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-3">
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} in this period
        </p>
      </motion.div>

      {/* ── Tab toggle ── */}
      <motion.div variants={item} className="flex gap-0 bg-secondary/40 rounded-2xl p-1 border border-border/20">
        {(['outcome', 'income'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab ? 'gradient-gold text-primary-foreground shadow-gold' : 'text-muted-foreground'
            }`}
          >
            {tab === 'outcome' ? 'My Spending' : 'Owed To Me'}
          </button>
        ))}
      </motion.div>

      {/* ── Donut chart ── */}
      <motion.div variants={item} className="flex flex-col items-center py-2">
        <div className="w-[180px] h-[180px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {!pieEmpty ? (
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={85} strokeWidth={0} paddingAngle={3}>
                  {catsWithPct.map((c, i) => <Cell key={i} fill={c.meta.color} />)}
                </Pie>
              ) : (
                <Pie data={[{ name: 'empty', value: 1 }]} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={85} strokeWidth={0}>
                  <Cell fill="#2a2a2a" />
                </Pie>
              )}
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[9px] text-primary/50 font-bold uppercase tracking-widest mb-0.5 text-center leading-tight">
              {activeTab === 'outcome' ? 'My Spending' : 'Owed To Me'}
            </p>
            <p className="text-xl font-extrabold text-gradient-gold font-display">
              ₹{activeTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            {activeCats.length === 0 && (
              <p className="text-[10px] text-muted-foreground mt-1">No data</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Category breakdown ── */}
      <motion.div variants={item}>
        <p className="text-sm font-bold text-foreground mb-3">
          {activeTab === 'outcome' ? 'Spending' : 'Income'} Breakdown
        </p>

        {catsWithPct.length === 0 ? (
          <div className="glass-premium rounded-2xl p-6 text-center text-muted-foreground text-sm">
            No {activeTab === 'outcome' ? 'spending' : 'income'} data for this period
          </div>
        ) : (
          <div className="space-y-2">
            {catsWithPct.map(cat => (
              <motion.div key={cat.key} layout className="glass-premium rounded-2xl p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: `${cat.meta.color}22` }}
                  >
                    {cat.meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-semibold text-foreground capitalize">{cat.meta.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-foreground">
                          ₹{cat.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                        <div
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                          style={{ backgroundColor: `${cat.meta.color}25`, color: cat.meta.color }}
                        >
                          {cat.pct}%
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.meta.color }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Monthly trend bar chart ── */}
      <motion.div variants={item}>
        <p className="text-sm font-bold text-foreground mb-3">Monthly Trend</p>
        <div className="glass-premium rounded-2xl p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#D4A843' }} />
              <span className="text-[10px] text-muted-foreground font-semibold">Spending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#4CAF82' }} />
              <span className="text-[10px] text-muted-foreground font-semibold">Owed To Me</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={monthlyData} barSize={9} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ background: '#111', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 12, fontSize: 11 }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                labelStyle={{ color: '#888', marginBottom: 4 }}
              />
              <Bar dataKey="outcome" name="Spending"   fill="#D4A843" radius={[4, 4, 0, 0]} />
              <Bar dataKey="income"  name="Owed To Me" fill="#4CAF82" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Group-wise spending ── */}
      <GroupSpendingSection filteredExpenses={filteredExpenses} currentUserId={currentUser.id} />
    </motion.div>
  );
}

// ── Group spending sub-section ─────────────────────────────────────────────
function GroupSpendingSection({
  filteredExpenses,
  currentUserId,
}: {
  filteredExpenses: any[];
  currentUserId: string;
}) {
  const { groups } = useApp();

  const groupData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      if (!exp.splitBetween?.includes(currentUserId)) return;
      const share = exp.amount / (exp.splitBetween.length || 1);
      map[exp.groupId] = (map[exp.groupId] ?? 0) + share;
    });
    return Object.entries(map)
      .map(([gid, amount]) => {
        const g = groups.find(gr => gr.id === gid);
        return { id: gid, name: g?.name ?? 'Unknown Group', icon: (g as any)?.icon ?? '👥', amount: Math.round(amount) };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, currentUserId, groups]);

  if (groupData.length === 0) return null;
  const maxAmount = groupData[0].amount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-sm font-bold text-foreground mb-3">Spending by Group</p>
      <div className="space-y-2">
        {groupData.map(g => (
          <div key={g.id} className="glass-premium rounded-2xl p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-base shrink-0">
                {g.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-semibold text-foreground truncate">{g.name}</span>
                  <span className="text-[13px] font-bold text-foreground shrink-0 ml-2">
                    ₹{g.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(g.amount / maxAmount) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full gradient-gold"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
