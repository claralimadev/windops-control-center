export type AlertSeverity = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface Alert {
  id: string;
  assetId: string;
  severity: AlertSeverity;
  type: string;
  message: string;
  timestamp: string;
}

export const ALERT_SEVERITY_LABEL: Record<AlertSeverity, string> = {
  NORMAL: 'Normal',
  WARNING: 'Atenção',
  CRITICAL: 'Crítico',
};