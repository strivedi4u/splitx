import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Users, Receipt, PieChart, Bell, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: '💰',
    lucide: Sparkles,
    color: 'from-amber-500/20 to-yellow-600/10',
    accentColor: 'hsl(42 100% 50%)',
    title: 'Welcome to SplitX',
    subtitle: 'The smartest way to split expenses',
    description:
      'Say goodbye to awkward money conversations. SplitX makes splitting bills effortless, fair, and transparent.',
    particles: ['💎', '✨', '🌟', '⚡'],
  },
  {
    icon: '👥',
    lucide: Users,
    color: 'from-blue-500/20 to-indigo-600/10',
    accentColor: 'hsl(220 90% 56%)',
    title: 'Create Groups',
    subtitle: 'Organize with friends & family',
    description:
      'Create groups for trips, roommates, dinners — anything! Invite friends with a simple code and start splitting instantly.',
    particles: ['🏠', '✈️', '🍕', '🎉'],
  },
  {
    icon: '📸',
    lucide: Receipt,
    color: 'from-emerald-500/20 to-green-600/10',
    accentColor: 'hsl(160 84% 39%)',
    title: 'Track Expenses',
    subtitle: 'Add bills with photos & categories',
    description:
      'Snap a photo of the receipt, categorize it, and let SplitX calculate every member\'s fair share automatically.',
    particles: ['🧾', '📊', '💳', '🔢'],
  },
  {
    icon: '📈',
    lucide: PieChart,
    color: 'from-purple-500/20 to-violet-600/10',
    accentColor: 'hsl(270 76% 53%)',
    title: 'Smart Analytics',
    subtitle: 'See where your money goes',
    description:
      'Beautiful charts and breakdowns show your spending patterns by category, month, and group — all in real-time.',
    particles: ['📉', '🎯', '💡', '🏆'],
  },
  {
    icon: '🔔',
    lucide: Bell,
    color: 'from-rose-500/20 to-pink-600/10',
    accentColor: 'hsl(350 89% 60%)',
    title: 'Stay Notified',
    subtitle: 'Real-time updates, always',
    description:
      'Get instant notifications when someone adds an expense, settles up, or joins your group. Never miss a beat.',
    particles: ['📲', '⚡', '🔥', '💬'],
  },
];

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setDirection(1);
      setCurrent((c) => c + 1);
    }
  }, [isLast, onComplete]);

  const goBack = useCallback(() => {
    if (current > 0) {
      setDirection(-1);
      setCurrent((c) => c - 1);
    }
  }, [current]);

  const skip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.92 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.92 }),
  };

  return (
    <div className="h-full w-full bg-background flex flex-col relative overflow-hidden select-none">
      {/* Ambient background */}
      <div
        className="absolute top-[-25%] left-[-20%] w-[80%] h-[60%] rounded-full opacity-[0.06] transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${slide.accentColor}, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[50%] rounded-full opacity-[0.04] transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${slide.accentColor}, transparent 70%)`,
        }}
      />

      {/* Skip button */}
      {!isLast && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={skip}
          className="absolute top-12 right-5 z-20 text-[12px] font-semibold text-muted-foreground/60 hover:text-foreground transition-colors px-3 py-1.5 rounded-full bg-secondary/50"
        >
          Skip
        </motion.button>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Floating particles */}
            <div className="relative mb-6">
              {slide.particles.map((p, i) => (
                <motion.span
                  key={`${current}-${i}`}
                  className="absolute text-2xl"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1.2, 0.5],
                    x: [0, (i % 2 === 0 ? 1 : -1) * (40 + i * 15)],
                    y: [0, -(30 + i * 12)],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {p}
                </motion.span>
              ))}

              {/* Main icon */}
              <motion.div
                className={`w-28 h-28 rounded-[32px] bg-gradient-to-br ${slide.color} flex items-center justify-center border border-white/10 shadow-2xl relative`}
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 1, -1, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-5xl">{slide.icon}</span>

                {/* Glow ring */}
                <motion.div
                  className="absolute inset-[-4px] rounded-[36px] border-2"
                  style={{ borderColor: `${slide.accentColor}30` }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Title */}
            <motion.h1
              className="text-[28px] font-extrabold font-display text-foreground leading-tight mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {slide.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-[15px] font-bold mb-4"
              style={{ color: slide.accentColor }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {slide.subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-[13px] text-muted-foreground leading-relaxed max-w-[300px]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section: indicators + buttons */}
      <div className="pb-12 px-8 relative z-10 space-y-8">
        {/* Page indicators */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className="relative h-2 rounded-full overflow-hidden"
              animate={{
                width: i === current ? 28 : 8,
                backgroundColor: i === current ? slide.accentColor : 'hsl(var(--muted-foreground) / 0.2)',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            >
              {i === current && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: slide.accentColor }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {/* Back button */}
          {current > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              whileTap={{ scale: 0.94 }}
              onClick={goBack}
              className="w-14 h-14 rounded-2xl bg-secondary/60 border border-border/40 flex items-center justify-center text-muted-foreground shrink-0"
            >
              <ChevronRight size={20} className="rotate-180" />
            </motion.button>
          )}

          {/* Next / Get Started button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={goNext}
            className="flex-1 h-14 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all"
            style={{
              background: isLast
                ? `linear-gradient(135deg, hsl(42 100% 50%), hsl(45 100% 42%))`
                : `linear-gradient(135deg, ${slide.accentColor}, ${slide.accentColor}dd)`,
              color: 'white',
              boxShadow: `0 8px 32px ${slide.accentColor}40`,
            }}
          >
            {isLast ? (
              <>
                Get Started
                <Sparkles size={18} />
              </>
            ) : (
              <>
                Next
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </div>

        {/* Login hint on last slide */}
        {isLast && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-[11px] text-muted-foreground/50"
          >
            Create an account or sign in to continue
          </motion.p>
        )}
      </div>
    </div>
  );
}
