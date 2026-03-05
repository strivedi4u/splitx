import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Link } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface JoinGroupSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function JoinGroupSheet({ open, onClose }: JoinGroupSheetProps) {
  const { joinGroup } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [joinedGroupName, setJoinedGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      const result = await joinGroup(code.trim().toUpperCase());
      if (result.success) {
        setJoinedGroupName(result.groupName || '');
        setShowSuccess(true);
      } else {
        setError(result.error || 'Invalid code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setCode('');
    setError('');
    onClose();
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
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-14 px-5">
                <motion.div className="w-20 h-20 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center mb-4"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}>
                  <Check size={40} className="text-neon-green" />
                </motion.div>
                <p className="text-xl font-bold text-foreground font-display">Joined Successfully!</p>
                <p className="text-sm text-muted-foreground mt-1">Welcome to {joinedGroupName} 🎉</p>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleClose}
                  className="w-full gradient-gold rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-gold mt-8">
                  Done
                </motion.button>
              </motion.div>
            ) : (
              <div className="px-5 pt-4 pb-8">
                <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-primary/20" /></div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground font-display flex items-center gap-2"><Link size={20} className="text-primary" /> Join Group</h2>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <X size={16} className="text-muted-foreground" />
                  </motion.button>
                </div>

                <div className="mb-5">
                  <label className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2 block">Invite Code</label>
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full bg-secondary/60 rounded-2xl px-4 py-4 text-2xl text-center text-foreground placeholder:text-muted-foreground outline-none border border-border/30 focus:border-primary/30 transition-colors font-display font-bold tracking-[0.5em]" />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-xs font-semibold mb-4 text-center">
                    {error}
                  </motion.p>
                )}

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleJoin} disabled={code.length < 4 || loading}
                  className="w-full gradient-gold rounded-2xl py-4 text-base font-bold text-primary-foreground disabled:opacity-40 shadow-gold flex justify-center items-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : 'Join Group'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
