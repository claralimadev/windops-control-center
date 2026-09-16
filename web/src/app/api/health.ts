export type ApiHealthStatus = 'checking' | 'online' | 'offline';

export interface Health {
  status: string;
}