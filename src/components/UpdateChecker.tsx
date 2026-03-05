import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, X, AlertTriangle, Rocket } from 'lucide-react';

/**
 * ──────────────────────────────────────────────────
 *  IMPORTANT: Bump this every time you release a
 *  new APK build. It is compared against the
 *  backend /api/version endpoint.
 * ──────────────────────────────────────────────────
 */
export const APP_VERSION = '1.0.0';

const API_BASE = import.meta.env.VITE_API_URL || 'https://splitx.azurewebsites.net/api';
const CHECK_INTERVAL = 60 * 60 * 1000; // re-check every 1 hour

interface VersionInfo {
  latest: string;
  minSupported: string;
  forceUpdate: boolean;
  downloadUrl: string;
  websiteUrl: string;
  releaseNotes: string;
}

/** Simple semver comparison: returns 1 if a>b, -1 if a<b, 0 if equal */
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

export default function UpdateChecker() {
  const [versionData, setVersionData] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const hasUpdate = versionData && compareSemver(versionData.latest, APP_VERSION) > 0;
  const isForced =
    versionData &&
    (versionData.forceUpdate ||
      compareSemver(APP_VERSION, versionData.minSupported) < 0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/version`);
        if (!res.ok) return;
        const data: VersionInfo = await res.json();
        setVersionData(data);
      } catch {
        // silently fail — user stays on current version
      }
    };

    // Check on mount
    check();

    // Periodic re-check
    timer = setInterval(check, CHECK_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  // Nothing to show
  if (!hasUpdate || dismissed) return null;

  const handleUpdate = () => {
    const url = versionData!.websiteUrl || versionData!.downloadUrl;
    window.open(url, '_system');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={isForced ? undefined : () => setDismissed(true)}
        />

        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.85, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="relative w-full max-w-[340px] bg-[#161822] border border-white/[0.08] rounded-[28px] overflow-hidden shadow-2xl"
        >
          {/* Top accent gradient */}
          <div
            className="h-1.5 w-full"
            style={{
              background: isForced
                ? 'linear-gradient(90deg, #ef4444, #f97316)'
                : 'linear-gradient(90deg, #d4a843, #f5c542)',
            }}
          />

          {/* Close (only if not forced) */}
          {!isForced && (
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors z-10"
            >
              <X size={16} />
            </button>
          )}

          <div className="px-7 pt-7 pb-6 text-center">
            {/* Icon */}
            <motion.div
              className="mx-auto mb-5 w-20 h-20 rounded-[22px] flex items-center justify-center"
              style={{
                background: isForced
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))'
                  : 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(245,197,66,0.1))',
                border: isForced
                  ? '1px solid rgba(239,68,68,0.15)'
                  : '1px solid rgba(212,168,67,0.15)',
              }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {isForced ? (
                <AlertTriangle size={36} className="text-red-400" />
              ) : (
                <Rocket size={36} className="text-amber-400" />
              )}
            </motion.div>

            {/* Title */}
            <h2 className="text-[20px] font-extrabold text-white mb-1 font-display">
              {isForced ? 'Update Required' : 'New Update Available!'}
            </h2>

            {/* Version badge */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-[11px] font-bold text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">
                v{APP_VERSION}
              </span>
              <span className="text-[11px] text-white/20">→</span>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: isForced
                    ? 'rgba(239,68,68,0.12)'
                    : 'rgba(212,168,67,0.12)',
                  color: isForced ? '#f87171' : '#f5c542',
                }}
              >
                v{versionData!.latest}
              </span>
            </div>

            {/* Release notes */}
            {versionData!.releaseNotes && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-5 text-left">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">
                  What's new
                </p>
                <p className="text-[12px] text-white/60 leading-relaxed">
                  {versionData!.releaseNotes}
                </p>
              </div>
            )}

            {/* Description */}
            <p className="text-[12px] text-white/40 leading-relaxed mb-6">
              {isForced
                ? 'Your current version is no longer supported. Please update to continue using SplitX.'
                : 'A newer version of SplitX is available. Update now to get the latest features and improvements.'}
            </p>

            {/* Buttons */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleUpdate}
              className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2.5 text-black mb-3"
              style={{
                background: isForced
                  ? 'linear-gradient(135deg, #ef4444, #f97316)'
                  : 'linear-gradient(135deg, #f5c542, #d4a843)',
                boxShadow: isForced
                  ? '0 8px 30px rgba(239,68,68,0.3)'
                  : '0 8px 30px rgba(212,168,67,0.3)',
              }}
            >
              <Download size={18} />
              Update Now
            </motion.button>

            {!isForced && (
              <button
                onClick={() => setDismissed(true)}
                className="w-full py-3 text-[13px] font-semibold text-white/30 hover:text-white/50 transition-colors"
              >
                Remind me later
              </button>
            )}

            <p className="text-[10px] text-white/20 mt-2">
              Just install over the existing app — no data loss
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
