import type { Telemetry } from './telemetry';
import type { Alert } from './alert';

export interface TelemetryCreated {
  telemetry: Telemetry;
  alert?: Alert;
}