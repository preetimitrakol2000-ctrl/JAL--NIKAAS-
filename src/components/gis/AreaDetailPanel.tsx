/**
 * Jal-Nikaas: Area & Monitoring Node Inspection Panel
 * Opened when an officer clicks an area or node on the GIS map.
 * Contains:
 * - Live Hydraulic Telemetry (Water levels, Raw distance, Differential head, Flow velocity, Discharge)
 * - Hydraulic State (RECEDING, STEADY, RISING, OVERFLOWING, BACKFLOWING)
 * - Drainage Blockage Diagnosis & Localisation (Confidence score, Affected segment, Supporting evidence)
 * - Local Warning Beacon & Buzzer Status with Manual Toggle Override
 * - Gram Panchayat Contact & Response Details
 * - Multi-lingual Voice Recommendations (Bengali, Hindi, English)
 * - Historical Incidents & Event Timeline
 */

import React, { useState } from 'react';
import {
  AgriculturalArea,
  LocationData,
  HistoricalIncident,
  HistoricalEvent,
  AreaRecommendation,
  Language,
} from '../../types';
import { VoicePlayer } from '../common/VoicePlayer';
import {
  MapPin,
  Droplets,
  AlertTriangle,
  History,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Compass,
  FileText,
  Activity,
  Layers,
  Radio,
  Volume2,
  Phone,
  Waves,
  Cpu,
  Flame,
  Wind,
} from 'lucide-react';

interface AreaDetailPanelProps {
  area: AgriculturalArea;
  location: LocationData;
  incidents: HistoricalIncident[];
  events: HistoricalEvent[];
  recommendation?: AreaRecommendation;
  language: Language;
  onClose: () => void;
  onNavigateToMonitoring?: (locationId: string) => void;
  onNavigateToAlerts?: (locationId: string) => void;
  onToggleBeacon?: (locationId: string) => void;
}

export const AreaDetailPanel: React.FC<AreaDetailPanelProps> = ({
  area,
  location,
  incidents,
  events,
  recommendation,
  language,
  onClose,
  onNavigateToMonitoring,
  onNavigateToAlerts,
  onToggleBeacon,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'current' | 'blockage' | 'panchayat' | 'history' | 'timeline' | 'recommendations'>('current');

  const areaIncidents = incidents.filter((inc) => inc.areaId === area.id || inc.nodeCode === location.nodeCode);
  const areaEvents = events.filter((ev) => ev.areaId === area.id || ev.nodeCode === location.nodeCode);

  const isBackflow = location.differentialLevelCm <= 0;
  const isCritical = location.riskLevel === 'CRITICAL' || location.riskLevel === 'DANGER';

  const getLocalizedAreaName = () => {
    if (language === 'bn') return area.localNameBengali || area.name;
    if (language === 'hi') return area.localNameHindi || area.name;
    return area.name;
  };

  const getVoiceRecommendationText = () => {
    if (!recommendation) return location.riskReason;
    const actionBn = recommendation.panchayatActionBengali || recommendation.municipalActionBengali || '';
    const actionHi = recommendation.panchayatActionHindi || recommendation.municipalActionHindi || '';
    const actionEn = recommendation.panchayatAction || recommendation.municipalAction || '';
    if (language === 'bn') return `${recommendation.farmerAdvisoryBengali} পঞ্চায়েত নির্দেশিকা: ${actionBn}`;
    if (language === 'hi') return `${recommendation.farmerAdvisoryHindi} पंचायत कार्रवाई: ${actionHi}`;
    return `${recommendation.farmerAdvisory} Panchayat Action: ${actionEn}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl overflow-hidden w-full lg:w-[480px] animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-950 p-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              {location.nodeCode}
            </span>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                location.riskLevel === 'NORMAL'
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                  : location.riskLevel === 'ELEVATED'
                  ? 'bg-sky-900/60 text-sky-300 border border-sky-700'
                  : location.riskLevel === 'WARNING'
                  ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                  : 'bg-red-900/60 text-red-300 border border-red-700'
              }`}
            >
              {location.riskLevel.replace('_', ' ')}
            </span>
            {location.beaconState.isActive && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded animate-pulse">
                <Radio className="h-3 w-3" /> BEACON ACTIVE
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white mt-1.5">{location.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {location.localityName} • {location.block} Block, {location.district}
          </p>
        </div>

        <button
          onClick={onClose}
          title="Return to full network view"
          className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs overflow-x-auto scrollbar-none gap-1">
        {[
          { id: 'current', label: 'Hydraulics & Flow', icon: Activity },
          { id: 'blockage', label: 'Blockage Diagnosis', icon: AlertTriangle },
          { id: 'panchayat', label: 'Panchayat & Plots', icon: Phone },
          { id: 'history', label: `History (${areaIncidents.length})`, icon: History },
          { id: 'timeline', label: `Timeline (${areaEvents.length})`, icon: Clock },
          { id: 'recommendations', label: 'Advisories', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* 1. CURRENT HYDRAULICS TAB */}
        {activeSubTab === 'current' && (
          <div className="space-y-4">
            {/* Operational Hydraulic Condition Banner */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/90 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Hydraulic State
                </span>
                <span
                  className={`font-mono text-xs font-black uppercase px-2 py-0.5 rounded ${
                    location.hydraulicState === 'RECEDING'
                      ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600'
                      : location.hydraulicState === 'STEADY'
                      ? 'bg-slate-700 text-slate-200'
                      : location.hydraulicState === 'RISING'
                      ? 'bg-amber-900/80 text-amber-300 border border-amber-600'
                      : location.hydraulicState === 'BACKFLOWING'
                      ? 'bg-orange-900/80 text-orange-300 border border-orange-600'
                      : 'bg-red-900/80 text-red-300 border border-red-600'
                  }`}
                >
                  {location.hydraulicState}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {location.hydraulicReason}
              </p>
            </div>

            {/* Water Head Gauges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">
                  Farm Sump Level
                </span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {location.farmSideSensor.levelCm !== null ? `${location.farmSideSensor.levelCm} cm` : 'FAULT'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Raw Dist: {location.rawSensorDistanceCm} cm
                </span>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">
                  Canal Outfall
                </span>
                <span className="text-lg font-bold font-mono text-sky-400">
                  {location.downstreamSensor.levelCm !== null ? `${location.downstreamSensor.levelCm} cm` : 'FAULT'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Freeboard: {location.freeboardCm} cm
                </span>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">
                  Head (Δh)
                </span>
                <span
                  className={`text-lg font-bold font-mono ${
                    isBackflow ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {location.differentialLevelCm > 0
                    ? `+${location.differentialLevelCm}`
                    : location.differentialLevelCm}{' '}
                  cm
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Cap: {location.channelCapacityPct}%
                </span>
              </div>
            </div>

            {/* Flow Velocity & Discharge (Non-Contact Radar Measurement) */}
            <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Waves className="h-4 w-4 text-sky-400" />
                  <span>Open-Channel Flow Telemetry</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  {location.flowSensor.sensorTechnology}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Flow Velocity</span>
                  <span className="text-base font-bold text-white">
                    {location.flowSensor.velocityMs} m/s
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Direction: {location.flowSensor.direction}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Volumetric Discharge</span>
                  <span className="text-base font-bold text-sky-300">
                    {location.flowSensor.dischargeLs} L/s
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ({location.flowSensor.dischargeM3s} m³/s)
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-slate-400">Measurement Type:</span>
                <span className="font-bold text-emerald-400">Direct 24GHz Radar (Non-Contact)</span>
              </div>
            </div>

            {/* Hardware Status: Beacon, Float switch, GSM */}
            <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Local Strobe Beacon:</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                      location.beaconState.isActive ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {location.beaconState.isActive ? 'FLASHING RED / BUZZER ON' : 'STANDBY OFF'}
                  </span>
                  {onToggleBeacon && (
                    <button
                      onClick={() => onToggleBeacon(location.id)}
                      className="rounded bg-slate-700 hover:bg-slate-600 px-2 py-0.5 text-[10px] text-slate-200"
                    >
                      Toggle
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-700/60 pt-2">
                <span className="text-slate-300">High-Water Float Switch:</span>
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                    location.floatSwitch.status === 'TRIPPED' ? 'bg-red-600 text-white' : 'bg-slate-700 text-emerald-400'
                  }`}
                >
                  {location.floatSwitch.status}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-700/60 pt-2">
                <span className="text-slate-300">Cellular Link (Quectel 4G):</span>
                <span className="font-mono text-[10px] text-emerald-400">
                  {location.gsmState.status} ({location.gsmState.signalDbm} dBm • {location.gsmState.signalBars}/5 bars)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. BLOCKAGE DIAGNOSIS TAB */}
        {activeSubTab === 'blockage' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Drainage Blockage Diagnosis</span>
                </span>
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded ${
                    location.blockageDiagnosis.severity === 'CRITICAL_FAILURE'
                      ? 'bg-red-600 text-white'
                      : location.blockageDiagnosis.severity === 'SEVERE_BLOCKAGE'
                      ? 'bg-orange-600 text-white'
                      : location.blockageDiagnosis.severity === 'MODERATE_BLOCKAGE'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-800 text-emerald-200'
                  }`}
                >
                  {location.blockageDiagnosis.severity.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                <span className="text-slate-300">Blockage Probability Confidence:</span>
                <span className="font-mono text-lg font-bold text-amber-400">
                  {location.blockageDiagnosis.confidenceScore}%
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">
                  Most Likely Affected Drainage Segment
                </div>
                <div className="font-bold text-white bg-slate-900/60 p-2.5 rounded-lg border border-slate-700">
                  {location.blockageDiagnosis.affectedSegment}
                </div>
                <div className="text-[10px] text-slate-400">
                  Interval: {location.blockageDiagnosis.segmentInterval}
                  {location.blockageDiagnosis.estimatedDistanceMeters && (
                    <span className="text-amber-400 font-mono font-bold ml-1">
                      (~{location.blockageDiagnosis.estimatedDistanceMeters}m from node)
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">
                  Supporting Sensor Evidence
                </div>
                <ul className="space-y-1 text-slate-300">
                  {location.blockageDiagnosis.supportingEvidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-1.5 bg-slate-900/40 p-2 rounded border border-slate-800">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 pt-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">
                  Recommended Maintenance Action
                </div>
                <div className="rounded-lg bg-emerald-950/40 border border-emerald-700/60 p-3 text-emerald-200 font-medium leading-relaxed">
                  {location.blockageDiagnosis.recommendedAction}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. PANCHAYAT & ASSOCIATED PLOTS TAB */}
        {activeSubTab === 'panchayat' && (
          <div className="space-y-4">
            {/* Panchayat Contact Card */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>Responsible Gram Panchayat</span>
              </div>
              <div className="rounded-lg bg-slate-900/80 p-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Panchayat:</span>
                  <span className="font-bold text-white">{location.panchayat.gramPanchayatName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pradhan:</span>
                  <span className="font-semibold text-slate-200">{location.panchayat.pradhanName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Phone:</span>
                  <span className="font-mono text-emerald-400 font-bold">{location.panchayat.contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Desk:</span>
                  <span className="font-mono text-slate-300">{location.panchayat.emergencyDesk}</span>
                </div>
              </div>
            </div>

            {/* Associated Agricultural Plots */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 space-y-2.5">
              <div className="font-bold text-white text-sm">
                Associated Agricultural Plots ({location.associatedPlotIds.length})
              </div>
              <div className="space-y-2">
                {location.associatedPlotIds.map((pid) => (
                  <div key={pid} className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{pid}</div>
                      <div className="text-[10px] text-slate-400">Linked to Node {location.nodeCode}</div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Active Telemetry
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. HISTORICAL INCIDENTS TAB */}
        {activeSubTab === 'history' && (
          <div className="space-y-3">
            {areaIncidents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No major historical flood incidents logged for this drainage node.
              </div>
            ) : (
              areaIncidents.map((inc) => (
                <div key={inc.id} className="rounded-xl border border-slate-700 bg-slate-800/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-red-400">{inc.id}</span>
                    <span className="font-mono text-[10px] text-slate-400">Duration: {inc.durationHours}h</span>
                  </div>
                  <div className="font-bold text-white text-xs">{inc.incidentType}</div>
                  <p className="text-slate-300 text-[11px]">{inc.description}</p>
                  <div className="rounded bg-slate-900/60 p-2 text-[10px] text-slate-400 space-y-0.5">
                    <div><strong>Cause:</strong> {inc.cause}</div>
                    <div><strong>Intervention:</strong> {inc.intervention}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 5. EVENT TIMELINE TAB */}
        {activeSubTab === 'timeline' && (
          <div className="space-y-3">
            {areaEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No events recorded in the last 72 hours.
              </div>
            ) : (
              areaEvents.map((ev) => (
                <div key={ev.id} className="rounded-xl border border-slate-700 bg-slate-800/80 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold text-emerald-400">{ev.eventType}</span>
                    <span className="text-slate-400">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="font-bold text-white">{ev.title}</div>
                  <div className="text-[11px] text-slate-300">{ev.details}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 6. ADVISORIES & MULTILINGUAL VOICE TAB */}
        {activeSubTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Actionable Agricultural Advisory</span>
                </span>
                <span className="font-mono text-[10px] uppercase font-bold text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded">
                  {recommendation?.urgency || 'NORMAL'}
                </span>
              </div>

              <div className="space-y-2 text-slate-200 leading-relaxed text-xs">
                <div>
                  <strong className="text-emerald-300 block mb-1">Farmer Field Advisory:</strong>
                  <p>
                    {language === 'bn'
                      ? recommendation?.farmerAdvisoryBengali || recommendation?.farmerAdvisory
                      : language === 'hi'
                      ? recommendation?.farmerAdvisoryHindi || recommendation?.farmerAdvisory
                      : recommendation?.farmerAdvisory}
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-800/50">
                  <strong className="text-sky-300 block mb-1">Gram Panchayat Drainage Action:</strong>
                  <p>
                    {language === 'bn'
                      ? recommendation?.panchayatActionBengali || recommendation?.municipalActionBengali || recommendation?.panchayatAction || recommendation?.municipalAction
                      : language === 'hi'
                      ? recommendation?.panchayatActionHindi || recommendation?.municipalActionHindi || recommendation?.panchayatAction || recommendation?.municipalAction
                      : recommendation?.panchayatAction || recommendation?.municipalAction}
                  </p>
                </div>
              </div>

              {/* Web Speech API Voice Player */}
              <div className="pt-2 border-t border-emerald-800/60">
                <VoicePlayer
                  text={getVoiceRecommendationText()}
                  language={language}
                  label="Listen to Voice Advisory (Browser TTS)"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="border-t border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            if (onNavigateToMonitoring) onNavigateToMonitoring(location.id);
          }}
          className="flex-1 rounded-lg bg-slate-800 hover:bg-slate-700 py-2 text-center text-xs font-semibold text-white transition-colors"
        >
          Inspect Live Telemetry →
        </button>
        <button
          onClick={() => {
            if (onNavigateToAlerts) onNavigateToAlerts(location.id);
          }}
          className="flex-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 py-2 text-center text-xs font-semibold text-white transition-colors"
        >
          View Alert Centre →
        </button>
      </div>
    </div>
  );
};
