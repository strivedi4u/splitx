import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Moon, Globe, Bell, ChevronRight, LogOut, Shield, Crown, Gem, Settings } from 'lucide-react';
import { useState } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function ProfileScreen() {
  const { currentUser, groups, expenses, settlements } = useApp();
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const stats = [
    { label: 'Groups', value: groups.length, icon: '👥' },
    { label: 'Expenses', value: expenses.length, icon: '💸' },
    { label: 'Settled', value: settlements.length, icon: '🤝' },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="px-5 pt-5 pb-28 overflow-y-auto h-full space-y-5"
    >
      <motion.div variants={item} className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground font-display">Profile</h1>
        <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-2xl glass-premium flex items-center justify-center">
          <Settings size={18} className="text-muted-foreground" />
        </motion.button>
      </motion.div>

      {/* Avatar Card */}
      <motion.div variants={item} className="glass-gold rounded-3xl p-6 flex flex-col items-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, hsl(42 100% 50%), transparent 70%)' }} />

        <motion.div className="w-20 h-20 rounded-3xl gradient-gold flex items-center justify-center text-4xl relative shadow-gold">
          {currentUser.avatar}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-background flex items-center justify-center shadow-card">
            <Crown size={12} className="text-primary" />
          </div>
        </motion.div>
        <h2 className="text-lg font-bold text-foreground mt-3 font-display">{currentUser.name}</h2>
        <p className="text-[11px] text-muted-foreground">{currentUser.email}</p>
        <div className="flex items-center gap-1.5 mt-2.5 bg-primary/10 px-3 py-1 rounded-full border border-primary/10">
          <Gem size={10} className="text-primary" />
          <span className="text-[9px] text-primary font-bold tracking-wider uppercase">Premium Member</span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="flex gap-3">
        {stats.map((stat) => (
          <motion.div key={stat.label} className="flex-1 glass-premium rounded-2xl p-3.5 text-center" whileTap={{ scale: 0.96 }}>
            <span className="text-xl block">{stat.icon}</span>
            <p className="text-lg font-extrabold text-foreground mt-1 font-display">{stat.value}</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Settings */}
      <motion.div variants={item}>
        <p className="text-sm font-bold text-foreground mb-3 px-1">Settings</p>
        <div className="glass-premium rounded-2xl overflow-hidden">
          <SettingRow icon={<Moon size={17} />} label="Dark Mode" toggle value={darkMode} onChange={setDarkMode} />
          <SettingRow icon={<Globe size={17} />} label="Currency" trailing="₹ INR" />
          <SettingRow icon={<Bell size={17} />} label="Notifications" toggle value={notifications} onChange={setNotifications} />
          <SettingRow icon={<Shield size={17} />} label="Privacy & Security" trailing={<ChevronRight size={15} />} isLast />
        </div>
      </motion.div>

      <motion.div variants={item}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={logout}
          className="w-full glass-premium rounded-2xl p-4 flex items-center justify-center gap-2 text-destructive font-bold text-sm">
          <LogOut size={17} /> Sign Out
        </motion.button>
      </motion.div>

      <motion.div variants={item} className="text-center pb-4 space-y-1">
        <p className="text-[10px] text-muted-foreground font-medium">SplitX v2.0</p>
        <p className="text-[10px] text-primary/40 font-semibold">Developed by Shashank Trivedi</p>
      </motion.div>
    </motion.div>
  );
}

function SettingRow({ icon, label, toggle, value, onChange, trailing, isLast }: {
  icon: React.ReactNode; label: string; toggle?: boolean; value?: boolean;
  onChange?: (v: boolean) => void; trailing?: React.ReactNode; isLast?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-border/30' : ''}`}>
      <div className="w-8 h-8 rounded-xl bg-primary/[0.08] border border-primary/[0.06] flex items-center justify-center text-primary/60">{icon}</div>
      <span className="flex-1 text-[13px] font-semibold text-foreground">{label}</span>
      {toggle ? (
        <motion.button
          onClick={() => onChange?.(!value)}
          className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'gradient-gold' : 'bg-secondary'}`}
          whileTap={{ scale: 0.92 }}
        >
          <motion.div
            className="rounded-full bg-foreground absolute top-[3px]"
            style={{ width: 18, height: 18, boxShadow: '0 1px 4px hsl(0 0% 0% / 0.3)' }}
            animate={{ left: value ? 22 : 3 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      ) : (
        <span className="text-[13px] text-muted-foreground font-medium">{trailing}</span>
      )}
    </div>
  );
}
