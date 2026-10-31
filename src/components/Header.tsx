/**
 * Jal-Nikaas: Application Header & Simulator Toolbar
 */

import React from 'react';
import { Language, UserRole } from '../types';
import { getTranslation } from '../utils/i18n';
import {
  Waves,
  Play,
  Pause,
  CloudRain,
  Radio,
  Wifi,
  WifiOff,
  Sliders,
  Globe,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentRole?: UserRole;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  onTriggerStorm: () => void;
  onTriggerBackflow: () => void;
  onResetSimulation: () => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  pendingSyncCount: number;
  onOpenThresholdModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  currentRole = 'farmer',
  isSimulating,
  onToggleSimulation,
  simulationSpeed,
  onSpeedChange,
  onTriggerStorm,
  onTriggerBackflow,
  onResetSimulation,
  isOfflineMode,
  onToggleOfflineMode,
  pendingSyncCount,
  onOpenThresholdModal,
}) => {
  return (
    <header className="border-b border-emerald-950/20 bg-slate-900 text-slate-100 shadow-md">
      {/* Top Identity Row */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg ring-1 ring-emerald-400/30">
            <Waves className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                JAL-NIKAAS
              </h1>
              <span className="hidden xs:inline-block rounded-md bg-emerald-800/80 px-2 py-0.5 text-[10px] font-bold text-emerald-200 border border-emerald-600/50">
                AGRO-DRAIN
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                  currentRole === 'farmer'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}
              >
                {currentRole === 'farmer' ? '🌾 Farmer View' : '🏛️ Panchayat Officer'}
              </span>
            </div>
            <p className="text-xs text-emerald-300 font-medium tracking-wide">
              {getTranslation(language, 'app_subtitle')} — {getTranslation(language, 'geography_tag')}
            </p>
          </div>
        </div>

        {/* Right Action Tools: Language, Offline Mode, Threshold Settings */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Offline-First Gateway Mode Toggle */}
          <button
            onClick={onToggleOfflineMode}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              isOfflineMode
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/50 hover:bg-amber-600/30'
                : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/60'
            }`}
            title="Toggle simulated cellular outage to demonstrate edge gateway offline-first caching"
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span>Offline Mode</span>
                {pendingSyncCount > 0 && (
                  <span className="rounded-full bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[10px] font-bold">
                    {pendingSyncCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span>Gateway Synced</span>
              </>
            )}
          </button>

          {/* Configurable Risk Rules Button */}
          <button
            onClick={onOpenThresholdModal}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Risk Rules</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 p-0.5 text-xs">
            <Globe className="h-3.5 w-3.5 ml-1.5 mr-1 text-slate-400 hidden sm:block" />
            {(['en', 'bn', 'hi'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                  language === lang
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'bn' ? 'বাংলা' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Bar: Live Simulation Controller & Quick Scenarios */}
      <div className="border-t border-slate-800 bg-slate-950/70 px-4 py-2 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Status Indicator & Play/Pause */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isSimulating
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                }`}
              ></span>
              <span className="font-mono text-[11px] text-slate-300">
                {isSimulating ? 'TELEMETRY ENGINE: ACTIVE' : 'TELEMETRY ENGINE: PAUSED'}
              </span>
            </div>

            <button
              onClick={onToggleSimulation}
              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {isSimulating ? (
                <>
                  <Pause className="h-3 w-3 text-amber-400" />
                  <span>{getTranslation(language, 'pause')}</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-emerald-400" />
                  <span>{getTranslation(language, 'resume')}</span>
                </>
              )}
            </button>

            {/* Speed Selector */}
            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
              <span>Speed:</span>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onSpeedChange(spd)}
                  className={`rounded px-1.5 py-0.5 font-mono ${
                    simulationSpeed === spd
                      ? 'bg-emerald-800 text-emerald-200 font-bold'
                      : 'hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Quick Hydraulic Scenario Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden lg:inline">Test Scenarios:</span>
            <button
              onClick={onTriggerStorm}
              className="flex items-center gap-1 rounded bg-sky-950/80 border border-sky-800/80 px-2 py-1 text-[11px] font-medium text-sky-200 hover:bg-sky-900 transition-colors"
              title="Simulates rapid storm runoff surge to test Rate-of-Rise and Submergence alerts"
            >
              <CloudRain className="h-3 w-3 text-sky-400" />
              <span>Simulate Storm Surge</span>
            </button>

            <button
              onClick={onTriggerBackflow}
              className="flex items-center gap-1 rounded bg-amber-950/80 border border-amber-800/80 px-2 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-900 transition-colors"
              title="Simulates canal water level rising higher than farm culvert (Δh < 0) to trigger Backflow Risk"
            >
              <Radio className="h-3 w-3 text-amber-400" />
              <span>Simulate Backflow Lock</span>
            </button>

            <button
              onClick={onResetSimulation}
              className="flex items-center gap-1 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              title="Reset all sensors to steady normal baseline"
            >
              <RotateCcw className="h-3 w-3 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
