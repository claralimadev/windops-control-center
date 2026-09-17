export type AssetType = 'WIND_TURBINE' | 'SOLAR_ARRAY';
export type AssetStatus = 'ONLINE' | 'ATTENTION' | 'MAINTENANCE' | 'OFFLINE';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  ratedPowerMw: number;
  location: string;
}

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  WIND_TURBINE: 'Aerogerador',
  SOLAR_ARRAY: 'Painel solar',
};

export const ASSET_STATUS_LABEL: Record<AssetStatus, string> = {
  ONLINE: 'Operando',
  ATTENTION: 'Atenção',
  MAINTENANCE: 'Manutenção',
  OFFLINE: 'Parado',
};