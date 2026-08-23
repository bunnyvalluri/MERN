import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Wifi, WifiOff, X } from 'lucide-react';
import { setOnline, setOffline, selectIsOnline } from '../../store/networkSlice.js';

/**
 * NetworkStatusBanner — Sticky offline/online notification banner.
 *
 * Listens to the browser's native online/offline events and displays a
 * non-intrusive banner when the user loses connectivity. Auto-dismisses
 * when connection is restored and shows a brief "Back online" confirmation.
 *
 * State is kept in Redux (networkSlice) so Axios interceptors can also
 * update it when API calls fail due to network errors.
 *
 * Position: fixed top banner, above all other content.
 * Does not block page interaction.
 */
export function NetworkStatusBanner() {
  const dispatch = useDispatch();
  const isOnline = useSelector(selectIsOnline);

  // ── Listen to native browser online/offline events ────────────────────────
  useEffect(() => {
    const handleOnline = () => dispatch(setOnline());
    const handleOffline = () => dispatch(setOffline());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  // Don't render anything when online — keep DOM clean
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Network status: offline"
      className="
        fixed top-0 inset-x-0 z-[9999]
        flex items-center justify-center gap-3
        bg-amber-500/95 backdrop-blur-sm
        text-slate-950 text-sm font-semibold
        py-2.5 px-4
        shadow-lg
        animate-in slide-in-from-top duration-300
      "
    >
      <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>
        You're offline — check your internet connection.
        Some features may be unavailable.
      </span>
    </div>
  );
}

export default NetworkStatusBanner;
