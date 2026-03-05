import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Image as ImageIcon, Megaphone, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://splitx.azurewebsites.net/api';

interface SendNotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'uploading' | 'sending' | 'success' | 'error';

export default function SendNotificationSheet({ isOpen, onClose }: SendNotificationSheetProps) {
  const { user } = useAuth();

  const broadcastNotification = useCallback(async (title: string, description: string, imageUrl?: string) => {
    const token = localStorage.getItem('splitx_token');
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description, imageUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to send');
    }
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle('');
    setDescription('');
    setImagePreview(null);
    setImageUrl(null);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setImageUrl(null);
    setStatus('uploading');

    try {
      const token = localStorage.getItem('splitx_token');
      const form = new FormData();
      form.append('images', file);

      const res = await fetch(`${API_BASE_URL}/expenses/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const url = data.imageUrls?.[0] ?? null;
      setImageUrl(url);
      if (url) setImagePreview(`${API_BASE_URL.replace('/api', '')}${url}`);
    } catch {
      // Keep local preview but no server url — still OK to send without image
    } finally {
      setStatus('idle');
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Title and description are required.');
      return;
    }
    if (status === 'sending' || status === 'success') return;
    setErrorMsg('');
    setStatus('sending');
    try {
      await broadcastNotification(title.trim(), description.trim(), imageUrl ?? undefined);
      setStatus('success');
      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const canSend = title.trim().length > 0 && description.trim().length > 0;
  const isBusy = status === 'sending' || status === 'success' || status === 'uploading';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[28px] overflow-hidden"
            style={{ maxHeight: '92vh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center shadow-gold">
                  <Megaphone size={18} className="text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-foreground">Send Notification</h2>
                  <p className="text-[11px] text-muted-foreground">Broadcast to all users</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
              >
                <X size={16} className="text-muted-foreground" />
              </motion.button>
            </div>

            <div className="overflow-y-auto px-5 pb-8 pt-5 space-y-5" style={{ maxHeight: 'calc(92vh - 90px)' }}>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Notification Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Important Announcement 📢"
                  className="w-full bg-secondary/60 border border-border/50 rounded-2xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <p className="text-right text-[10px] text-muted-foreground/40">{title.length}/80</p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Message / Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Type the full notification message here..."
                  className="w-full bg-secondary/60 border border-border/50 rounded-2xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none transition-all"
                />
                <p className="text-right text-[10px] text-muted-foreground/40">{description.length}/500</p>
              </div>

              {/* Image */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Photo (optional)
                </label>
                {!imagePreview ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border/50 rounded-2xl py-8 flex flex-col items-center gap-2 text-muted-foreground/60 hover:border-primary/40 hover:text-primary/60 transition-all"
                  >
                    <ImageIcon size={28} strokeWidth={1.5} />
                    <span className="text-[12px] font-medium">Tap to add a photo</span>
                    <span className="text-[10px] opacity-70">JPG, PNG, WEBP up to 5 MB</span>
                  </motion.button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                    {status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 size={24} className="text-white animate-spin" />
                      </div>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
                    >
                      <Trash2 size={14} className="text-white" />
                    </motion.button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagePick}
                />
              </div>

              {/* Preview Card */}
              {(title || description) && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Preview
                  </label>
                  <div className="glass-premium rounded-2xl p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                        {user?.avatar || '😎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[12px] font-bold text-foreground">
                            {title || 'Notification Title'}
                          </span>
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                            📢 Broadcast
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-3">
                          {description || 'Your message will appear here...'}
                        </p>
                        {imagePreview && (
                          <img src={imagePreview} alt="" className="mt-2 w-full h-24 object-cover rounded-xl" />
                        )}
                        <p className="text-[9px] text-muted-foreground/50 mt-1">
                          From {user?.name || 'You'} · just now
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-2xl"
                >
                  <AlertCircle size={14} className="text-destructive shrink-0" />
                  <p className="text-[12px] text-destructive">{errorMsg}</p>
                </motion.div>
              )}

              {/* Send Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSend}
                disabled={!canSend || isBusy}
                className="w-full py-4 rounded-2xl font-bold text-[14px] gradient-gold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: (canSend && !isBusy) ? '0 6px 24px hsl(42 100% 50% / 0.25)' : 'none' }}
              >
                {status === 'sending' && <Loader2 size={18} className="animate-spin" />}
                {status === 'success' && <CheckCircle2 size={18} />}
                {(status === 'idle' || status === 'uploading' || status === 'error') && <Send size={18} />}
                {status === 'sending' ? 'Sending to all users...' :
                 status === 'success' ? 'Sent successfully!' :
                 'Send to All Users'}
              </motion.button>

              <p className="text-center text-[10px] text-muted-foreground/40">
                This notification will be delivered to all registered users in real-time.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
