/**
 * Jal-Nikaas: Configurable Risk Thresholds Modal
 * Allows agricultural engineers and Panchayat officers to configure deterministic hydraulic rules
 */

import React, { useState, useEffect } from 'react';
import { RiskThresholdConfig, Language } from '../types';
import {
  Sliders,
  X,
  Check,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Droplets,
  Waves,
  Zap,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { DEFAULT_THRESHOLDS } from '../utils/riskEngine';

interface ThresholdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: RiskThresholdConfig;
  onSave: (newThresholds: RiskThresholdConfig) => void;
  language: Language;
}

export const ThresholdSettingsModal: React.FC<ThresholdSettingsModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSave,
}) => {
  const [draft, setDraft] = useState<RiskThresholdConfig>({ ...thresholds });
  const [hasSaved, setHasSaved] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('custom');

  // Synchronize draft whenever modal opens or thresholds update
  useEffect(() => {
    if (isOpen) {
      setDraft({ ...thresholds });
      setHasSaved(false);
    }
  }, [isOpen, thresholds]);

  if (!isOpen) return null;

  const handleReset = () => {
    setDraft({ ...DEFAULT_THRESHOLDS });
    setActivePreset('default');
  };

  const handleApplyPreset = (presetName: string) => {
    setActivePreset(presetName);
    if (presetName === 'default') {
      setDraft({ ...DEFAULT_THRESHOLDS });
    } else if (presetName === 'vegetables') {
      // Pointed Gourd, Chilli, Brinjal - root rot sensitive
      setDraft({
        submergenceCriticalCm: 55,
        submergenceWarningCm: 35,
        backflowDifferentialThresholdCm: 0,
        rateOfRiseCriticalCmHr: 6.0,
        rateOfRiseWarningCmHr: 3.0,
        flowVelocityMinThresholdMs: 0.18,
        blockageDifferentialThresholdCm: 14.0,
        beaconClearanceHoldSec: 30,
        staleDataTimeoutMinutes: 20,
      });
    } else if (presetName === 'paddy') {
      // Aman & Boro Paddy - deep standing water tolerant
      setDraft({
        submergenceCriticalCm: 90,
        submergenceWarningCm: 65,
        backflowDifferentialThresholdCm: -2,
        rateOfRiseCriticalCmHr: 10.0,
        rateOfRiseWarningCmHr: 5.0,
        flowVelocityMinThresholdMs: 0.12,
        blockageDifferentialThresholdCm: 22.0,
        beaconClearanceHoldSec: 20,
        staleDataTimeoutMinutes: 45,
      });
    } else if (presetName === 'cyclone') {
      // Cyclone / High Spring Tide / Cloudburst protocol
      setDraft({
        submergenceCriticalCm: 65,
        submergenceWarningCm: 45,
        backflowDifferentialThresholdCm: 2,
        rateOfRiseCriticalCmHr: 5.0,
        rateOfRiseWarningCmHr: 2.5,
        flowVelocityMinThresholdMs: 0.20,
        blockageDifferentialThresholdCm: 12.0,
        beaconClearanceHoldSec: 45,
        staleDataTimeoutMinutes: 15,
      });
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    setHasSaved(true);
    setTimeout(() => {
      setHasSaved(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-md">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Configurable Risk Engine Rules</span>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-mono font-normal">
                  Panchayat Protocol
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Calibrate early-warning thresholds across all 12 monitored drainage nodes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Sparkles className="h-3 w-3 text-emerald-600" />
            Presets:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset('default')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors ${
              activePreset === 'default'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Monsoon Standard (Default)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('vegetables')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors ${
              activePreset === 'vegetables'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Sensitive Vegetables (Potol / Chilli)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('paddy')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors ${
              activePreset === 'paddy'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Deep-Water Paddy Basin
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('cyclone')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors ${
              activePreset === 'cyclone'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Cyclone / Spring Tide Surge
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleApply} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Inundation & Freeboard Rules */}
          <div className="rounded-xl border border-red-100 bg-red-50/20 p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-red-200/60 pb-2">
              <Droplets className="h-4 w-4 text-red-600" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-red-900">
                1. Waterlogging &amp; Submergence Thresholds
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rule 1: Critical Submergence Level */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Critical Submergence (CRITICAL)
                  </label>
                  <span className="font-mono text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                    {draft.submergenceCriticalCm} cm
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Farm level breaching this depth triggers critical alarms and physical warning beacons.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="35"
                    max="120"
                    step="5"
                    value={draft.submergenceCriticalCm}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setDraft({ ...draft, submergenceCriticalCm: Number(e.target.value) });
                    }}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="35"
                    max="150"
                    value={draft.submergenceCriticalCm}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setDraft({ ...draft, submergenceCriticalCm: Number(e.target.value) });
                    }}
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-center font-mono text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Rule 2: Warning Submergence Level */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Caution Advisory (WARNING)
                  </label>
                  <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {draft.submergenceWarningCm} cm
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Early warning for nursery beds, vegetable furrows, and localized ditch pooling.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    value={draft.submergenceWarningCm}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setDraft({ ...draft, submergenceWarningCm: Number(e.target.value) });
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="15"
                    max="90"
                    value={draft.submergenceWarningCm}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setDraft({ ...draft, submergenceWarningCm: Number(e.target.value) });
                    }}
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-center font-mono text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Hydraulic Differential & Blockage Rules */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/20 p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-sky-200/60 pb-2">
              <Waves className="h-4 w-4 text-sky-700" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-sky-900">
                2. Canal Gradient &amp; Blockage Rules
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rule 3: Backflow Differential Threshold */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Backflow Head (Δh)
                  </label>
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {draft.backflowDifferentialThresholdCm} cm
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Δh = Farm - Canal. When Δh falls at or below this value, tidal backflow triggers DANGER.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-15"
                    max="10"
                    step="1"
                    value={draft.backflowDifferentialThresholdCm}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setDraft({ ...draft, backflowDifferentialThresholdCm: Number(e.target.value) });
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="-25"
                    max="15"
                    value={draft.backflowDifferentialThresholdCm}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setDraft({ ...draft, backflowDifferentialThresholdCm: Number(e.target.value) });
                    }}
                    className="w-14 rounded border border-slate-300 px-1 py-1 text-center font-mono text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Rule 4: Blockage Differential Head Threshold */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Obstruction Head
                  </label>
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {draft.blockageDifferentialThresholdCm} cm
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Elevated head difference across a culvert indicative of silt or weed choke.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="35"
                    step="1"
                    value={draft.blockageDifferentialThresholdCm}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setDraft({ ...draft, blockageDifferentialThresholdCm: Number(e.target.value) });
                    }}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="8"
                    max="45"
                    value={draft.blockageDifferentialThresholdCm}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setDraft({ ...draft, blockageDifferentialThresholdCm: Number(e.target.value) });
                    }}
                    className="w-14 rounded border border-slate-300 px-1 py-1 text-center font-mono text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Rule 5: Flow Velocity Minimum Threshold */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Min Outflow Velocity
                  </label>
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                    {draft.flowVelocityMinThresholdMs} m/s
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Velocity falling below this with high head confirms a downstream blockage.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.05"
                    max="0.40"
                    step="0.01"
                    value={draft.flowVelocityMinThresholdMs}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setDraft({ ...draft, flowVelocityMinThresholdMs: Number(e.target.value) });
                    }}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0.02"
                    max="0.80"
                    value={draft.flowVelocityMinThresholdMs}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setDraft({ ...draft, flowVelocityMinThresholdMs: Number(e.target.value) });
                    }}
                    className="w-14 rounded border border-slate-300 px-1 py-1 text-center font-mono text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Surge & Telemetry Fail-Safe Rules */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Zap className="h-4 w-4 text-emerald-700" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                3. Runoff Rate-of-Rise &amp; Edge Timers
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Rule 6: Critical Rate of Rise */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Flash Surge (Critical)
                  </label>
                  <span className="font-mono text-xs font-bold text-red-600 bg-white border border-red-200 px-1.5 py-0.5 rounded">
                    {draft.rateOfRiseCriticalCmHr} cm/h
                  </span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="15.0"
                  step="0.5"
                  value={draft.rateOfRiseCriticalCmHr}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setDraft({ ...draft, rateOfRiseCriticalCmHr: Number(e.target.value) });
                  }}
                  className="w-full accent-red-600 cursor-pointer mt-1"
                />
              </div>

              {/* Rule 7: Warning Rate of Rise */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Inflow Surge (Warning)
                  </label>
                  <span className="font-mono text-xs font-bold text-amber-600 bg-white border border-amber-200 px-1.5 py-0.5 rounded">
                    {draft.rateOfRiseWarningCmHr} cm/h
                  </span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="8.0"
                  step="0.5"
                  value={draft.rateOfRiseWarningCmHr}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setDraft({ ...draft, rateOfRiseWarningCmHr: Number(e.target.value) });
                  }}
                  className="w-full accent-amber-500 cursor-pointer mt-1"
                />
              </div>

              {/* Rule 8: Beacon Clearance Hold Time */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Mitigation Hold
                  </label>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-1.5 py-0.5 rounded">
                    {draft.beaconClearanceHoldSec} sec
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={draft.beaconClearanceHoldSec}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setDraft({ ...draft, beaconClearanceHoldSec: Number(e.target.value) });
                  }}
                  className="w-full accent-emerald-600 cursor-pointer mt-1"
                />
              </div>

              {/* Rule 9: Stale Data Timeout */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Stale Telemetry
                  </label>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-300 px-1.5 py-0.5 rounded">
                    {draft.staleDataTimeoutMinutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={draft.staleDataTimeoutMinutes}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setDraft({ ...draft, staleDataTimeoutMinutes: Number(e.target.value) });
                  }}
                  className="w-full accent-slate-600 cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>

          {/* Panchayat Calibration Notice */}
          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3.5 flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Gram Panchayat Hydraulic Governance Notice:</strong> Modifications made here re-evaluate
              all 12 live monitoring nodes in real-time. Nodes exceeding your specified submergence, differential, or
              blockage thresholds will trigger emergency warning alerts and update the GIS early-warning status immediately.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to Monsoon Baseline
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors"
              >
                {hasSaved ? (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Updated &amp; Re-evaluated!
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Apply Rules to All Sites
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
