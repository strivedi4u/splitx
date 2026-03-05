import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Check, Trash2, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { useNotifications, AppNotification } from '@/context/NotificationContext';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icon & colour per notification type
const typeConfig: Record<
  AppNotification['type'],
  { icon: string; accent: string }
> = {
  expense_added:       { icon: '💸', accent: 'text-amber-400' },
  settlement_made:     { icon: '🤝', accent: 'text-emerald-400' },
  settlement_received: { icon: '💰', accent: 'text-emerald-400' },
  member_joined:       { icon: '👋', accent: 'text-blue-400' },
  broadcast:           { icon: '📢', accent: 'text-primary' },
  connected:           { icon: '✅', accent: 'text-green-400' },
};

const SERVER_BASE = (import.meta.env.VITE_API_URL || 'https://splitx.azurewebsites.net/api').replace('/api', '');

function resolveImgUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SERVER_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)  return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll, isConnected } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleNotificationClick = (n: AppNotification) => {
    markRead(n.id);
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={handleOpen}
        className="relative w-10 h-10 rounded-2xl glass-gold flex items-center justify-center"
        aria-label="Notifications"
      >
        <AnimatePresence mode="wait">
          {unreadCount > 0 ? (
            <motion.span
              key="ring"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
            >
              <BellRing size={18} className="text-primary" />
            </motion.span>
          ) : (
            <motion.span
              key="bell"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
            >
              <Bell size={18} className="text-primary" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center leading-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-white/10 bg-[#1a1a2e]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <BellRing size={15} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">Notifications</span>
                  {/* Connection indicator */}
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <Wifi size={10} /> Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-red-400">
                      <WifiOff size={10} /> Offline
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={markAllRead}
                      className="p-1.5 rounded-lg hover:bg-white/8 text-muted-foreground hover:text-foreground transition-colors"
                      title="Mark all read"
                    >
                      <Check size={14} />
                    </motion.button>
                  )}
                  {notifications.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={clearAll}
                      className="p-1.5 rounded-lg hover:bg-white/8 text-muted-foreground hover:text-red-400 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* List */}
              <ScrollArea className="max-h-[360px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                    <Bell size={28} className="opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                    <p className="text-xs opacity-60">
                      You'll see updates from your groups here
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    <AnimatePresence initial={false}>
                      {notifications.map((n) => {
                        const cfg = typeConfig[n.type] ?? { icon: '🔔', accent: 'text-primary' };
                        return (
                          <motion.button
                            key={n.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => handleNotificationClick(n)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                              !n.read ? 'bg-white/[0.03]' : ''
                            }`}
                          >
                            {/* Icon or image */}
                            {n.imageUrl ? (
                              <img
                                src={resolveImgUrl(n.imageUrl)}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover shrink-0 mt-0.5"
                              />
                            ) : (
                              <span className="text-lg leading-none mt-0.5 shrink-0">
                                {cfg.icon}
                              </span>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-[12px] font-semibold truncate ${cfg.accent}`}>
                                  {n.title}
                                </p>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {timeAgo(n.timestamp)}
                                </span>
                              </div>
                              <p className="text-[12px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                {n.actorName && n.actorName !== 'SplitX' && (
                                  <span className="inline-flex items-center text-[10px] font-medium text-muted-foreground/70 bg-white/5 px-1.5 py-0.5 rounded-full">
                                    {n.actorName}
                                  </span>
                                )}
                                {n.fromName && (
                                  <span className="inline-flex items-center text-[10px] font-medium text-muted-foreground/70 bg-white/5 px-1.5 py-0.5 rounded-full">
                                    {n.fromName}
                                  </span>
                                )}
                                {n.groupName && (
                                  <span className="inline-flex items-center text-[10px] font-medium text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-full">
                                    {n.groupName}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Unread dot */}
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                            )}
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
