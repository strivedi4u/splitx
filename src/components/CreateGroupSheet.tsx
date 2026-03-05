import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Copy, Users } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface CreateGroupSheetProps {
  open: boolean;
  onClose: () => void;
}

const iconOptions = ['🏖️', '🏠', '🍕', '🎉', '✈️', '🎮', '🛒', '💼', '🎓', '⚽', '🎬', '🏋️'];

export default function CreateGroupSheet({ open, onClose }: CreateGroupSheetProps) {
  const { createGroup } = useApp();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏖️');
  const [showSuccess, setShowSuccess] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const result = await createGroup(name.trim(), icon);
      setInviteCode(result.inviteCode);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setName('');
    setIcon('🏖️');
    setInviteCode('');
    onClose();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40" onClick={handleClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl safe-bottom"
            style={{ background: 'hsl(0 0% 6% / 0.97)', backdropFilter: 'blur(40px)', borderTop: '1px solid hsl(42 100% 50% / 0.1)' }}
          >
            {showSuccess ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-12 px-5">
                <motion.div className="w-20 h-20 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center mb-4"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}>
                  <Check size={40} className="text-neon-green" />
                </motion.div>
                <p className="text-xl font-bold text-foreground font-display">Group Created!</p>
                <p className="text-sm text-muted-foreground mt-1">Share this invite code</p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="w-full glass-gold rounded-2xl p-4 mt-5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest">Invite Code</p>
                    <p className="text-2xl font-extrabold text-gradient-gold font-display tracking-wider mt-1">{inviteCode}</p>
                  </div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={copyCode}
                    className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center shadow-gold">
                    <Copy size={18} className="text-primary-foreground" />
                  </motion.button>
                </motion.div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleClose}
                  className="w-full gradient-gold rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-gold mt-5">
                  Done
                </motion.button>
              </motion.div>
            ) : (
              <div className="px-5 pt-4 pb-8">
                <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-primary/20" /></div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground font-display flex items-center gap-2"><Users size={20} className="text-primary" /> Create Group</h2>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <X size={16} className="text-muted-foreground" />
                  </motion.button>
                </div>

                <div className="mb-5">
                  <label className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2 block">Group Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Goa Trip 2026"
                    className="w-full bg-secondary/60 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/30 focus:border-primary/30 transition-colors" />
                </div>

                <div className="mb-6">
                  <label className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2 block">Choose Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {iconOptions.map(ic => (
                      <button key={ic} onClick={() => setIcon(ic)}
                        className={`w-12 h-12 rounded-xl text-xl flex items-center justify-center transition-all ${icon === ic ? 'gradient-gold shadow-gold scale-110' : 'bg-secondary/60 border border-border/30'}`}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={!name.trim() || loading}
                  className="w-full gradient-gold rounded-2xl py-4 text-base font-bold text-primary-foreground disabled:opacity-40 shadow-gold flex justify-center items-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : 'Create Group'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
