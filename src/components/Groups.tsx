import { motion } from 'framer-motion';
import { ChevronRight, Search, Plus, Link } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useState } from 'react';

interface GroupsProps {
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } } as const,
};

export default function Groups({ onSelectGroup, onCreateGroup, onJoinGroup }: GroupsProps) {
  const { groups, getUserById, getGroupBalances } = useApp();
  const [search, setSearch] = useState('');

  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="px-5 pt-5 pb-28 overflow-y-auto h-full space-y-5"
    >
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Groups</h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{groups.length} active groups</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onJoinGroup}
            className="w-10 h-10 rounded-2xl glass-premium flex items-center justify-center border border-border/30">
            <Link size={16} className="text-primary" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onCreateGroup}
            className="w-10 h-10 rounded-2xl gradient-gold flex items-center justify-center shadow-gold">
            <Plus size={18} className="text-primary-foreground" />
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-premium rounded-2xl px-4 py-3 flex items-center gap-3">
        <Search size={16} className="text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search groups..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={item} className="text-center py-16">
          <div className="w-20 h-20 rounded-3xl gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold">
            <Plus size={32} className="text-primary-foreground" />
          </div>
          <p className="text-foreground font-bold font-display text-lg">No groups yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create or join a group to get started</p>
          <div className="flex gap-3 mt-5 px-8">
            <motion.button whileTap={{ scale: 0.97 }} onClick={onCreateGroup}
              className="flex-1 gradient-gold rounded-2xl py-3 text-sm font-bold text-primary-foreground shadow-gold">
              Create
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onJoinGroup}
              className="flex-1 glass-gold rounded-2xl py-3 text-sm font-bold text-foreground">
              Join
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((group) => {
            const balances = getGroupBalances(group.id);
            const net = balances.reduce((sum, b) => sum + b.amount, 0);
            const members = group.members.map(id => getUserById(id)).filter(Boolean);

            return (
              <motion.button
                key={group.id}
                variants={item}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectGroup(group.id)}
                className="w-full text-left glass-gold rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-[52px] h-[52px] rounded-2xl bg-primary/[0.08] border border-primary/[0.06] flex items-center justify-center text-2xl shrink-0">
                  {group.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-foreground">{group.name}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {members.slice(0, 4).map((m, i) => (
                      <div key={m!.id}
                        className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px]"
                        style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: 4 - i, border: '2px solid hsl(var(--background))' }}>
                        {m!.avatar}
                      </div>
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">{members.length} members</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-sm font-extrabold font-display ${net >= 0 ? 'text-neon-green' : 'text-destructive'}`}>
                    {net >= 0 ? '+' : ''}₹{Math.abs(Math.round(net)).toLocaleString('en-IN')}
                  </span>
                  <ChevronRight size={14} className="text-primary/40" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
