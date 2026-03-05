import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, LogOut, Search, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Activity, Calendar, Mail, Hash } from 'lucide-react';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin@splitx';
const USERS_KEY = 'splitx_users';
const GROUPS_KEY = 'splitx_groups';
const EXPENSES_KEY = 'splitx_expenses';
const SETTLEMENTS_KEY = 'splitx_settlements';
const SESSION_KEY = 'splitx_session';
const ADMIN_SESSION_KEY = 'splitx_admin_session';

function load<T>(key: string, fallback: T): T {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
}

interface StoredUser {
  user: { id: string; name: string; email: string; avatar: string; color: string; createdAt: string };
  password: string;
}

interface Group {
  id: string; name: string; icon: string; members: string[]; createdAt: string;
}

interface Expense {
  id: string; groupId: string; description: string; amount: number; paidBy: string; splitBetween: string[]; date: string; category: string;
}

interface Settlement {
  id: string; groupId: string; from: string; to: string; amount: number; date: string;
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      onLogin();
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, hsl(42 100% 50%), transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-[0.02]" style={{ background: 'radial-gradient(circle, hsl(45 100% 65%), transparent 70%)' }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="glass-gold rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-gold font-playfair">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">SplitX Management Console</p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">{error}</div>}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Username</label>
              <input value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="Enter admin username" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="Enter admin password"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button onClick={handleLogin}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-lg hover:shadow-lg hover:shadow-yellow-500/20 transition-all active:scale-[0.98]">
            Access Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const users = useMemo(() => load<Record<string, StoredUser>>(USERS_KEY, {}), [refreshKey]);
  const groups = useMemo(() => load<Group[]>(GROUPS_KEY, []), [refreshKey]);
  const expenses = useMemo(() => load<Expense[]>(EXPENSES_KEY, []), [refreshKey]);
  const settlements = useMemo(() => load<Settlement[]>(SETTLEMENTS_KEY, []), [refreshKey]);
  const activeSessionId = localStorage.getItem(SESSION_KEY);

  const userList = useMemo(() => Object.values(users), [users]);
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return userList;
    const q = search.toLowerCase();
    return userList.filter(u => u.user.name.toLowerCase().includes(q) || u.user.email.toLowerCase().includes(q) || u.user.id.includes(q));
  }, [userList, search]);

  const getUserGroups = (userId: string) => groups.filter(g => g.members.includes(userId));
  const getUserExpenses = (userId: string) => expenses.filter(e => e.paidBy === userId || e.splitBetween.includes(userId));
  const getUserSettlements = (userId: string) => settlements.filter(s => s.from === userId || s.to === userId);
  const getUserTotalSpent = (userId: string) => expenses.filter(e => e.paidBy === userId).reduce((s, e) => s + e.amount, 0);

  const deleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    const updated = { ...users };
    delete updated[userId];
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    if (activeSessionId === userId) localStorage.removeItem(SESSION_KEY);
    setRefreshKey(k => k + 1);
  };

  const totalExpenseAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const totalSettled = settlements.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-black text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gold font-playfair">SplitX Admin</h1>
              <p className="text-xs text-muted-foreground">Management Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setRefreshKey(k => k + 1)} className="px-3 py-2 rounded-lg bg-white/5 text-sm text-muted-foreground hover:text-gold transition-colors">
              Refresh
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: userList.length, icon: Users, color: 'from-yellow-500 to-amber-600' },
            { label: 'Total Groups', value: groups.length, icon: Hash, color: 'from-blue-500 to-cyan-500' },
            { label: 'Total Expenses', value: `₹${totalExpenseAmount.toLocaleString()}`, icon: Activity, color: 'from-emerald-500 to-green-500' },
            { label: 'Total Settled', value: `₹${totalSettled.toLocaleString()}`, icon: Calendar, color: 'from-purple-500 to-pink-500' },
          ].map(stat => (
            <div key={stat.label} className="glass-gold rounded-2xl p-4">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-4 h-4 text-black" />
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold text-gold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="Search users by name, email, or ID..." />
        </div>

        {/* Users */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gold font-playfair">All Users ({filteredUsers.length})</h2>
          </div>

          <AnimatePresence>
            {filteredUsers.length === 0 ? (
              <div className="glass-gold rounded-2xl p-8 text-center text-muted-foreground">No users found</div>
            ) : (
              filteredUsers.map(entry => {
                const u = entry.user;
                const isExpanded = expandedUser === u.id;
                const uGroups = getUserGroups(u.id);
                const uExpenses = getUserExpenses(u.id);
                const uSettlements = getUserSettlements(u.id);
                const totalSpent = getUserTotalSpent(u.id);
                const isOnline = activeSessionId === u.id;

                return (
                  <motion.div key={u.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-gold rounded-2xl overflow-hidden">
                    {/* User Row */}
                    <button onClick={() => setExpandedUser(isExpanded ? null : u.id)} className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${u.color}20`, border: `2px solid ${u.color}40` }}>
                          {u.avatar}
                        </div>
                        {isOnline && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground truncate">{u.name}</p>
                          {isOnline && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">ONLINE</span>}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-gold font-medium">{uGroups.length} groups</p>
                        <p className="text-xs text-muted-foreground">₹{totalSpent.toLocaleString()} spent</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </button>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="border-t border-white/5 overflow-hidden">
                          <div className="p-4 space-y-4">
                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <InfoRow label="User ID" value={u.id} />
                              <InfoRow label="Email" value={u.email} />
                              <InfoRow label="Joined" value={new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
                              <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
                                <span className="text-xs text-muted-foreground">Password</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono text-foreground">{showPasswords[u.id] ? entry.password : '••••••••'}</span>
                                  <button onClick={(e) => { e.stopPropagation(); setShowPasswords(p => ({ ...p, [u.id]: !p[u.id] })); }}
                                    className="text-muted-foreground hover:text-gold transition-colors">
                                    {showPasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Groups */}
                            {uGroups.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Groups ({uGroups.length})</p>
                                <div className="flex flex-wrap gap-2">
                                  {uGroups.map(g => (
                                    <span key={g.id} className="text-xs px-3 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                                      {g.icon} {g.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recent Expenses */}
                            {uExpenses.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Recent Expenses ({uExpenses.length})</p>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                  {uExpenses.slice(0, 5).map(e => (
                                    <div key={e.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-xs">
                                      <span className="text-foreground">{e.description}</span>
                                      <span className={e.paidBy === u.id ? 'text-green-400' : 'text-red-400'}>
                                        {e.paidBy === u.id ? '+' : '-'}₹{(e.amount / (e.paidBy === u.id ? 1 : e.splitBetween.length)).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Settlements */}
                            {uSettlements.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Settlements ({uSettlements.length})</p>
                                <div className="space-y-1.5">
                                  {uSettlements.slice(0, 3).map(s => (
                                    <div key={s.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-xs">
                                      <span className="text-muted-foreground">{s.from === u.id ? 'Paid →' : '← Received'}</span>
                                      <span className="text-gold">₹{s.amount.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-white/5 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-gold">{uGroups.length}</p>
                                <p className="text-[10px] text-muted-foreground">Groups</p>
                              </div>
                              <div className="bg-white/5 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-emerald-400">{uExpenses.length}</p>
                                <p className="text-[10px] text-muted-foreground">Expenses</p>
                              </div>
                              <div className="bg-white/5 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-purple-400">₹{totalSpent.toLocaleString()}</p>
                                <p className="text-[10px] text-muted-foreground">Total Spent</p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end">
                              <button onClick={(e) => { e.stopPropagation(); deleteUser(u.id); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm">
                                <Trash2 className="w-4 h-4" /> Delete User
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* All Groups */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gold font-playfair">All Groups ({groups.length})</h2>
          {groups.length === 0 ? (
            <div className="glass-gold rounded-2xl p-6 text-center text-muted-foreground text-sm">No groups created yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groups.map(g => {
                const groupExpenses = expenses.filter(e => e.groupId === g.id);
                const groupTotal = groupExpenses.reduce((s, e) => s + e.amount, 0);
                return (
                  <div key={g.id} className="glass-gold rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{g.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{g.members.length} members · Created {g.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{groupExpenses.length} expenses</span>
                      <span className="text-gold font-medium">₹{groupTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {g.members.map(mId => {
                        const member = users[mId];
                        return (
                          <span key={mId} className="text-xs px-2 py-1 rounded-md bg-white/5 text-muted-foreground">
                            {member ? `${member.user.avatar} ${member.user.name}` : mId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground font-mono truncate max-w-[60%] text-right">{value}</span>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem(ADMIN_SESSION_KEY) === 'true');

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthenticated(false);
  };

  if (!authenticated) return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
}
