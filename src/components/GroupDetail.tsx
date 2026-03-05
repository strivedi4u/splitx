import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Handshake, Copy, LogOut, Users, ImageIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import AnimatedNumber from './AnimatedNumber';
import ExpenseImageViewer from './ExpenseImageViewer';
import { useState } from 'react';

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
  onAddExpense: () => void;
  onSettle: (groupId: string) => void;
}

export default function GroupDetail({ groupId, onBack, onAddExpense, onSettle }: GroupDetailProps) {
  const { getGroupById, getGroupExpenses, getGroupSettlements, getGroupBalances, getUserById, leaveGroup, getGroupInviteCode, updateExpense } = useApp();
  const group = getGroupById(groupId);
  const expenses = getGroupExpenses(groupId);
  const settlements = getGroupSettlements ? getGroupSettlements(groupId) : [];
  const balances = getGroupBalances(groupId);
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageViewer, setImageViewer] = useState<{ expenseId: string; images: string[]; desc: string } | null>(null);

  if (!group) return null;

  const inviteCode = getGroupInviteCode(groupId);
  const members = group.members.map(id => getUserById(id)).filter(Boolean);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => { leaveGroup(groupId); onBack(); };

  const openImages = (expenseId: string, images: string[], desc: string) => {
    setImageViewer({ expenseId, images, desc });
  };

  const handleUpdateImages = (expenseId: string, imgs: string[]) => {
    updateExpense(expenseId, { imageUrls: imgs });
    if (imageViewer) setImageViewer(prev => prev ? { ...prev, images: imgs } : null);
  };

  return (
    <>
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute inset-0 bg-background z-30 overflow-y-auto pb-28"
      >
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="w-10 h-10 rounded-2xl glass-premium flex items-center justify-center">
            <ArrowLeft size={20} className="text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
              <span className="text-xl">{group.icon}</span> {group.name}
            </h1>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowInvite(!showInvite)}
            className="w-10 h-10 rounded-2xl glass-premium flex items-center justify-center">
            <Users size={18} className="text-primary" />
          </motion.button>
        </div>

        <div className="px-5 space-y-4">
          {/* Invite Code Section */}
          <AnimatePresence>
            {showInvite && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="glass-gold rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest">Invite Code</p>
                      <p className="text-2xl font-extrabold text-gradient-gold font-display tracking-wider mt-1">{inviteCode}</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopy}
                      className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center shadow-gold">
                      <Copy size={18} className="text-primary-foreground" />
                    </motion.button>
                  </div>
                  {copied && <p className="text-neon-green text-xs font-semibold">Copied to clipboard!</p>}

                  <div className="divider-gold my-3" />
                  <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2">Members ({members.length})</p>
                  <div className="space-y-2">
                    {members.map(m => m && (
                      <div key={m.id} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/[0.08] border border-primary/[0.06] flex items-center justify-center text-sm">{m.avatar}</div>
                        <span className="text-[12px] font-semibold text-foreground">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Balances */}
          <div className="glass-gold rounded-2xl p-4">
            <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest mb-3">Who owes whom</p>
            <div className="space-y-2.5">
              {balances.map((b) => {
                const user = getUserById(b.userId);
                if (!user) return null;
                return (
                  <div key={b.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-primary/[0.08] border border-primary/[0.06] flex items-center justify-center text-sm">{user.avatar}</div>
                      <span className="text-[13px] font-semibold text-foreground">{user.name}</span>
                    </div>
                    <span className={`text-[13px] font-bold ${b.amount > 0 ? 'text-neon-green' : 'text-destructive'}`}>
                      {b.amount > 0 ? 'owes you' : 'you owe'} ₹{Math.abs(Math.round(b.amount)).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
              {balances.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">All settled up! 🎉</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={onAddExpense}
              className="flex-1 gradient-gold rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-primary-foreground shadow-gold">
              <Plus size={18} /> Add Expense
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => onSettle(groupId)}
              className="flex-1 glass-gold rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-foreground">
              <Handshake size={18} /> Settle Up
            </motion.button>
          </div>

          {/* Expenses */}
          <div>
            <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest mb-3">Expenses</p>
            <div className="space-y-2">
              {expenses.length === 0 && settlements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No expenses yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Add your first expense above</p>
                </div>
              ) : (
                [...expenses, ...settlements]
                  .sort((a, b) => new Date(b.date || (a as any).createdAt).getTime() - new Date(a.date || (b as any).createdAt).getTime())
                  .map((item, i) => {
                    const isSettlement = 'from' in item;

                    if (isSettlement) {
                      const s = item as any;
                      const fromUser = getUserById(s.from);
                      const toUser = getUserById(s.to);
                      return (
                        <motion.div key={`s-${s.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="glass-premium rounded-2xl p-3.5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-base">🤝</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-foreground truncate">{fromUser?.name} paid {toUser?.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-neon-green font-display">₹{s.amount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    const exp = item as any;
                    const payer = getUserById(exp.paidBy);
                    const hasImgs = exp.imageUrls && exp.imageUrls.length > 0;
                    return (
                      <motion.div key={`e-${exp.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-premium rounded-2xl p-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/[0.08] border border-primary/[0.06] flex items-center justify-center text-base">💸</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-foreground truncate">{exp.description}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Paid by {payer?.name} • {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Image button */}
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => openImages(exp.id, exp.imageUrls || [], exp.description)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center relative transition-all ${hasImgs
                                ? 'bg-primary/15 border border-primary/30'
                                : 'bg-secondary/60 border border-border/30'
                                }`}
                            >
                              <ImageIcon size={14} className={hasImgs ? 'text-primary' : 'text-muted-foreground/50'} />
                              {hasImgs && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center">
                                  {exp.imageUrls!.length}
                                </span>
                              )}
                            </motion.button>
                            <span className="text-sm font-bold text-gradient-gold font-display">₹{exp.amount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Image strip preview */}
                        {hasImgs && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="flex gap-1.5 mt-2.5 overflow-x-auto">
                            {exp.imageUrls!.slice(0, 4).map((img: string, idx: number) => (
                              <button key={idx}
                                onClick={() => openImages(exp.id, exp.imageUrls!, exp.description)}
                                className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-primary/20 relative">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                {idx === 3 && exp.imageUrls!.length > 4 && (
                                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center text-[10px] font-bold text-foreground">
                                    +{exp.imageUrls!.length - 4}
                                  </div>
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Leave Group */}
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleLeave}
            className="w-full glass-premium rounded-2xl p-4 flex items-center justify-center gap-2 text-destructive font-bold text-sm mb-4">
            <LogOut size={17} /> Leave Group
          </motion.button>
        </div>
      </motion.div>

      {/* Image Viewer Overlay */}
      <AnimatePresence>
        {imageViewer && (
          <ExpenseImageViewer
            images={imageViewer.images}
            expenseId={imageViewer.expenseId}
            expenseDesc={imageViewer.desc}
            onClose={() => setImageViewer(null)}
            onUpdateImages={handleUpdateImages}
          />
        )}
      </AnimatePresence>
    </>
  );
}
