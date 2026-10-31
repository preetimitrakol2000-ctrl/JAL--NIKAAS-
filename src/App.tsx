/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LocationData,
  AlertItem,
  WorkOrder,
  CommunicationLogItem,
  FarmerRecord,
  AgriculturalPlot,
  RiskThresholdConfig,
  Language,
  UserRole,
  FarmerTab,
  OfficerTab,
  AgriculturalArea,
  HistoricalIncident,
  HistoricalEvent,
  AreaRecommendation,
  CropInfo,
} from './types';
import {
  INITIAL_LOCATIONS,
  INITIAL_ALERTS,
  INITIAL_WORK_ORDERS,
  INITIAL_COMM_LOGS,
  AGRICULTURAL_AREAS,
  AGRICULTURAL_PLOTS,
  REGISTERED_FARMERS,
  HISTORICAL_INCIDENTS,
  HISTORICAL_EVENTS,
  AREA_RECOMMENDATIONS,
  CROPS_CATALOG,
} from './data/seedData';
import {
  DEFAULT_THRESHOLDS,
  evaluateLocationRisk,
  classifyHydraulicState,
  diagnoseBlockage,
  computeDifferential,
} from './utils/riskEngine';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { FarmerNavigation } from './components/farmer/FarmerNavigation';
import { SystemBanner } from './components/SystemBanner';
import { ThresholdSettingsModal } from './components/ThresholdSettingsModal';

// Farmer Views
import { FarmerHomeView } from './components/farmer/FarmerHomeView';
import { FarmerFieldStatusView } from './components/farmer/FarmerFieldStatusView';
import { FarmerAlertsView } from './components/farmer/FarmerAlertsView';
import { FarmerRecommendationsView } from './components/farmer/FarmerRecommendationsView';
import { FarmerLocalMapView } from './components/farmer/FarmerLocalMapView';
import { FarmerSettingsView } from './components/farmer/FarmerSettingsView';

// Panchayat Officer Views
import { OverviewView } from './components/views/OverviewView';
import { LiveMonitoringView } from './components/views/LiveMonitoringView';
import { GisDrainageMapView } from './components/views/GisDrainageMapView';
import { AlertCenterView } from './components/views/AlertCenterView';
import { CropVulnerabilityView } from './components/views/CropVulnerabilityView';
import { FarmersDirectoryView } from './components/views/FarmersDirectoryView';
import { ReportsHistoryView } from './components/views/ReportsHistoryView';

export default function App() {
  // Underlying primary datasets
  const [locations, setLocations] = useState<LocationData[]>(INITIAL_LOCATIONS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [commLogs, setCommLogs] = useState<CommunicationLogItem[]>(INITIAL_COMM_LOGS);
  const [farmers, setFarmers] = useState<FarmerRecord[]>(REGISTERED_FARMERS);
  const [plots, setPlots] = useState<AgriculturalPlot[]>(AGRICULTURAL_PLOTS);
  const [areas] = useState<AgriculturalArea[]>(AGRICULTURAL_AREAS);
  const [incidents] = useState<HistoricalIncident[]>(HISTORICAL_INCIDENTS);
  const [events, setEvents] = useState<HistoricalEvent[]>(HISTORICAL_EVENTS);
  const [recommendations] = useState<AreaRecommendation[]>(AREA_RECOMMENDATIONS);
  const [crops] = useState<CropInfo[]>(CROPS_CATALOG);

  // Role and Navigation states
  const [role, setRole] = useState<UserRole>('farmer');
  const [farmerTab, setFarmerTab] = useState<FarmerTab>('home');
  const [officerTab, setOfficerTab] = useState<OfficerTab>('overview');
  const [language, setLanguage] = useState<Language>('en');

  // Synchronized persistent area and location selections
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>('LOC-DHR-A');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(INITIAL_LOCATIONS[0].id);

  // Simulation controls & Active Scenario tracker
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [activeScenarioName, setActiveScenarioName] = useState<string | null>(null);

  // Offline-first store-and-forward queue
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<AlertItem[]>([]);

  // Configurable risk thresholds
  const [thresholds, setThresholds] = useState<RiskThresholdConfig>(DEFAULT_THRESHOLDS);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);

  // Interval refs
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdCountdownRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize area selection to location
  const handleSelectArea = (areaId: string | null) => {
    setSelectedAreaId(areaId);
    if (areaId) {
      const match = areas.find((a) => a.id === areaId);
      if (match) {
        setSelectedLocationId(match.locationId);
      }
    }
  };

  // Synchronize location selection to area
  const handleSelectLocation = (locId: string) => {
    setSelectedLocationId(locId);
    const match = locations.find((l) => l.id === locId);
    if (match && match.localityId) {
      setSelectedAreaId(match.localityId);
    }
  };

  // ---------------- PERIODIC TELEMETRY SIMULATION ----------------
  useEffect(() => {
    if (!isSimulating) {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      return;
    }

    const intervalMs = Math.max(1000, 3500 / simulationSpeed);

    simulationTimerRef.current = setInterval(() => {
      setLocations((prevLocations) =>
        prevLocations.map((loc) => {
          if (loc.farmSideSensor.status === 'FAULT' || loc.farmSideSensor.levelCm === null) {
            return loc;
          }

          // Subtle physical fluctuation
          const driftFarm = (Math.random() - 0.49) * 0.35;
          const driftDown = (Math.random() - 0.49) * 0.3;
          const driftVelocity = (Math.random() - 0.5) * 0.02;

          const newFarmLevel = Math.max(
            5,
            Number((loc.farmSideSensor.levelCm + driftFarm).toFixed(1))
          );
          const newDownstreamLevel = Math.max(
            4,
            Number(((loc.downstreamSensor.levelCm ?? 20) + driftDown).toFixed(1))
          );

          const newDiff = computeDifferential(newFarmLevel, newDownstreamLevel)!;
          const newVelocity = Math.max(
            -0.5,
            Number((loc.flowSensor.velocityMs + driftVelocity).toFixed(2))
          );
          const newDischargeLs = Math.max(
            -500,
            Math.round(newVelocity * 1000)
          );

          const updatedFarmSensor = {
            ...loc.farmSideSensor,
            levelCm: newFarmLevel,
            lastReadingTime: new Date().toISOString(),
          };

          const updatedDownstreamSensor = {
            ...loc.downstreamSensor,
            levelCm: newDownstreamLevel,
            lastReadingTime: new Date().toISOString(),
          };

          const updatedFlowSensor = {
            ...loc.flowSensor,
            velocityMs: newVelocity,
            dischargeLs: newDischargeLs,
            dischargeM3s: Number((newDischargeLs / 1000).toFixed(2)),
          };

          const newFreeboard = Math.max(0, loc.totalChannelDepthCm - newFarmLevel);
          const newCapacityPct = Math.min(
            100,
            Math.round((newFarmLevel / loc.totalChannelDepthCm) * 100)
          );

          // Evaluate risk and hydraulic state
          const evalResult = evaluateLocationRisk(
            updatedFarmSensor,
            updatedDownstreamSensor,
            updatedFlowSensor,
            loc.rateOfRiseCmHr,
            loc.floatSwitch,
            newFreeboard,
            thresholds
          );

          const hydraulicResult = classifyHydraulicState(
            newFarmLevel,
            newDownstreamLevel,
            loc.rateOfRiseCmHr,
            newVelocity,
            loc.flowSensor.direction,
            newFreeboard
          );

          const diag = diagnoseBlockage(
            loc.nodeCode,
            loc.localityName,
            loc.blockageDiagnosis.affectedSegment,
            loc.blockageDiagnosis.segmentInterval,
            loc.blockageDiagnosis.estimatedDistanceMeters,
            newFarmLevel,
            newDownstreamLevel,
            newDiff,
            newVelocity,
            newDischargeLs,
            loc.rateOfRiseCmHr,
            thresholds
          );

          const updatedHistory = [
            ...loc.history.slice(1),
            {
              timestamp: new Date().toISOString(),
              farmLevel: newFarmLevel,
              downstreamLevel: newDownstreamLevel,
              differential: newDiff,
              flowVelocityMs: newVelocity,
              dischargeLs: newDischargeLs,
              rainfallMm: loc.history[loc.history.length - 1]?.rainfallMm || 0,
            },
          ];

          const shouldBeaconBeOn =
            evalResult.shouldActivateBeacon ||
            (loc.beaconState.isActive && (loc.beaconState.holdSecondsRemaining ?? 0) > 0);

          return {
            ...loc,
            farmSideSensor: updatedFarmSensor,
            downstreamSensor: updatedDownstreamSensor,
            flowSensor: updatedFlowSensor,
            differentialLevelCm: newDiff,
            freeboardCm: newFreeboard,
            channelCapacityPct: newCapacityPct,
            riskLevel: evalResult.riskLevel,
            riskReason: evalResult.reason,
            hydraulicState: hydraulicResult.hydraulicState,
            hydraulicReason: hydraulicResult.hydraulicReason,
            blockageDiagnosis: diag,
            beaconState: {
              ...loc.beaconState,
              isActive: shouldBeaconBeOn,
              mode: shouldBeaconBeOn ? 'FLASHING_RED' : 'OFF',
              buzzerActive: evalResult.shouldActivateBeacon,
            },
            lastUpdated: new Date().toISOString(),
            history: updatedHistory,
          };
        })
      );
    }, intervalMs);

    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [isSimulating, simulationSpeed, thresholds]);

  // Recalculate risks and blockages when thresholds change
  const handleSaveThresholds = (newThresholds: RiskThresholdConfig) => {
    setThresholds(newThresholds);
    setLocations((prev) =>
      prev.map((loc) => {
        const evalResult = evaluateLocationRisk(
          loc.farmSideSensor,
          loc.downstreamSensor,
          loc.flowSensor,
          loc.rateOfRiseCmHr,
          loc.floatSwitch,
          loc.freeboardCm,
          newThresholds
        );
        const diag = diagnoseBlockage(
          loc.nodeCode,
          loc.localityName,
          loc.blockageDiagnosis.affectedSegment,
          loc.blockageDiagnosis.segmentInterval,
          loc.blockageDiagnosis.estimatedDistanceMeters,
          loc.farmSideSensor.levelCm ?? 0,
          loc.downstreamSensor.levelCm ?? 0,
          loc.differentialLevelCm,
          loc.flowSensor.velocityMs,
          loc.flowSensor.dischargeLs,
          loc.rateOfRiseCmHr,
          newThresholds
        );

        const shouldBeaconBeOn =
          evalResult.shouldActivateBeacon ||
          (loc.beaconState.isActive && (loc.beaconState.holdSecondsRemaining ?? 0) > 0);

        return {
          ...loc,
          riskLevel: evalResult.riskLevel,
          riskReason: evalResult.reason,
          blockageDiagnosis: diag,
          beaconState: {
            ...loc.beaconState,
            isActive: shouldBeaconBeOn,
            mode: shouldBeaconBeOn ? 'FLASHING_RED' : 'OFF',
            buzzerActive: evalResult.shouldActivateBeacon,
          },
        };
      })
    );
  };

  // ---------------- 7 DEMONSTRATION SCENARIOS ENGINE ----------------
  const handleTriggerScenario = (scenarioNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
    const nowIso = new Date().toISOString();

    // 1. Heavy rainfall runoff surge
    if (scenarioNumber === 1) {
      setActiveScenarioName('Scenario 1: Heavy Rainfall Runoff Surge');

      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.nodeCode === 'JN-007' || loc.nodeCode === 'JN-011') {
            const surgedFarm = Number(((loc.farmSideSensor.levelCm || 60) + 22.0).toFixed(1));
            const surgedDown = Number(((loc.downstreamSensor.levelCm || 50) + 12.0).toFixed(1));
            const diff = Number((surgedFarm - surgedDown).toFixed(1));
            const surgedRate = 8.5;
            const surgedVel = 0.88;
            const surgedDischarge = 880;

            const updatedFarm = { ...loc.farmSideSensor, levelCm: surgedFarm, lastReadingTime: nowIso };
            const updatedDown = { ...loc.downstreamSensor, levelCm: surgedDown, lastReadingTime: nowIso };
            const updatedFlow = {
              ...loc.flowSensor,
              velocityMs: surgedVel,
              dischargeLs: surgedDischarge,
              dischargeM3s: 0.88,
              direction: 'DOWNSTREAM' as const,
            };

            const evalRes = evaluateLocationRisk(
              updatedFarm,
              updatedDown,
              updatedFlow,
              surgedRate,
              loc.floatSwitch,
              loc.totalChannelDepthCm - surgedFarm,
              thresholds
            );

            return {
              ...loc,
              farmSideSensor: updatedFarm,
              downstreamSensor: updatedDown,
              flowSensor: updatedFlow,
              differentialLevelCm: diff,
              rateOfRiseCmHr: surgedRate,
              riskLevel: evalRes.riskLevel,
              riskReason: evalRes.reason,
              hydraulicState: 'RISING' as const,
              hydraulicReason: `Heavy monsoon downpour: runoff surging at +${surgedRate} cm/hr.`,
              lastUpdated: nowIso,
            };
          }
          return loc;
        })
      );

      const surgeAlert: AlertItem = {
        id: `ALT-SURGE-${Date.now().toString().slice(-4)}`,
        nodeCode: 'JN-007',
        locationId: 'LOC-JN-007',
        locationName: 'Basirhat Vegetable Belt Inflow V-02',
        localityName: 'Basirhat Basin / Ichhamati Belt',
        category: 'CRITICAL',
        severity: 'CRITICAL',
        triggerCondition: 'Cloudburst: Farm level surged +22.0cm, rate of rise 8.5 cm/hr, discharge 880 L/s',
        readings: { farmLevel: 111.5, downstreamLevel: 89.0, differential: 22.5, rateOfRise: 8.5, flowVelocityMs: 0.82, dischargeLs: 880 },
        timestamp: nowIso,
        recommendedAction: 'Hoist Regulator R-03 radial gates. Dig drainage trenches to protect pointed gourd and brinjal roots.',
        recommendedActionBengali: 'রেগুলেটর আর-০৩ এর গেট অবিলম্বে পুরোপুরি তুলুন। পটল ও বেগুনের গোড়ায় নিকাশী নালা কাটুন।',
        recommendedActionHindi: 'नियामक आर-03 के गेट खोलें। परवल और बैंगन की जड़ों को बचाने के लिए नालियां बनाएं।',
        acknowledged: false,
      };

      const surgeCommLog: CommunicationLogItem = {
        id: `LOG-SMS-${Date.now().toString().slice(-4)}`,
        recipientType: 'FARMER',
        recipientName: 'Khokan Mondal',
        phone: '+91-98311-66201',
        nodeCode: 'JN-007',
        localityName: 'Basirhat Basin / Ichhamati Belt',
        channel: 'SMS',
        language: 'bn',
        messageType: 'DANGER_ALERT',
        messageContent: 'জল-নিকাশ জরুরি অ্যালার্ট: বসিরহাটে জলস্তর আশঙ্কাজনকভাবে বাড়ছে (১১১.৫ সেমি)। পটল ও বেগুনের ড্রেন কাটুন।',
        status: isOfflineMode ? 'QUEUED_OFFLINE' : 'DELIVERED',
        retryCount: 0,
        timestamp: nowIso,
      };

      if (isOfflineMode) {
        setSyncQueue((q) => [surgeAlert, ...q]);
      } else {
        setAlerts((prev) => [surgeAlert, ...prev]);
      }
      setCommLogs((prev) => [surgeCommLog, ...prev]);
    }

    // 2. Downstream river surge & backflow
    else if (scenarioNumber === 2) {
      setActiveScenarioName('Scenario 2: Downstream Estuary River Surge (Backflow)');

      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.nodeCode === 'JN-001') {
            const farmVal = 63.5;
            const downVal = 76.2;
            const diff = -12.7;
            const updatedFarm = { ...loc.farmSideSensor, levelCm: farmVal };
            const updatedDown = { ...loc.downstreamSensor, levelCm: downVal };
            const updatedFlow = {
              ...loc.flowSensor,
              velocityMs: -0.16,
              dischargeLs: -240,
              dischargeM3s: -0.24,
              direction: 'REVERSED' as const,
            };

            return {
              ...loc,
              farmSideSensor: updatedFarm,
              downstreamSensor: updatedDown,
              flowSensor: updatedFlow,
              differentialLevelCm: diff,
              riskLevel: 'DANGER' as const,
              riskReason: 'High tidal river swell: Downstream river exceeds farm culvert by 12.7cm. Reverse backflow pushing saline water inland.',
              hydraulicState: 'BACKFLOWING' as const,
              hydraulicReason: 'Downstream tidal level (76.2 cm) exceeds farm intake (63.5 cm). Reverse gradient (-0.16 m/s).',
              beaconState: {
                isActive: true,
                mode: 'FLASHING_RED' as const,
                buzzerActive: true,
                activatedAt: nowIso,
                holdSecondsRemaining: 0,
              },
              sluiceGateStatus: 'CLOSED' as const,
              lastUpdated: nowIso,
            };
          }
          return loc;
        })
      );

      const backflowAlert: AlertItem = {
        id: `ALT-BCK-${Date.now().toString().slice(-4)}`,
        nodeCode: 'JN-001',
        locationId: 'LOC-JN-001',
        locationName: 'Diamond Harbour Outfall Sluice Gate S-01',
        localityName: 'Diamond Harbour South Basin',
        category: 'DANGER',
        severity: 'CRITICAL',
        triggerCondition: 'Downstream tidal river (76.2cm) exceeds farm culvert (63.5cm) by 12.7cm. Reverse flow -0.16 m/s.',
        readings: { farmLevel: 63.5, downstreamLevel: 76.2, differential: -12.7, rateOfRise: 2.8, flowVelocityMs: -0.16, dischargeLs: -240 },
        timestamp: nowIso,
        recommendedAction: 'Drop farm inlet flap gate immediately. Start axial pump to arrest saline backflow into Sarisha vegetable collector.',
        recommendedActionBengali: 'অবিলম্বে ইনলেট ফ্ল্যাপ গেট বন্ধ করুন। নোনা জলের ব্যাকফ্লো আটকাতে পাম্প চালান।',
        recommendedActionHindi: 'तुरंत इनलेट फ्लैप गेट बंद करें। खारे पानी के बैकफ्लो को रोकने के लिए पंप चलाएं।',
        acknowledged: false,
      };

      if (isOfflineMode) {
        setSyncQueue((q) => [backflowAlert, ...q]);
      } else {
        setAlerts((prev) => [backflowAlert, ...prev]);
      }
    }

    // 3. Drainage blockage detection & localisation
    else if (scenarioNumber === 3) {
      setActiveScenarioName('Scenario 3: Silt & Water Hyacinth Blockage Detection');

      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.nodeCode === 'JN-004') {
            const farmVal = 103.5;
            const downVal = 78.0;
            const diff = 25.5;

            const updatedFarm = { ...loc.farmSideSensor, levelCm: farmVal };
            const updatedDown = { ...loc.downstreamSensor, levelCm: downVal };
            const updatedFlow = {
              ...loc.flowSensor,
              velocityMs: 0.12,
              dischargeLs: 140,
              dischargeM3s: 0.14,
              direction: 'REDUCED' as const,
            };

            const diag = diagnoseBlockage(
              'JN-004',
              'Kakdwip Island North Polder',
              'Channel Segment B1 (Polder Collector to Sluice J-05)',
              'Between JN-004 and JN-005',
              260,
              farmVal,
              downVal,
              diff,
              0.12,
              140,
              4.8,
              thresholds
            );

            return {
              ...loc,
              farmSideSensor: updatedFarm,
              downstreamSensor: updatedDown,
              flowSensor: updatedFlow,
              differentialLevelCm: diff,
              rateOfRiseCmHr: 4.8,
              riskLevel: 'DANGER' as const,
              riskReason: 'Severe drainage blockage detected at 260m downstream. Differential head is +25.5cm while velocity is only 0.12 m/s.',
              hydraulicState: 'RISING' as const,
              hydraulicReason: 'Water pooling upstream (+4.8 cm/hr) behind dense water hyacinth and silt mound.',
              blockageDiagnosis: diag,
              beaconState: {
                isActive: true,
                mode: 'FLASHING_RED' as const,
                buzzerActive: true,
                activatedAt: nowIso,
              },
              sluiceGateStatus: 'CHOKED' as const,
              lastUpdated: nowIso,
            };
          }
          return loc;
        })
      );

      const woId = `WO-BLK-${Date.now().toString().slice(-4)}`;
      const newWo: WorkOrder = {
        id: woId,
        nodeCode: 'JN-004',
        nodeName: 'Kakdwip Polder Outfall Canal J-05',
        localityId: 'LOC-KKD-B',
        localityName: 'Kakdwip Island North Polder',
        segment: 'Channel Segment B1 (Polder Collector to Sluice J-05)',
        severity: 'SEVERE_BLOCKAGE',
        suspectedLocation: '260 meters downstream of JN-004 culvert',
        supportingEvidence: [
          'Differential head expanded to +25.5cm while velocity collapsed to 0.12 m/s.',
          'Water accumulating upstream at +4.8 cm/hr behind constriction.',
        ],
        assignedPersonnel: 'Panchayat Emergency Drain Clearance Team (Lead: Bikash Gayen)',
        status: 'IN_PROGRESS',
        createdAt: nowIso,
        notes: 'JCB mini-excavator and bamboo rake crew mobilized.',
      };

      setWorkOrders((prev) => [newWo, ...prev]);

      const blkAlert: AlertItem = {
        id: `ALT-BLK-${Date.now().toString().slice(-4)}`,
        nodeCode: 'JN-004',
        locationId: 'LOC-JN-004',
        locationName: 'Kakdwip Polder Outfall Canal J-05',
        localityName: 'Kakdwip Island North Polder',
        category: 'DANGER',
        severity: 'CRITICAL',
        triggerCondition: 'Multi-node blockage correlation: Head +25.5cm, velocity 0.12 m/s (92% confidence)',
        readings: { farmLevel: 103.5, downstreamLevel: 78.0, differential: 25.5, rateOfRise: 4.8, flowVelocityMs: 0.12, dischargeLs: 140 },
        timestamp: nowIso,
        recommendedAction: 'Dispatch mechanical excavator to dredge sediment hump at 260m mark. Work order dispatched.',
        recommendedActionBengali: 'JN-004 এর ২৬০ মিটার ভাটিতে জরুরি ড্রেজিং প্রয়োজন। ওয়ার্ক অর্ডার পাঠানো হয়েছে।',
        recommendedActionHindi: 'JN-004 के 260 मीटर नीचे गाद हटाने के लिए जेसीबी भेजें। वर्क ऑर्डर जारी किया गया।',
        acknowledged: false,
        workOrderId: woId,
      };

      if (isOfflineMode) {
        setSyncQueue((q) => [blkAlert, ...q]);
      } else {
        setAlerts((prev) => [blkAlert, ...prev]);
      }
    }

    // 4. Critical waterlogging & beacon escalation
    else if (scenarioNumber === 4) {
      setActiveScenarioName('Scenario 4: Critical Waterlogging & Beacon Escalation');

      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.nodeCode === 'JN-007') {
            const updatedFarm = { ...loc.farmSideSensor, levelCm: 111.5 };
            const updatedDown = { ...loc.downstreamSensor, levelCm: 89.0 };

            return {
              ...loc,
              farmSideSensor: updatedFarm,
              downstreamSensor: updatedDown,
              floatSwitch: { status: 'TRIPPED' as const, lastTrippedAt: nowIso },
              riskLevel: 'CRITICAL' as const,
              riskReason: 'CRITICAL SUBMERGENCE ALERT! Float switch tripped and water level reached 111.5cm. Immediate root inundation underway.',
              beaconState: {
                isActive: true,
                mode: 'FLASHING_RED' as const,
                buzzerActive: true,
                activatedAt: nowIso,
                holdSecondsRemaining: 0,
              },
              lastUpdated: nowIso,
            };
          }
          return loc;
        })
      );

      const critComm: CommunicationLogItem = {
        id: `LOG-IVR-${Date.now().toString().slice(-4)}`,
        recipientType: 'PANCHAYAT',
        recipientName: 'Pradhan Tapan Kumar Das (Itinda GP)',
        phone: '+91-98311-77342',
        nodeCode: 'JN-007',
        localityName: 'Basirhat Basin / Ichhamati Belt',
        channel: 'IVR',
        language: 'bn',
        messageType: 'DANGER_ALERT',
        messageContent: 'জরুরি ভয়েস কল: বসিরহাট নোড JN-007 এ ফ্লোট সুইচ ট্রিপ করেছে! লাল বীকন চালু হয়েছে। স্লুইস আর-০৩ অবিলম্বে খুলুন।',
        status: isOfflineMode ? 'QUEUED_OFFLINE' : 'DELIVERED',
        retryCount: 0,
        timestamp: nowIso,
      };

      setCommLogs((prev) => [critComm, ...prev]);
    }

    // 5. Blockage clearance & mitigation hold countdown
    else if (scenarioNumber === 5) {
      setActiveScenarioName('Scenario 5: Obstacle Clearance & Mitigation Hold Countdown');

      // Clear blockage at JN-004 & backflow at JN-001
      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.nodeCode === 'JN-004' || loc.nodeCode === 'JN-001') {
            const restoredFarm = 48.0;
            const restoredDown = 38.0;
            const restoredVel = 0.65;
            const restoredDischarge = 520;

            return {
              ...loc,
              farmSideSensor: { ...loc.farmSideSensor, levelCm: restoredFarm },
              downstreamSensor: { ...loc.downstreamSensor, levelCm: restoredDown },
              flowSensor: {
                ...loc.flowSensor,
                velocityMs: restoredVel,
                dischargeLs: restoredDischarge,
                dischargeM3s: 0.52,
                direction: 'DOWNSTREAM' as const,
              },
              differentialLevelCm: 10.0,
              rateOfRiseCmHr: -2.5, // Actively receding
              riskLevel: 'NORMAL' as const,
              riskReason: 'Blockage dredged and cleared. Outflow velocity restored to 0.65 m/s. Clearance hold timer running before beacon deactivation.',
              hydraulicState: 'RECEDING' as const,
              hydraulicReason: 'Water level receding at -2.5 cm/hr with positive discharge (0.65 m/s).',
              beaconState: {
                ...loc.beaconState,
                isActive: true, // Remains active during hold countdown!
                holdSecondsRemaining: 25,
              },
              blockageDiagnosis: {
                ...loc.blockageDiagnosis,
                confidenceScore: 0,
                severity: 'NORMAL' as const,
                isCleared: true,
                recommendedAction: 'Clearance verified. Nominal gravitational outflow restored.',
              },
              sluiceGateStatus: 'OPEN' as const,
              lastUpdated: nowIso,
            };
          }
          return loc;
        })
      );

      // Resolve open work orders for JN-004 and JN-001
      setWorkOrders((prev) =>
        prev.map((w) =>
          w.nodeCode === 'JN-004' || w.nodeCode === 'JN-001'
            ? { ...w, status: 'CLEARED' as const, resolvedAt: nowIso, notes: 'Excavator completed dredging. Flow restored.' }
            : w
        )
      );

      // Start hold timer countdown: 25 seconds
      if (holdCountdownRef.current) clearInterval(holdCountdownRef.current);
      let remainingSec = 25;

      holdCountdownRef.current = setInterval(() => {
        remainingSec -= 1;
        if (remainingSec <= 0) {
          if (holdCountdownRef.current) clearInterval(holdCountdownRef.current);

          // Shut off beacon & buzzer
          setLocations((prev) =>
            prev.map((loc) =>
              loc.nodeCode === 'JN-004' || loc.nodeCode === 'JN-001'
                ? {
                    ...loc,
                    beaconState: {
                      isActive: false,
                      mode: 'OFF' as const,
                      buzzerActive: false,
                      holdSecondsRemaining: 0,
                      lastMitigatedAt: new Date().toISOString(),
                    },
                  }
                : loc
            )
          );

          // Add mitigation notification
          const mitComm: CommunicationLogItem = {
            id: `LOG-MIT-${Date.now().toString().slice(-4)}`,
            recipientType: 'FARMER',
            recipientName: 'Dulal Samanta',
            phone: '+91-94340-77101',
            nodeCode: 'JN-004',
            localityName: 'Kakdwip Island North Polder',
            channel: 'SMS',
            language: 'bn',
            messageType: 'MITIGATION_NOTICE',
            messageContent: 'জল-নিকাশ নোটিশ: JN-004 এ নালা পরিষ্কার সম্পন্ন হয়েছে। জলস্তর স্বাভাবিক (৪৮ সেমি), সতর্কতা বীকন বন্ধ করা হলো।',
            status: 'DELIVERED',
            retryCount: 0,
            timestamp: new Date().toISOString(),
          };
          setCommLogs((prev) => [mitComm, ...prev]);
        } else {
          setLocations((prev) =>
            prev.map((loc) =>
              loc.nodeCode === 'JN-004' || loc.nodeCode === 'JN-001'
                ? {
                    ...loc,
                    beaconState: {
                      ...loc.beaconState,
                      holdSecondsRemaining: remainingSec,
                    },
                  }
                : loc
            )
          );
        }
      }, 1000);
    }

    // 6. Cellular gateway outage (offline store-and-forward)
    else if (scenarioNumber === 6) {
      setActiveScenarioName('Scenario 6: Cellular Gateway Outage (Offline Buffer)');
      setIsOfflineMode(true);

      setLocations((prev) =>
        prev.map((loc) => ({
          ...loc,
          gsmState: {
            ...loc.gsmState,
            status: 'QUEUED_OFFLINE' as const,
            signalDbm: -115,
            signalBars: 0,
            simStatus: 'ERROR' as const,
            queuedCount: 3,
          },
        }))
      );
    }

    // 7. Sensor failure & fail-safe handling
    else if (scenarioNumber === 7) {
      setActiveScenarioName('Scenario 7: Transducer Sensor Fault & Fail-Safe');

      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.nodeCode === 'JN-005') {
            return {
              ...loc,
              farmSideSensor: {
                ...loc.farmSideSensor,
                levelCm: null,
                status: 'FAULT' as const,
                batteryPct: 12,
                signalDbm: -110,
              },
              riskLevel: 'SENSOR_FAULT' as const,
              riskReason: 'Ultrasonic echo lost / transducer disconnected. Strict safety rule: missing telemetry cannot verify drainage safety.',
              lastUpdated: nowIso,
            };
          }
          return loc;
        })
      );
    }
  };

  // Reset simulation to nominal baseline
  const handleResetSimulation = () => {
    if (holdCountdownRef.current) clearInterval(holdCountdownRef.current);
    setActiveScenarioName(null);
    setLocations(INITIAL_LOCATIONS);
    setAlerts(INITIAL_ALERTS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setCommLogs(INITIAL_COMM_LOGS);
    setFarmers(REGISTERED_FARMERS);
    setPlots(AGRICULTURAL_PLOTS);
    setIsOfflineMode(false);
    setSyncQueue([]);
  };

  // Toggle offline mode (Store-and-forward sync)
  const handleToggleOfflineMode = () => {
    if (isOfflineMode) {
      // Reconnected! Flush queued alerts and notifications
      if (syncQueue.length > 0) {
        setAlerts((prev) => [...syncQueue, ...prev]);
        setSyncQueue([]);
      }
      setCommLogs((prev) =>
        prev.map((log) =>
          log.status === 'QUEUED_OFFLINE' ? { ...log, status: 'DELIVERED' as const } : log
        )
      );
      setLocations((prev) =>
        prev.map((loc) => ({
          ...loc,
          gsmState: {
            ...loc.gsmState,
            status: 'ONLINE' as const,
            signalDbm: -65,
            signalBars: 4,
            simStatus: 'INSERTED_ACTIVE' as const,
            queuedCount: 0,
          },
        }))
      );
      setIsOfflineMode(false);
    } else {
      setIsOfflineMode(true);
      setLocations((prev) =>
        prev.map((loc) => ({
          ...loc,
          gsmState: {
            ...loc.gsmState,
            status: 'QUEUED_OFFLINE' as const,
            signalBars: 0,
          },
        }))
      );
    }
  };

  // Toggle beacon manually on any node
  const handleToggleBeacon = (locationId: string) => {
    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === locationId) {
          const nextActive = !loc.beaconState.isActive;
          return {
            ...loc,
            beaconState: {
              isActive: nextActive,
              mode: nextActive ? ('FLASHING_RED' as const) : ('OFF' as const),
              buzzerActive: nextActive,
              activatedAt: nextActive ? new Date().toISOString() : undefined,
              holdSecondsRemaining: 0,
            },
          };
        }
        return loc;
      })
    );
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = (alertId: string, operatorName?: string, notes?: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              acknowledged: true,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: operatorName || 'Gram Panchayat Pradhan',
              notes: notes || 'Verified on site. Sluice inspected.',
            }
          : a
      )
    );
  };

  // Work order handlers
  const handleCreateWorkOrder = (wo: WorkOrder) => {
    setWorkOrders((prev) => [wo, ...prev]);
  };

  const handleResolveWorkOrder = (woId: string, notes?: string) => {
    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === woId
          ? {
              ...w,
              status: 'CLEARED' as const,
              resolvedAt: new Date().toISOString(),
              notes: notes || 'Obstruction dredged. Sluice clearance confirmed.',
            }
          : w
      )
    );
  };

  const handleResendNotification = (logId: string) => {
    setCommLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? {
              ...l,
              status: 'DELIVERED' as const,
              retryCount: l.retryCount + 1,
              timestamp: new Date().toISOString(),
            }
          : l
      )
    );
  };

  // Farmer registration handlers
  const handleAddFarmer = (f: FarmerRecord) => {
    setFarmers((prev) => [f, ...prev]);
  };

  const handleUpdateFarmer = (f: FarmerRecord) => {
    setFarmers((prev) => prev.map((item) => (item.id === f.id ? f : item)));
  };

  const handleDispatchTestAlert = (f: FarmerRecord, channel: 'SMS' | 'IVR') => {
    const newLog: CommunicationLogItem = {
      id: `LOG-${channel}-${Date.now().toString().slice(-4)}`,
      recipientType: 'FARMER',
      recipientName: f.name,
      phone: f.phone,
      nodeCode: f.plotIds[0] || 'JN-001',
      localityName: f.localityName,
      channel,
      language: f.language,
      messageType: 'WARNING_ALERT',
      messageContent: `Test ${channel} alert sent to farmer ${f.name} for crop ${f.primaryCrop}.`,
      status: isOfflineMode ? 'QUEUED_OFFLINE' : 'DELIVERED',
      retryCount: 0,
      timestamp: new Date().toISOString(),
    };
    setCommLogs((prev) => [newLog, ...prev]);
  };

  const currentArea = areas.find((a) => a.id === selectedAreaId) || areas[0];
  const currentLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];
  const currentRecommendation = recommendations.find((r) => r.areaId === currentArea.id);
  const currentIncidents = incidents.filter((i) => i.areaId === currentArea.id);

  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;
  const activeCriticalAlerts = alerts.filter(
    (a) => a.severity === 'CRITICAL' || a.category === 'DANGER' || a.category === 'CRITICAL'
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. Global Role Selector Switcher */}
      <RoleSelector
        currentRole={role}
        onRoleChange={setRole}
        language={language}
      />

      {/* 2. Top Application Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        currentRole={role}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        simulationSpeed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        onTriggerStorm={() => handleTriggerScenario(1)}
        onTriggerBackflow={() => handleTriggerScenario(2)}
        onResetSimulation={handleResetSimulation}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={handleToggleOfflineMode}
        pendingSyncCount={syncQueue.length}
        onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
      />

      {/* 3. Role-Based Navigation */}
      {role === 'farmer' ? (
        <FarmerNavigation
          activeTab={farmerTab}
          onTabChange={setFarmerTab}
          language={language}
          unreadAlertCount={unreadAlertsCount}
        />
      ) : (
        <Navigation
          activeTab={officerTab}
          onTabChange={setOfficerTab}
          language={language}
          unreadAlertCount={unreadAlertsCount}
        />
      )}

      {/* 4. Main Body Content */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 flex-1 w-full">
        {/* System & Critical Advisories Banner (Panchayat Officer mode) */}
        {role === 'officer' && (
          <SystemBanner
            language={language}
            activeCriticalAlerts={activeCriticalAlerts}
            isOfflineMode={isOfflineMode}
            pendingSyncCount={syncQueue.length}
            onSelectAlertLocation={(locId) => {
              handleSelectLocation(locId);
              setOfficerTab('monitoring');
            }}
            onSyncNow={handleToggleOfflineMode}
          />
        )}

        {/* ----------------- FARMER INTERFACE VIEWS ----------------- */}
        {role === 'farmer' && (
          <>
            {farmerTab === 'home' && (
              <FarmerHomeView
                areas={areas}
                selectedAreaId={currentArea.id}
                onSelectArea={handleSelectArea}
                location={currentLocation}
                alerts={alerts}
                crops={crops}
                plots={plots}
                recommendation={currentRecommendation}
                recentIncidents={currentIncidents}
                language={language}
                onNavigateTab={setFarmerTab}
              />
            )}

            {farmerTab === 'field' && (
              <FarmerFieldStatusView
                area={currentArea}
                location={currentLocation}
                crops={crops}
                language={language}
              />
            )}

            {farmerTab === 'alerts' && (
              <FarmerAlertsView
                area={currentArea}
                alerts={alerts}
                language={language}
              />
            )}

            {farmerTab === 'recommendations' && (
              <FarmerRecommendationsView
                area={currentArea}
                recommendations={recommendations}
                crops={crops}
                language={language}
              />
            )}

            {farmerTab === 'map' && (
              <FarmerLocalMapView
                areas={areas}
                selectedAreaId={currentArea.id}
                onSelectArea={handleSelectArea}
                location={currentLocation}
                language={language}
              />
            )}

            {farmerTab === 'settings' && (
              <FarmerSettingsView
                language={language}
                onLanguageChange={setLanguage}
              />
            )}
          </>
        )}

        {/* ----------------- PANCHAYAT OFFICER INTERFACE VIEWS ----------------- */}
        {role === 'officer' && (
          <>
            {officerTab === 'overview' && (
              <OverviewView
                locations={locations}
                alerts={alerts}
                workOrders={workOrders}
                commLogs={commLogs}
                selectedLocationId={selectedLocationId}
                onSelectLocation={handleSelectLocation}
                onNavigateToTab={setOfficerTab}
                language={language}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onTriggerScenario={handleTriggerScenario}
                isSimulating={isSimulating}
                onToggleSimulation={() => setIsSimulating(!isSimulating)}
                simulationSpeed={simulationSpeed}
                onSpeedChange={setSimulationSpeed}
                onResetSimulation={handleResetSimulation}
                isOfflineMode={isOfflineMode}
                activeScenarioName={activeScenarioName}
                thresholds={thresholds}
              />
            )}

            {officerTab === 'monitoring' && (
              <LiveMonitoringView
                locations={locations}
                selectedLocationId={selectedLocationId}
                onSelectLocation={handleSelectLocation}
                language={language}
                isSimulating={isSimulating}
                onToggleSimulation={() => setIsSimulating(!isSimulating)}
                onTriggerStorm={() => handleTriggerScenario(1)}
                onTriggerBackflow={() => handleTriggerScenario(2)}
                onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
                onToggleBeacon={handleToggleBeacon}
                thresholds={thresholds}
              />
            )}

            {officerTab === 'gis' && (
              <GisDrainageMapView
                locations={locations}
                areas={areas}
                selectedAreaId={selectedAreaId}
                onSelectArea={handleSelectArea}
                selectedLocationId={selectedLocationId}
                onSelectLocation={handleSelectLocation}
                incidents={incidents}
                events={events}
                recommendations={recommendations}
                language={language}
                onNavigateToMonitoring={(locId) => {
                  handleSelectLocation(locId);
                  setOfficerTab('monitoring');
                }}
                onNavigateToAlerts={(locId) => {
                  handleSelectLocation(locId);
                  setOfficerTab('alerts');
                }}
                onToggleBeacon={handleToggleBeacon}
              />
            )}

            {officerTab === 'alerts' && (
              <AlertCenterView
                alerts={alerts}
                workOrders={workOrders}
                commLogs={commLogs}
                language={language}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onSelectLocation={handleSelectLocation}
                onNavigateToMonitoring={(locId) => {
                  handleSelectLocation(locId);
                  setOfficerTab('monitoring');
                }}
                onCreateWorkOrder={handleCreateWorkOrder}
                onResolveWorkOrder={handleResolveWorkOrder}
                onResendNotification={handleResendNotification}
              />
            )}

            {officerTab === 'crops' && (
              <CropVulnerabilityView
                locations={locations}
                language={language}
                onSelectLocation={handleSelectLocation}
                onNavigateToMonitoring={(locId) => {
                  handleSelectLocation(locId);
                  setOfficerTab('monitoring');
                }}
              />
            )}

            {officerTab === 'farmers' && (
              <FarmersDirectoryView
                farmers={farmers}
                plots={plots}
                areas={areas}
                language={language}
                onAddFarmer={handleAddFarmer}
                onUpdateFarmer={handleUpdateFarmer}
                onDispatchTestAlert={handleDispatchTestAlert}
              />
            )}

            {officerTab === 'reports' && (
              <ReportsHistoryView
                locations={locations}
                alerts={alerts}
                language={language}
              />
            )}
          </>
        )}
      </main>

      {/* Threshold Configuration Drawer */}
      <ThresholdSettingsModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        thresholds={thresholds}
        onSave={handleSaveThresholds}
        language={language}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-800">JAL-NIKAAS</span>
            <span>•</span>
            <span>Agro-Drain Intelligence Platform (Eastern India)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Active Role: {role === 'farmer' ? '🌾 Farmer Portal' : '🏛️ Panchayat Officer Dashboard'}</span>
            <span>•</span>
            <span className="font-medium text-slate-400">12 Nodes • 4 Localities • Radar &amp; Ultrasonic Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
