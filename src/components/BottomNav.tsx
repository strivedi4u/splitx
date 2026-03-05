import { motion } from 'framer-motion';
import { Home, Users, BarChart3, User } from 'lucide-react';

type Tab = 'dashboard' | 'groups' | 'activity' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: 'dashboard' as Tab, label: 'Home', icon: Home },
  { id: 'groups' as Tab, label: 'Groups', icon: Users },
  { id: 'activity' as Tab, label: 'Stats', icon: BarChart3 },
  { id: 'profile' as Tab, label: 'Profile', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: 'hsl(0 0% 5% / 0.95)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderTop: '1px solid hsl(42 100% 50% / 0.08)',
      }}
    >
      <nav className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 px-5 py-2"
              whileTap={{ scale: 0.88 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'hsl(42 100% 50% / 0.08)', border: '1px solid hsl(42 100% 50% / 0.06)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={`relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span className={`text-[9px] font-bold relative z-10 tracking-wide transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
