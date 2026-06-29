import { useState } from 'react';
import { DownloadCloud, X } from 'lucide-react';

import { usePWAInstall } from '../../hooks/usePWAInstall';

/**
 * Mobile bottom banner for PWA install.
 * Shown only on small screens when install is available.
 */
export function PWAInstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="lg:hidden fixed bottom-[3.75rem] left-0 right-0 z-30 px-4 pb-2 animate-slide-down">
      <div className="bg-brand text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <DownloadCloud size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Install Fund Manager</p>
          <p className="text-xs text-primary/70 truncate">Add to home screen for the best experience</p>
        </div>
        <button
          onClick={() => { install(); setDismissed(true); }}
          className="bg-primary text-brand text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 hover:bg-primary-hover transition-colors"
        >
          Install
        </button>
        <button onClick={() => setDismissed(true)} className="text-white/50 hover:text-white flex-shrink-0 -ml-1">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
