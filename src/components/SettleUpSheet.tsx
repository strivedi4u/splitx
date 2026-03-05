import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface SettleUpSheetProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
}

export default function SettleUpSheet({ open, onClose, groupId }: SettleUpSheetProps) {
  const { getGroupBalances, getUserById, addSettlement, currentUser } = useApp();
  const balances = getGroupBalances(groupId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settledUser, setSettledUser] = useState('');

  const debts = balances.filter(b => b.amount < 0);

  const handleSettle = (userId: string, amount: number) => {
    const user = getUserById(userId);
    setSettledUser(user?.name || '');
    addSettlement({ groupId, from: currentUser.id, to: userId, amount: Math.abs(amount), date: new Date().toISOString().split('T')[0] });
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); onClose(); }, 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl safe-bottom"
            style={{ background: 'hsl(0 0% 6% / 0.97)', backdropFilter: 'blur(40px)', borderTop: '1px solid hsl(42 100% 50% / 0.1)' }}
          >
            {showSuccess ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-14 px-5">
                <motion.div className="w-20 h-20 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center mb-5"
                  initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}>
                  <CheckCircle size={44} className="text-neon-green" />
                </motion.div>
                <p className="text-xl font-bold text-foreground font-display">Settlement Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">Paid to {settledUser} ✨</p>
                <motion.div className="w-full glass-gold rounded-2xl p-4 mt-6 space-y-3"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-neon-green font-semibold flex items-center gap-1"><Check size={12} /> Success</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground font-medium">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="px-5 pt-4 pb-8">
                <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-primary/20" /></div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground font-display">Settle Up</h2>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <X size={16} className="text-muted-foreground" />
                  </motion.button>
                </div>
                {debts.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Check size={32} className="text-primary" />
                    </div>
                    <p className="text-foreground font-semibold">All settled up!</p>
                    <p className="text-sm text-muted-foreground mt-1">No pending payments ✨</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {debts.map(debt => {
                      const user = getUserById(debt.userId);
                      if (!user) return null;
                      return (
                        <motion.button key={debt.userId} whileTap={{ scale: 0.97 }} onClick={() => handleSettle(debt.userId, debt.amount)}
                          className="w-full glass-gold rounded-2xl p-4 flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-primary/[0.08] border border-primary/[0.06] flex items-center justify-center text-xl">{user.avatar}</div>
                          <div className="flex-1 text-left">
                            <p className="text-[13px] font-bold text-foreground">Pay {user.name}</p>
                            <p className="text-[10px] text-muted-foreground">Tap to settle</p>
                          </div>
                          <span className="text-base font-extrabold text-destructive font-display">₹{Math.abs(Math.round(debt.amount)).toLocaleString('en-IN')}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
