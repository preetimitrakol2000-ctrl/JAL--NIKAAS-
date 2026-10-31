import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDifferential,
  computeRateOfRise,
  evaluateLocationRisk,
  classifyHydraulicState,
  diagnoseBlockage,
  DEFAULT_THRESHOLDS,
} from './riskEngine';
import { SensorPoint, FlowSensorData, FloatSwitchBackup } from '../types';

const mockBaseSensor = (id: string, type: 'FARM_SIDE' | 'DOWNSTREAM_CANAL', levelCm: number | null): SensorPoint => ({
  id,
  name: `Sensor ${id}`,
  type,
  levelCm,
  status: levelCm === null ? 'FAULT' : 'OK',
  batteryPct: 95,
  signalDbm: -72,
  tempC: 28.5,
  lastReadingTime: new Date().toISOString(),
});

const mockFlowSensor = (velocityMs = 0.45, direction: any = 'DOWNSTREAM'): FlowSensorData => ({
  velocityMs,
  dischargeLs: Math.round(velocityMs * 1000),
  dischargeM3s: Number((velocityMs).toFixed(2)),
  direction,
  rateOfChangeVelocity: 0.0,
  isDirectlyMeasured: true,
  sensorTechnology: 'Non-Contact Radar Velocity Sensor',
  status: 'OK',
});

const mockFloatSwitch: FloatSwitchBackup = { status: 'NORMAL' };

test('computeDifferential calculates farm minus downstream level accurately', () => {
  assert.equal(computeDifferential(40, 25), 15);
  assert.equal(computeDifferential(30, 35), -5);
  assert.equal(computeDifferential(null, 25), null);
  assert.equal(computeDifferential(30, null), null);
});

test('computeRateOfRise correctly calculates cm per hour', () => {
  const now = Date.now();
  const history = [
    { timestamp: new Date(now - 3600 * 1000).toISOString(), farmLevel: 20 },
    { timestamp: new Date(now).toISOString(), farmLevel: 28 },
  ];
  const rate = computeRateOfRise(history);
  assert.equal(Math.round(rate), 8);
});

test('evaluateLocationRisk identifies SENSOR_FAULT when telemetry is missing or faulted', () => {
  const farmSensor = mockBaseSensor('F1', 'FARM_SIDE', null);
  const downstreamSensor = mockBaseSensor('D1', 'DOWNSTREAM_CANAL', 30);
  
  const result = evaluateLocationRisk(farmSensor, downstreamSensor, mockFlowSensor(), 0, mockFloatSwitch, 120);
  assert.equal(result.riskLevel, 'SENSOR_FAULT');
  assert.match(result.reason, /telemetry is missing/i);
});

test('evaluateLocationRisk catches out-of-physical-range readings', () => {
  const farmSensor = mockBaseSensor('F1', 'FARM_SIDE', 600); // Beyond 450cm
  const downstreamSensor = mockBaseSensor('D1', 'DOWNSTREAM_CANAL', 30);
  
  const result = evaluateLocationRisk(farmSensor, downstreamSensor, mockFlowSensor(), 0, mockFloatSwitch, 120);
  assert.equal(result.riskLevel, 'SENSOR_FAULT');
  assert.match(result.reason, /outside valid physical measurement limits/i);
});

test('evaluateLocationRisk detects CRITICAL SUBMERGENCE when water level breaches threshold', () => {
  const farmSensor = mockBaseSensor('F1', 'FARM_SIDE', 82); // > 75cm
  const downstreamSensor = mockBaseSensor('D1', 'DOWNSTREAM_CANAL', 60);
  
  const result = evaluateLocationRisk(farmSensor, downstreamSensor, mockFlowSensor(), 1.2, mockFloatSwitch, 38);
  assert.equal(result.riskLevel, 'CRITICAL');
  assert.equal(result.severity, 'CRITICAL');
  assert.equal(result.shouldActivateBeacon, true);
});

test('evaluateLocationRisk detects DANGER when downstream level exceeds farm level', () => {
  const farmSensor = mockBaseSensor('F1', 'FARM_SIDE', 45);
  const downstreamSensor = mockBaseSensor('D1', 'DOWNSTREAM_CANAL', 52); // 7cm higher!
  
  const result = evaluateLocationRisk(farmSensor, downstreamSensor, mockFlowSensor(-0.12, 'REVERSED'), 0.5, mockFloatSwitch, 75);
  assert.equal(result.riskLevel, 'DANGER');
  assert.equal(result.severity, 'CRITICAL');
  assert.match(result.reason, /Reverse backflow/i);
});

test('evaluateLocationRisk reports NORMAL when gradient is positive and within limits', () => {
  const farmSensor = mockBaseSensor('F1', 'FARM_SIDE', 35);
  const downstreamSensor = mockBaseSensor('D1', 'DOWNSTREAM_CANAL', 25);
  
  const result = evaluateLocationRisk(farmSensor, downstreamSensor, mockFlowSensor(), 0.2, mockFloatSwitch, 95);
  assert.equal(result.riskLevel, 'NORMAL');
  assert.equal(result.severity, 'LOW');
  assert.equal(result.shouldActivateBeacon, false);
});

test('diagnoseBlockage detects high differential with collapsed velocity', () => {
  const diag = diagnoseBlockage('JN-004', 'Kakdwip', 'Segment B1', 'JN-004 to JN-005', 260, 103.5, 78.0, 25.5, 0.12, 140, 4.8);
  assert.equal(diag.severity, 'CRITICAL_FAILURE');
  assert.ok(diag.confidenceScore > 85);
  assert.ok(diag.supportingEvidence.length >= 2);
});

test('evaluateLocationRisk detects DANGER on flash storm surge rate of rise >= rateOfRiseCriticalCmHr', () => {
  const farmSensor = mockBaseSensor('F1', 'FARM_SIDE', 40);
  const downstreamSensor = mockBaseSensor('D1', 'DOWNSTREAM_CANAL', 25);
  
  // Rate of rise 9.5 cm/hr exceeds default critical threshold (8.0 cm/hr)
  const result = evaluateLocationRisk(farmSensor, downstreamSensor, mockFlowSensor(0.6), 9.5, mockFloatSwitch, 120);
  assert.equal(result.riskLevel, 'DANGER');
  assert.equal(result.severity, 'CRITICAL');
  assert.equal(result.shouldActivateBeacon, true);
  assert.match(result.reason, /Flash storm runoff surge/i);
});

test('evaluateLocationRisk detects WARNING when water level breaches submergenceWarningCm', () => {
  const farmSensor = mockBaseSensor('F1', 'FARM_SIDE', 55); // 55 cm >= warning 50 cm
  const downstreamSensor = mockBaseSensor('D1', 'DOWNSTREAM_CANAL', 40);
  
  const result = evaluateLocationRisk(farmSensor, downstreamSensor, mockFlowSensor(0.4), 1.0, mockFloatSwitch, 105);
  assert.equal(result.riskLevel, 'WARNING');
  assert.equal(result.severity, 'WARNING');
  assert.equal(result.shouldActivateBeacon, false);
  assert.match(result.reason, /crossed elevated caution limit/i);
});

test('evaluateLocationRisk dynamically re-evaluates when custom thresholds are passed', () => {
  const farmSensor = mockBaseSensor('F1', 'FARM_SIDE', 60);
  const downstreamSensor = mockBaseSensor('D1', 'DOWNSTREAM_CANAL', 45);
  
  // Under DEFAULT_THRESHOLDS (critical 75cm), 60cm is only WARNING (exceeds warning 50cm)
  const defaultResult = evaluateLocationRisk(farmSensor, downstreamSensor, mockFlowSensor(), 0.5, mockFloatSwitch, 100);
  assert.equal(defaultResult.riskLevel, 'WARNING');

  // Under sensitive vegetable preset (critical 55cm), 60cm breaches critical!
  const sensitiveThresholds = {
    ...DEFAULT_THRESHOLDS,
    submergenceCriticalCm: 55,
    submergenceWarningCm: 35,
  };
  const sensitiveResult = evaluateLocationRisk(farmSensor, downstreamSensor, mockFlowSensor(), 0.5, mockFloatSwitch, 100, sensitiveThresholds);
  assert.equal(sensitiveResult.riskLevel, 'CRITICAL');
  assert.equal(sensitiveResult.shouldActivateBeacon, true);
});

test('evaluateLocationRisk triggers CRITICAL when float switch is tripped regardless of ultrasonic levels', () => {
  const farmSensor = mockBaseSensor('F1', 'FARM_SIDE', 30);
  const downstreamSensor = mockBaseSensor('D1', 'DOWNSTREAM_CANAL', 20);
  const trippedSwitch: FloatSwitchBackup = { status: 'TRIPPED', lastTrippedAt: new Date().toISOString() };
  
  const result = evaluateLocationRisk(farmSensor, downstreamSensor, mockFlowSensor(), 0.1, trippedSwitch, 130);
  assert.equal(result.riskLevel, 'CRITICAL');
  assert.equal(result.severity, 'CRITICAL');
  assert.equal(result.shouldActivateBeacon, true);
  assert.match(result.reason, /high-water float switch TRIPPED/i);
});

