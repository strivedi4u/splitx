import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Sparkles, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function AuthScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (!email || !password) { setError('Please fill all fields'); return; }
    if (mode === 'signup' && !name) { setError('Please enter your name'); return; }
    if (password.length < 4) { setError('Password must be at least 4 characters'); return; }

    setLoading(true);
    setTimeout(async () => {
      try {
        const result = mode === 'login' ? await login(email, password) : await signup(name, email, password);
        if (!result.success) setError(result.error || 'Something went wrong');
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="h-full w-full bg-background flex flex-col relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[40%] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, hsl(42 100% 50%), transparent 70%)' }} />
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, hsl(45 100% 65%), transparent 70%)' }} />

      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center pt-16 pb-8 relative z-10"
      >
        <motion.div
          className="w-20 h-20 rounded-3xl gradient-gold flex items-center justify-center shadow-gold mb-4"
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={36} className="text-primary-foreground" />
        </motion.div>
        <h1 className="text-3xl font-extrabold font-display text-gradient-gold">SplitX</h1>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">Split expenses with elegance</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 px-6 relative z-10"
      >
        {/* Tab toggle */}
        <div className="flex gap-0 bg-secondary/40 rounded-2xl p-1 border border-border/20 mb-6">
          {(['login', 'signup'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setMode(tab); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all flex items-center justify-center gap-2 ${mode === tab ? 'gradient-gold text-primary-foreground shadow-gold' : 'text-muted-foreground'
                }`}
            >
              {tab === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
              {tab === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {mode === 'signup' && (
              <div>
                <label className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-1.5 block">Full Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-secondary/60 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/30 focus:border-primary/30 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-1.5 block">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-secondary/60 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/30 focus:border-primary/30 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-secondary/60 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/30 focus:border-primary/30 transition-colors pr-12"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff size={18} className="text-muted-foreground" /> : <Eye size={18} className="text-muted-foreground" />}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {error && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-destructive text-xs font-semibold mt-3 text-center">
            {error}
          </motion.p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full gradient-gold rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-gold mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
          ) : (
            <>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pb-8 pt-4 relative z-10"
      >
        <p className="text-[10px] text-muted-foreground font-medium">SplitX v2.0 ✨</p>
      </motion.div>
    </div>
  );
}
