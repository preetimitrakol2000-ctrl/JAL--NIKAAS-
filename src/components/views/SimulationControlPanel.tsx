/**
 * Jal-Nikaas: Comprehensive Demonstration Scenarios Control Panel
 * Implements interactive triggering of all 7 core engineering demonstration scenarios:
 * 1. Heavy rainfall surge
 * 2. Downstream river surge & backflow
 * 3. Drainage blockage detection & localisation
 * 4. Critical waterlogging & beacon activation
 * 5. Blockage clearance & mitigation hold countdown
 * 6. Gateway / cellular network outage (offline store-and-forward)
 * 7. Sensor failure & safety fail-safe rule
 */

import React from 'react';
import { Language } from '../../types';
import {
  CloudRain,
  Radio,
  AlertTriangle,
  Flame,
  CheckCircle2,
  WifiOff,
  Cpu,
  RotateCcw,
  Play,
  Pause,
  Clock,
  Zap,
  Activity,
  Sliders,
  X,
} from 'lucide-react';

interface SimulationControlPanelProps {
  language: Language;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  onTriggerScenario: (scenarioNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  onResetSimulation: () => void;
  isOfflineMode: boolean;
  activeScenarioName?: string | null;
  onClose?: () => void;
}

export const SimulationControlPanel: React.FC<SimulationControlPanelProps> = ({
  language,
  isSimulating,
  onToggleSimulation,
  simulationSpeed,
  onSpeedChange,
  onTriggerScenario,
  onResetSimulation,
  isOfflineMode,
  activeScenarioName,
  onClose,
}) => {
  const scenarios = [
    {
      num: 1 as const,
      title: 'Scenario 1: Heavy Monsoon Rainfall Runoff',
      badge: 'Runoff Surge',
      color: 'border-sky-500/40 bg-sky-950/20 text-sky-300 hover:bg-sky-950/40',
      icon: CloudRain,
      desc: 'Simulates intense storm runoff (+22cm farm rise, rate of rise 8.5 cm/hr, discharge 880 L/s). Tests rapid rise rate detection & GIS flood shading.',
      affects: 'Affects: JN-007 (Basirhat) & JN-011 (Singur)',
    },
    {
      num: 2 as const,
      title: 'Scenario 2: Downstream Estuary River Surge (Backflow)',
      badge: 'Tidal Lock',
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40',
      icon: Radio,
      desc: 'Simulates high tidal swell where river outfall level exceeds farm culvert (Δh = -14.5cm, flow velocity reverses to -0.16 m/s). Triggers Backflow Risk.',
      affects: 'Affects: JN-001 (Diamond Harbour Sluice S-01)',
    },
    {
      num: 3 as const,
      title: 'Scenario 3: Silt & Water Hyacinth Drainage Blockage',
      badge: 'Blockage Localisation',
      color: 'border-orange-500/40 bg-orange-950/20 text-orange-300 hover:bg-orange-950/40',
      icon: AlertTriangle,
      desc: 'Demonstrates multi-node correlation: discharge throttles to 140 L/s while upstream differential expands to +25.5cm. Calculates 92% blockage confidence & identifies affected segment.',
      affects: 'Affects: JN-004 to JN-005 (Kakdwip Polder Segment B1)',
    },
    {
      num: 4 as const,
      title: 'Scenario 4: Critical Waterlogging & Beacon Escalation',
      badge: 'Emergency Escalation',
      color: 'border-red-500/40 bg-red-950/20 text-red-300 hover:bg-red-950/40',
      icon: Flame,
      desc: 'Crosses critical threshold (111.5cm). Activates physical red warning strobe beacon & buzzer, dispatches SMS/IVR to Panchayat & farmers, records timeline.',
      affects: 'Affects: JN-007 (Basirhat Vegetable Belt)',
    },
    {
      num: 5 as const,
      title: 'Scenario 5: Sluice Dredging Clearance & Mitigation Hold',
      badge: 'Mitigation & Hold',
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40',
      icon: CheckCircle2,
      desc: 'Simulates successful obstacle clearance: flow restored to 0.75 m/s, water recedes. Starts clearance hold timer countdown, shuts off beacon, sends mitigation SMS/IVR.',
      affects: 'Affects: Clears JN-004 & JN-001 active blockages',
    },
    {
      num: 6 as const,
      title: 'Scenario 6: Cellular Gateway Outage (Store-and-Forward)',
      badge: 'Offline-First Buffer',
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300 hover:bg-purple-950/40',
      icon: WifiOff,
      desc: 'Simulates cellular outage. Local warning beacons still activate autonomously; pending farmer alerts queue in SQLite buffer. Reconnecting transmits queued logs.',
      affects: 'Affects: Shared Raspberry Pi 3 B+ edge gateway',
    },
    {
      num: 7 as const,
      title: 'Scenario 7: Ultrasonic Transducer Sensor Fault',
      badge: 'Fail-Safe Fault',
      color: 'border-slate-500/40 bg-slate-800/40 text-slate-300 hover:bg-slate-800/60',
      icon: Cpu,
      desc: 'Simulates lost ultrasonic echo / disconnected probe (null reading). Strict safety rule ensures missing telemetry is NEVER interpreted as safe; triggers SENSOR_FAULT.',
      affects: 'Affects: JN-005 (Namkhana Collector Sensor)',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Interactive Demonstration Scenarios Control Panel</span>
              {activeScenarioName && (
                <span className="rounded-md bg-emerald-800/90 text-emerald-200 px-2 py-0.5 text-[10px] font-mono font-bold">
                  Active: {activeScenarioName}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Trigger real physical events to verify hydraulic diagnosis, blockage detection, warning beacons, and SMS/IVR dispatch.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={onToggleSimulation}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {isSimulating ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-400" />
                <span>Pause Telemetry</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-400" />
                <span>Resume Telemetry</span>
              </>
            )}
          </button>

          {/* Speed */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-400">
            <span>Speed:</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${
                  simulationSpeed === s
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reset Baseline */}
          <button
            onClick={onResetSimulation}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Reset all 12 nodes, beacons, alerts, and work orders to nominal baseline"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-xs">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          return (
            <div
              key={sc.num}
              className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all hover:scale-[1.01] ${sc.color}`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>Scenario {sc.num}</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold bg-black/40 px-1.5 py-0.5 rounded">
                    {sc.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {sc.desc}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {sc.affects}
                </span>
                <button
                  onClick={() => onTriggerScenario(sc.num)}
                  className="rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[11px] font-bold text-white transition-colors shrink-0"
                >
                  Trigger Event →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
