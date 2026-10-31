/**
 * Jal-Nikaas: Agro-Drain Type Definitions
 * Upgraded Multi-Node Drainage Intelligence & Agricultural Waterlogging Early-Warning Platform
 */

export type RiskLevel =
  | 'NORMAL'
  | 'ELEVATED'
  | 'WARNING'
  | 'DANGER'
  | 'CRITICAL'
  | 'SENSOR_FAULT'
  | 'BACKFLOW_RISK'
  | 'SUBMERGENCE_ALERT';

export type HydraulicState =
  | 'RECEDING'
  | 'STEADY'
  | 'RISING'
  | 'OVERFLOWING'
  | 'BACKFLOWING';

export type FlowDirection =
  | 'DOWNSTREAM'
  | 'REDUCED'
  | 'REVERSED'
  | 'STATIC'
  | 'UNKNOWN';

export type BlockageSeverity =
  | 'NORMAL'
  | 'POSSIBLE_OBSTRUCTION'
  | 'MODERATE_BLOCKAGE'
  | 'SEVERE_BLOCKAGE'
  | 'CRITICAL_FAILURE';

export type AlertSeverity = 'LOW' | 'WARNING' | 'CRITICAL';

export type Language = 'en' | 'bn' | 'hi';

export type UserRole = 'farmer' | 'officer';

export type FarmerTab =
  | 'home'
  | 'field'
  | 'alerts'
  | 'recommendations'
  | 'map'
  | 'settings';

export type OfficerTab =
  | 'overview'
  | 'monitoring'
  | 'gis'
  | 'alerts'
  | 'crops'
  | 'farmers'
  | 'reports';

export interface PanchayatContact {
  gramPanchayatName: string;
  block: string;
  district: string;
  pradhanName: string;
  secretaryName: string;
  contactPhone: string;
  emergencyDesk: string;
}

export interface AgriculturalArea {
  id: string; // e.g. LOC-DHR-A
  code: string; // Locality A, B, C, D
  name: string;
  localNameBengali: string;
  localNameHindi: string;
  district: string;
  block: string;
  locationId: string; // Primary node ID
  nodeIds: string[]; // 3 nodes per locality
  coordinates: {
    lat: number;
    lng: number;
  };
  svgPolygon: Array<[number, number]>;
  acreageHectares: number;
  farmerCount: number;
  primaryCropIds: string[];
  canalJunction: string;
  drainageOutfall: string;
  elevationMeters: number;
  soilType: string;
  panchayat: PanchayatContact;
}

export interface BlockageDiagnosis {
  confidenceScore: number; // 0 - 100%
  severity: BlockageSeverity;
  affectedSegment: string;
  segmentInterval: string;
  estimatedDistanceMeters?: number;
  supportingEvidence: string[];
  detectionTime: string;
  recommendedAction: string;
  isCleared?: boolean;
}

export interface FlowSensorData {
  velocityMs: number;
  dischargeM3s: number;
  dischargeLs: number;
  direction: FlowDirection;
  rateOfChangeVelocity: number; // m/s²
  isDirectlyMeasured: boolean;
  sensorTechnology: string; // 'Non-Contact Radar Velocity Sensor' | 'Acoustic Doppler Submerged'
  status: 'OK' | 'STALE' | 'FAULT';
}

export interface BeaconState {
  isActive: boolean;
  mode: 'OFF' | 'FLASHING_AMBER' | 'FLASHING_RED';
  buzzerActive: boolean;
  activatedAt?: string;
  holdSecondsRemaining?: number;
  lastMitigatedAt?: string;
}

export interface GsmModuleState {
  status: 'ONLINE' | 'POOR_SIGNAL' | 'DISCONNECTED' | 'QUEUED_OFFLINE';
  signalDbm: number;
  signalBars: number;
  network: '4G LTE' | '2G GSM';
  simStatus: 'INSERTED_ACTIVE' | 'ERROR';
  queuedCount: number;
}

export interface FloatSwitchBackup {
  status: 'NORMAL' | 'TRIPPED';
  lastTrippedAt?: string;
}

export interface SensorPoint {
  id: string;
  name: string;
  type: 'FARM_SIDE' | 'DOWNSTREAM_CANAL';
  levelCm: number | null;
  status: 'OK' | 'STALE' | 'FAULT';
  batteryPct: number;
  signalDbm: number;
  tempC: number;
  lastReadingTime: string;
}

export interface TelemetryPoint {
  timestamp: string;
  farmLevel: number;
  downstreamLevel: number;
  differential: number;
  flowVelocityMs: number;
  dischargeLs: number;
  rainfallMm?: number;
  hydraulicState?: HydraulicState;
  riskLevel?: RiskLevel;
}

export interface CropInfo {
  id: string;
  name: string;
  localNameBengali: string;
  localNameHindi: string;
  stage: string;
  maxStandingWaterCm: number;
  criticalHours: number;
  currentRisk: RiskLevel;
  hoursWaterlogged: number;
  description: string;
  actionAdvice: string;
  actionAdviceBengali: string;
  actionAdviceHindi: string;
}

export interface LocationData {
  id: string; // e.g. LOC-JN-001
  nodeCode: string; // e.g. JN-001
  name: string;
  localNameBengali: string;
  localNameHindi: string;
  localityId: string; // e.g. LOC-DHR-A
  localityName: string;
  district: string;
  block: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  totalChannelDepthCm: number;
  rawSensorDistanceCm: number;
  freeboardCm: number;
  channelCapacityPct: number;
  farmSideSensor: SensorPoint;
  downstreamSensor: SensorPoint;
  differentialLevelCm: number;
  rateOfRiseCmHr: number;
  hydraulicState: HydraulicState;
  hydraulicReason: string;
  riskLevel: RiskLevel;
  riskReason: string;
  flowSensor: FlowSensorData;
  beaconState: BeaconState;
  gsmState: GsmModuleState;
  floatSwitch: FloatSwitchBackup;
  blockageDiagnosis: BlockageDiagnosis;
  panchayat: PanchayatContact;
  primaryCrops: string[];
  cropVulnerability: CropInfo[];
  associatedPlotIds: string[];
  lastUpdated: string;
  history: TelemetryPoint[];
  sluiceGateStatus: 'OPEN' | 'PARTIAL' | 'CLOSED' | 'CHOKED';
  canalType: 'MAIN_OUTFALL' | 'BRANCH_DRAIN' | 'FIELD_COLLECTOR' | 'SIPHON_CULVERT';
  elevationMeters: number;
}

export interface FarmerRecord {
  id: string;
  name: string;
  phone: string;
  localityId: string;
  localityName: string;
  plotIds: string[];
  primaryCrop: string;
  language: Language;
  notificationMethod: 'SMS_AND_IVR' | 'SMS_ONLY' | 'IVR_ONLY';
  registeredAt: string;
}

export interface AgriculturalPlot {
  id: string;
  name: string;
  localityId: string;
  localityName: string;
  nodeCode: string;
  farmerId: string;
  farmerName: string;
  acreageHectares: number;
  elevationMeters: number;
  soilType: string;
  cropId: string;
  cropName: string;
  cropStage: string;
  maxStandingWaterCm: number;
  criticalHours: number;
  currentWaterDepthCm: number;
  hoursWaterlogged: number;
  hoursToCriticalDamage: number | null;
  currentStatus: 'SAFE' | 'AT_RISK' | 'CRITICAL_WATERLOGGED' | 'RECEDING';
}

export interface WorkOrder {
  id: string;
  nodeCode: string;
  nodeName: string;
  localityId: string;
  localityName: string;
  segment: string;
  severity: BlockageSeverity;
  suspectedLocation: string;
  supportingEvidence: string[];
  assignedPersonnel: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'CLEARED';
  createdAt: string;
  resolvedAt?: string;
  notes: string;
}

export interface CommunicationLogItem {
  id: string;
  recipientType: 'FARMER' | 'PANCHAYAT';
  recipientName: string;
  phone: string;
  nodeCode: string;
  localityName: string;
  channel: 'SMS' | 'IVR';
  language: Language;
  messageType: 'DANGER_ALERT' | 'WARNING_ALERT' | 'MITIGATION_NOTICE' | 'WORK_ORDER';
  messageContent: string;
  status: 'DELIVERED' | 'RETRYING' | 'QUEUED_OFFLINE' | 'FAILED';
  retryCount: number;
  timestamp: string;
}

export interface AlertItem {
  id: string;
  nodeCode: string;
  locationId: string;
  locationName: string;
  localityName: string;
  category: RiskLevel;
  severity: AlertSeverity;
  triggerCondition: string;
  readings: {
    farmLevel: number | null;
    downstreamLevel: number | null;
    differential: number | null;
    rateOfRise: number;
    flowVelocityMs?: number;
    dischargeLs?: number;
  };
  timestamp: string;
  recommendedAction: string;
  recommendedActionBengali: string;
  recommendedActionHindi: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  mitigated?: boolean;
  mitigatedAt?: string;
  notes?: string;
  workOrderId?: string;
}

export interface HistoricalIncident {
  id: string; // e.g. INC-2025-081
  nodeCode?: string;
  areaId: string;
  incidentType: 'BACKFLOW' | 'INUNDATION' | 'SILTATION_BLOCK' | 'STORM_SURGE';
  startDate: string;
  endDate: string;
  durationHours: number;
  severity: AlertSeverity;
  peakWaterLevelCm: number;
  peakDischargeLs?: number;
  description: string;
  cause: string;
  intervention: string;
  outcome: string;
}

export interface HistoricalEvent {
  id: string;
  nodeCode?: string;
  areaId: string;
  timestamp: string;
  eventType: 'WATER_RISE' | 'BACKFLOW' | 'SUBMERGENCE' | 'BLOCKAGE' | 'RESOLVED' | 'BEACON_ACTIVATED' | 'BEACON_CLEARED';
  title: string;
  details: string;
  severity: AlertSeverity;
}

export interface AreaRecommendation {
  id: string;
  areaId: string;
  nodeCode?: string;
  riskLevel: RiskLevel;
  farmerAdvisory: string;
  farmerAdvisoryBengali: string;
  farmerAdvisoryHindi: string;
  panchayatAction: string;
  panchayatActionBengali: string;
  panchayatActionHindi: string;
  municipalAction?: string;
  municipalActionBengali?: string;
  municipalActionHindi?: string;
  urgency: 'NORMAL' | 'HIGH' | 'EMERGENCY';
  timestamp: string;
}

export interface RiskThresholdConfig {
  submergenceCriticalCm: number;
  submergenceWarningCm: number;
  backflowDifferentialThresholdCm: number;
  rateOfRiseCriticalCmHr: number;
  rateOfRiseWarningCmHr: number;
  flowVelocityMinThresholdMs: number;
  blockageDifferentialThresholdCm: number;
  beaconClearanceHoldSec: number;
  staleDataTimeoutMinutes: number;
}

