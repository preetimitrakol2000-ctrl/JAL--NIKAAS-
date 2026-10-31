/**
 * Jal-Nikaas: System Status Banner
 * Communicates demo data status, offline-first sync state, and active emergency advisories
 */

import React from 'react';
import { AlertItem, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import { AlertCircle, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SystemBannerProps {
  language: Language;
  activeCriticalAlerts: AlertItem[];
  isOfflineMode: boolean;
  pendingSyncCount: number;
  onSelectAlertLocation: (locId: string) => void;
  onSyncNow?: () => void;
}

export const SystemBanner: React.FC<SystemBannerProps> = ({
  language,
  activeCriticalAlerts,
  isOfflineMode,
  pendingSyncCount,
  onSelectAlertLocation,
  onSyncNow,
}) => {
  const topCritical = activeCriticalAlerts.find((a) => !a.acknowledged);

  if (!isOfflineMode && !topCritical) {
    return null;
  }

  return (
    <div className="space-y-1.5 my-3">
      {/* Offline Mode Warning or Pending Queue Banner */}
      {isOfflineMode && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Simulated Cellular Outage Active:</strong> Raspberry Pi edge gateway continues local telemetry processing and anomaly detection.
              {pendingSyncCount > 0 ? ` ${pendingSyncCount} new events queued locally in SQLite.` : ' All local logs active.'}
            </span>
          </div>
          {onSyncNow && (
            <button
              onClick={onSyncNow}
              className="flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-2"
            >
              <RefreshCw className="h-3 w-3" />
              Reconnect Gateway
            </button>
          )}
        </div>
      )}

      {/* Active Critical Advisory Banner */}
      {topCritical && (
        <div className="rounded-xl border border-red-300 bg-red-50/90 px-4 py-2.5 text-xs text-red-950 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <div>
              <span className="font-bold text-red-900 mr-2">
                CRITICAL DRAINAGE ALERT [{topCritical.id}]:
              </span>
              <span>
                {topCritical.locationName} — {topCritical.recommendedAction}
              </span>
            </div>
          </div>
          <button
            onClick={() => onSelectAlertLocation(topCritical.locationId)}
            className="rounded bg-red-600 hover:bg-red-700 px-3 py-1 font-bold text-white text-[11px] transition-colors"
          >
            Inspect Location
          </button>
        </div>
      )}
    </div>
  );
};
