/**
 * Jal-Nikaas: Agro-Drain Risk Classification & Hydraulic Diagnosis Engine
 *
 * Transparent, deterministic rule engine for agricultural waterlogging,
 * multi-node differential canal analysis, flow correlation, and drainage blockage detection.
 */

import {
  RiskLevel,
  HydraulicState,
  FlowDirection,
  BlockageSeverity,
  BlockageDiagnosis,
  FlowSensorData,
  AlertSeverity,
  SensorPoint,
  RiskThresholdConfig,
  FloatSwitchBackup,
} from '../types';

export const DEFAULT_THRESHOLDS: RiskThresholdConfig = {
  submergenceCriticalCm: 75,
  submergenceWarningCm: 50,
  backflowDifferentialThresholdCm: 0,
  rateOfRiseCriticalCmHr: 8.0,
  rateOfRiseWarningCmHr: 4.0,
  flowVelocityMinThresholdMs: 0.15,
  blockageDifferentialThresholdCm: 18.0,
  beaconClearanceHoldSec: 25, // Demonstrable hold time in prototype
  staleDataTimeoutMinutes: 30,
};

export interface HydraulicEvaluationResult {
  hydraulicState: HydraulicState;
  hydraulicReason: string;
}

export interface RiskEvaluationResult {
  riskLevel: RiskLevel;
  severity: AlertSeverity;
  reason: string;
  triggerCondition: string;
  differentialCm: number | null;
  shouldActivateBeacon: boolean;
}

/**
 * Computes hydraulic differential between farm-side intake and downstream canal/outfall.
 * Positive = Normal outbound gravity drainage
 * Zero or Negative = Reverse gradient (backflow / tidal lock / downstream congestion)
 */
export function computeDifferential(
  farmLevelCm: number | null,
  downstreamLevelCm: number | null
): number | null {
  if (farmLevelCm === null || downstreamLevelCm === null) return null;
  return Number((farmLevelCm - downstreamLevelCm).toFixed(1));
}

/**
 * Calculates rate of water level rise in cm/hour from recent time-series points.
 */
export function computeRateOfRise(
  history: Array<{ timestamp: string; farmLevel: number }>
): number {
  if (!history || history.length < 2) return 0;

  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const latest = sorted[sorted.length - 1];
  const previous = sorted[Math.max(0, sorted.length - 4)]; // Last 3-4 points (~1-2 hours)

  const timeDiffHours =
    (new Date(latest.timestamp).getTime() - new Date(previous.timestamp).getTime()) / (1000 * 60 * 60);

  if (timeDiffHours <= 0) return 0;

  const levelDiff = latest.farmLevel - previous.farmLevel;
  return Number((levelDiff / timeDiffHours).toFixed(2));
}

/**
 * Classifies the operational hydraulic condition of a drainage monitoring point.
 * States: RECEDING, STEADY, RISING, OVERFLOWING, BACKFLOWING
 */
export function classifyHydraulicState(
  farmLevelCm: number,
  downstreamLevelCm: number,
  rateOfRiseCmHr: number,
  flowVelocityMs: number,
  flowDirection: FlowDirection,
  freeboardCm: number
): HydraulicEvaluationResult {
  const diff = computeDifferential(farmLevelCm, downstreamLevelCm) ?? 0;

  // 1. Backflowing: Downstream outfall level exceeds farm level or reverse flow measured
  if (diff < 0 || flowDirection === 'REVERSED') {
    return {
      hydraulicState: 'BACKFLOWING',
      hydraulicReason: `Downstream canal level (${downstreamLevelCm} cm) exceeds farm intake (${farmLevelCm} cm) by ${Math.abs(diff)} cm. Reverse gradient pushing water back toward fields.`,
    };
  }

  // 2. Overflowing: Water level has reached channel crest / freeboard is depleted (< 10 cm)
  if (freeboardCm <= 10) {
    return {
      hydraulicState: 'OVERFLOWING',
      hydraulicReason: `Channel freeboard depleted to ${freeboardCm} cm. Embankment overtopping underway into adjacent agricultural plots.`,
    };
  }

  // 3. Receding: Water level is dropping and downstream drainage flow is discharging
  if (rateOfRiseCmHr < -1.0 && flowVelocityMs >= 0.18) {
    return {
      hydraulicState: 'RECEDING',
      hydraulicReason: `Water level actively receding at ${Math.abs(rateOfRiseCmHr)} cm/hr with positive discharge (${flowVelocityMs} m/s) through outfall.`,
    };
  }

  // 4. Rising: Rapid accumulation from upstream rainfall runoff
  if (rateOfRiseCmHr >= 2.0) {
    return {
      hydraulicState: 'RISING',
      hydraulicReason: `Water level accumulating at +${rateOfRiseCmHr} cm/hr. Inflow volume exceeds current gravitational discharge capacity.`,
    };
  }

  // 5. Steady: Quasi-equilibrium
  return {
    hydraulicState: 'STEADY',
    hydraulicReason: `Water level steady (${farmLevelCm} cm) with normal gravitational head (${diff > 0 ? '+' : ''}${diff} cm) and discharge velocity (${flowVelocityMs} m/s).`,
  };
}

/**
 * Multi-parameter Drainage Blockage Detection Engine
 * Correlates upstream/downstream water head with open-channel flow velocity, discharge,
 * and rate of rise to detect siltation, aquatic weeds (water hyacinth), plastic choke, or collapsed culverts.
 */
export function diagnoseBlockage(
  nodeCode: string,
  localityName: string,
  segmentName: string,
  segmentInterval: string,
  estimatedDistanceMeters: number | undefined,
  farmLevelCm: number,
  downstreamLevelCm: number,
  differentialCm: number,
  flowVelocityMs: number,
  dischargeLs: number,
  rateOfRiseCmHr: number,
  thresholds: RiskThresholdConfig = DEFAULT_THRESHOLDS
): BlockageDiagnosis {
  const evidence: string[] = [];
  let confidenceScore = 0;
  let severity: BlockageSeverity = 'NORMAL';
  let recommendedAction = 'No obstruction detected. Routine monthly canal clearance schedule maintains nominal capacity.';

  // Diagnostic indicator 1: Low velocity despite substantial head
  // Normal open drain with diff > 15 cm should have velocity > 0.40 m/s
  const expectedVelocity = Math.min(1.2, Math.max(0.3, Math.sqrt(Math.max(0, differentialCm) / 100 * 2 * 9.81) * 0.45));
  const velocityDeficit = expectedVelocity - flowVelocityMs;

  if (differentialCm > thresholds.blockageDifferentialThresholdCm && flowVelocityMs < thresholds.flowVelocityMinThresholdMs) {
    // Scenario C: Severe / Complete Drainage Obstruction
    confidenceScore = Math.min(96, Math.round(75 + (differentialCm - thresholds.blockageDifferentialThresholdCm) * 1.2 + (rateOfRiseCmHr > 0 ? 10 : 0)));
    severity = confidenceScore > 85 ? 'CRITICAL_FAILURE' : 'SEVERE_BLOCKAGE';
    evidence.push(`Differential water head (${differentialCm} cm) is abnormally high while flow velocity has stalled at ${flowVelocityMs} m/s (expected ~${expectedVelocity.toFixed(2)} m/s).`);
    evidence.push(`Discharge throttled down to ${dischargeLs} L/s despite upstream water pooling.`);
    if (rateOfRiseCmHr > 1.5) {
      evidence.push(`Upstream water accumulation accelerating at +${rateOfRiseCmHr} cm/hr behind the constriction.`);
    }
    recommendedAction = `Immediate emergency desiltation crew dispatch to ${segmentInterval}. Deploy mechanical excavator or manual silt rake to clear debris/water hyacinth choke.`;
  } else if (differentialCm > 12 && flowVelocityMs < 0.28 && rateOfRiseCmHr >= 0.8) {
    // Scenario B: Partial Obstruction / Siltation
    confidenceScore = Math.min(78, Math.round(55 + (12 - flowVelocityMs * 20)));
    severity = 'MODERATE_BLOCKAGE';
    evidence.push(`Flow velocity (${flowVelocityMs} m/s) is 50–65% below hydraulic capacity for a ${differentialCm} cm gradient.`);
    evidence.push(`Water accumulating upstream at +${rateOfRiseCmHr} cm/hr, indicating progressive culvert siltation.`);
    recommendedAction = `Schedule Panchayat drain clearance team for ${segmentInterval} within 12 hours. Inspect culvert trash screens for plastic and organic matter.`;
  } else if (flowVelocityMs < 0.20 && differentialCm > 8 && rateOfRiseCmHr > 0.2) {
    // Scenario A: Possible early obstruction
    confidenceScore = 42;
    severity = 'POSSIBLE_OBSTRUCTION';
    evidence.push(`Mild discharge restriction: velocity dampened to ${flowVelocityMs} m/s with +${differentialCm} cm head.`);
    recommendedAction = `Monitor node telemetry. Request local Gram Panchayat VRP (Village Resource Person) visual inspection of siphon intake.`;
  } else if (differentialCm < 0) {
    // Backflow condition
    confidenceScore = 88;
    severity = 'SEVERE_BLOCKAGE'; // Hydraulic blockage from opposing head
    evidence.push(`Negative hydraulic head (${differentialCm} cm). Downstream receiving body is backing up into collector.`);
    recommendedAction = `Close intake flap-gate immediately to prevent back-inundation. Operate secondary bypass channel if available.`;
  }

  return {
    confidenceScore,
    severity,
    affectedSegment: segmentName,
    segmentInterval,
    estimatedDistanceMeters,
    supportingEvidence: evidence.length > 0 ? evidence : ['Hydraulic head and flow velocity match open gravity discharge profile.'],
    detectionTime: new Date().toISOString(),
    recommendedAction,
  };
}

/**
 * Transparent evaluation of risk condition for a monitored canal location.
 */
export function evaluateLocationRisk(
  farmSensor: SensorPoint,
  downstreamSensor: SensorPoint,
  flowSensor: FlowSensorData,
  rateOfRiseCmHr: number,
  floatSwitch: FloatSwitchBackup,
  freeboardCm: number,
  thresholds: RiskThresholdConfig = DEFAULT_THRESHOLDS
): RiskEvaluationResult {
  // Rule 1: Check for Sensor Faults (Missing readings, stale telemetry, hardware fault)
  // "Missing data must never be interpreted as safe conditions."
  if (
    farmSensor.status === 'FAULT' ||
    downstreamSensor.status === 'FAULT' ||
    flowSensor.status === 'FAULT' ||
    farmSensor.levelCm === null ||
    downstreamSensor.levelCm === null ||
    isNaN(farmSensor.levelCm) ||
    isNaN(downstreamSensor.levelCm)
  ) {
    const faultySensor =
      farmSensor.status === 'FAULT' || farmSensor.levelCm === null
        ? 'Farm-side ultrasonic'
        : downstreamSensor.status === 'FAULT' || downstreamSensor.levelCm === null
        ? 'Downstream canal'
        : 'Open-channel flow velocity';
    return {
      riskLevel: 'SENSOR_FAULT',
      severity: 'WARNING',
      reason: `${faultySensor} sensor telemetry is missing, invalid or faulted. System cannot verify safe drainage.`,
      triggerCondition: 'Sensor telemetry missing / echo lost / transducer disconnected',
      differentialCm: null,
      shouldActivateBeacon: false,
    };
  }

  // Ultrasonic physical range validation (standard JSN-SR04T / A02YYUW blind zone is < 20cm, max 450cm)
  if (
    farmSensor.levelCm < 0 ||
    farmSensor.levelCm > 450 ||
    downstreamSensor.levelCm < 0 ||
    downstreamSensor.levelCm > 450
  ) {
    return {
      riskLevel: 'SENSOR_FAULT',
      severity: 'WARNING',
      reason: 'Sensor reading is outside valid physical measurement limits (0–450 cm). Transducer displaced or obstructed.',
      triggerCondition: 'Out-of-range ultrasonic reading detected',
      differentialCm: null,
      shouldActivateBeacon: false,
    };
  }

  if (farmSensor.status === 'STALE' || downstreamSensor.status === 'STALE') {
    return {
      riskLevel: 'SENSOR_FAULT',
      severity: 'WARNING',
      reason: `Sensor telemetry has not updated in over ${thresholds.staleDataTimeoutMinutes} minutes. Communication link degraded.`,
      triggerCondition: `Telemetry timeout (> ${thresholds.staleDataTimeoutMinutes}m stale)`,
      differentialCm: null,
      shouldActivateBeacon: false,
    };
  }

  const farmLevel = farmSensor.levelCm;
  const downstreamLevel = downstreamSensor.levelCm;
  const differential = computeDifferential(farmLevel, downstreamLevel)!;

  // Rule 2: Float switch backup trip
  if (floatSwitch.status === 'TRIPPED') {
    return {
      riskLevel: 'CRITICAL',
      severity: 'CRITICAL',
      reason: `Independent mechanical high-water float switch TRIPPED! Immediate high-water alert independently verified.`,
      triggerCondition: 'Mechanical high-water float switch contact closed',
      differentialCm: differential,
      shouldActivateBeacon: true,
    };
  }

  // Rule 3: Critical Inundation / Submergence Level
  if (farmLevel >= thresholds.submergenceCriticalCm || freeboardCm <= 10) {
    return {
      riskLevel: 'CRITICAL',
      severity: 'CRITICAL',
      reason: `Farm water level (${farmLevel} cm) breached critical submergence limit (${thresholds.submergenceCriticalCm} cm) or freeboard depleted (${freeboardCm} cm). Inundation of crop root zones underway.`,
      triggerCondition: `Farm level ≥ ${thresholds.submergenceCriticalCm} cm OR freeboard ≤ 10 cm`,
      differentialCm: differential,
      shouldActivateBeacon: true,
    };
  }

  // Rule 4: Danger Level: Severe Backflow OR Severe Blockage + Rising Head
  if (differential <= thresholds.backflowDifferentialThresholdCm || flowSensor.direction === 'REVERSED') {
    return {
      riskLevel: 'DANGER',
      severity: 'CRITICAL',
      reason: `Downstream canal level (${downstreamLevel} cm) is higher than farm intake (${farmLevel} cm) by ${Math.abs(differential)} cm. Reverse backflow pushing canal drainage back into agricultural land.`,
      triggerCondition: `Differential head Δh ≤ ${thresholds.backflowDifferentialThresholdCm} cm / Reverse flow`,
      differentialCm: differential,
      shouldActivateBeacon: true,
    };
  }

  // Rule 5: Danger Level: Severe Blockage with restricted velocity
  if (
    differential > thresholds.blockageDifferentialThresholdCm &&
    flowSensor.velocityMs < thresholds.flowVelocityMinThresholdMs
  ) {
    return {
      riskLevel: 'DANGER',
      severity: 'CRITICAL',
      reason: `Severe drainage blockage detected. Differential head expanded to +${differential} cm (threshold ${thresholds.blockageDifferentialThresholdCm} cm) while velocity collapsed to ${flowSensor.velocityMs} m/s (minimum ${thresholds.flowVelocityMinThresholdMs} m/s).`,
      triggerCondition: `Differential Δh ≥ ${thresholds.blockageDifferentialThresholdCm} cm AND velocity < ${thresholds.flowVelocityMinThresholdMs} m/s`,
      differentialCm: differential,
      shouldActivateBeacon: true,
    };
  }

  // Rule 6: Danger Level: Critical Flash Inflow Surge
  if (rateOfRiseCmHr >= thresholds.rateOfRiseCriticalCmHr) {
    return {
      riskLevel: 'DANGER',
      severity: 'CRITICAL',
      reason: `Flash storm runoff surge: Water level accumulating at +${rateOfRiseCmHr} cm/hr, exceeding critical threshold (${thresholds.rateOfRiseCriticalCmHr} cm/hr). Immediate culvert gate hoisting required.`,
      triggerCondition: `Rate of rise ≥ ${thresholds.rateOfRiseCriticalCmHr} cm/hr`,
      differentialCm: differential,
      shouldActivateBeacon: true,
    };
  }

  // Rule 7: Warning Level: Submergence Warning or High Inflow Warning
  if (farmLevel >= thresholds.submergenceWarningCm || rateOfRiseCmHr >= thresholds.rateOfRiseWarningCmHr) {
    return {
      riskLevel: 'WARNING',
      severity: 'WARNING',
      reason:
        farmLevel >= thresholds.submergenceWarningCm
          ? `Farm water level (${farmLevel} cm) crossed elevated caution limit (${thresholds.submergenceWarningCm} cm). Dig furrow drains to protect seedlings.`
          : `Water level rising at +${rateOfRiseCmHr} cm/hr, crossing warning threshold (${thresholds.rateOfRiseWarningCmHr} cm/hr).`,
      triggerCondition:
        farmLevel >= thresholds.submergenceWarningCm
          ? `Farm level ≥ ${thresholds.submergenceWarningCm} cm`
          : `Rate of rise ≥ ${thresholds.rateOfRiseWarningCmHr} cm/hr`,
      differentialCm: differential,
      shouldActivateBeacon: false,
    };
  }

  // Rule 8: Elevated Level: Moderate Rate of Rise or Constricted Velocity
  const elevatedRiseThreshold = Number((thresholds.rateOfRiseWarningCmHr * 0.6).toFixed(1));
  if (rateOfRiseCmHr >= elevatedRiseThreshold || (flowSensor.direction === 'REDUCED' && differential > 8)) {
    return {
      riskLevel: 'ELEVATED',
      severity: 'LOW',
      reason: `Elevated drainage volume: water rising at +${rateOfRiseCmHr} cm/hr with constricted discharge velocity (${flowSensor.velocityMs} m/s).`,
      triggerCondition: `Rate of rise ≥ ${elevatedRiseThreshold} cm/hr OR constricted discharge`,
      differentialCm: differential,
      shouldActivateBeacon: false,
    };
  }

  // Rule 9: Normal Gravity Drainage
  return {
    riskLevel: 'NORMAL',
    severity: 'LOW',
    reason: `Normal gravitational outflow: farm level (${farmLevel} cm) is +${differential} cm above downstream outfall (${downstreamLevel} cm) with steady velocity (${flowSensor.velocityMs} m/s).`,
    triggerCondition: 'Parameters within nominal design envelope',
    differentialCm: differential,
    shouldActivateBeacon: false,
  };
}

/**
 * Checks whether a previously alarmed node has returned to safe operational parameters,
 * meeting the criteria to clear warnings and trigger the beacon hold timer.
 */
export function checkMitigationEligibility(
  farmLevelCm: number,
  differentialCm: number,
  flowVelocityMs: number,
  rateOfRiseCmHr: number,
  thresholds: RiskThresholdConfig = DEFAULT_THRESHOLDS
): boolean {
  return (
    farmLevelCm < thresholds.submergenceWarningCm - 5 && // Hysteresis: 5cm below warning threshold
    differentialCm > 4.0 && // Positive gravitational head
    flowVelocityMs >= thresholds.flowVelocityMinThresholdMs && // Flow velocity restored
    rateOfRiseCmHr <= 0.5 // Water level stable or receding
  );
}
